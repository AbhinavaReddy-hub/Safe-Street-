# from fastapi import FastAPI
# from pymongo import MongoClient
# from transformers import DetrImageProcessor, DetrForObjectDetection, DetrConfig
# from safetensors.torch import load_file
# from PIL import Image
# import requests
# import io
# import torch
# from torchvision.ops import nms
# import logging
# import numpy as np
# from tensorflow.keras.models import load_model
# from uuid import uuid4
# from math import radians, cos, sin, sqrt, atan2
# import h3


# app = FastAPI()
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger("main")

# MONGO_URI = "mongodb+srv://safestreet:abcd@safestreet.n7escz5.mongodb.net/?retryWrites=true&w=majority&appName=SafeStreet"
# client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
# db = client["test"]
# reports_collection = db["reports"]
# batches_collection = db["batchReports"]

# cnn_model_path = "road_classifier_model (1).keras"
# road_classifier = load_model(cnn_model_path)
# cnn_input_size = (224, 224)

# processor = DetrImageProcessor.from_pretrained("facebook/detr-resnet-50")
# config = DetrConfig.from_pretrained("facebook/detr-resnet-50", num_labels=9)
# model = DetrForObjectDetection(config)
# model_path = r"C:\\Users\\avana\\Downloads\\vit_detr_3__model.safetensors"
# state_dict = load_file(model_path)
# model.load_state_dict(state_dict)
# model.eval()
# device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
# model.to(device)

# label_to_damage_type = {
#     0: "crack", 1: "crack", 2: "crack", 3: "crack",
#     4: "patch", 5: "pothole", 6: "patch", 7: "patch", 8: "crack"
# }
# severity_weights = {"low": 1, "medium": 2, "high": 3}


# def area_to_severity(area: float) -> str:
#     if area > 50000:
#         return "high"
#     elif area >= 10000:
#         return "medium"
#     else:
#         return "low"


# def haversine(lat1, lon1, lat2, lon2):
#     R = 6371000
#     dlat = radians(lat2 - lat1)
#     dlon = radians(lon2 - lon1)
#     a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
#     return R * 2 * atan2(sqrt(a), sqrt(1 - a))


# def predict_image(url: str):
#     try:
#         response = requests.get(url)
#         if response.status_code != 200:
#             return None
#         image = Image.open(io.BytesIO(response.content)).convert("RGB")
#         img_resized = image.resize(cnn_input_size)
#         img_array = np.array(img_resized) / 255.0
#         img_array = np.expand_dims(img_array, axis=0)
#         if road_classifier.predict(img_array)[0][0] < 0:
#             return {"status": "invalid_image"}
#         inputs = processor(images=image, return_tensors="pt").to(device)
#         with torch.no_grad():
#             outputs = model(**inputs)
#         results = processor.post_process_object_detection(outputs, target_sizes=[image.size[::-1]], threshold=0.1)[0]
#         boxes, scores, labels = results["boxes"], results["scores"], results["labels"]
#         keep = nms(boxes, scores, iou_threshold=0.5)
#         boxes, scores, labels = boxes[keep], scores[keep], labels[keep]
#         best = None
#         for score, label, box in zip(scores, labels, boxes):
#             if label.item() >= 9:
#                 continue
#             area = (box[2] - box[0]) * (box[3] - box[1])
#             severity = area_to_severity(area)
#             weight = severity_weights[severity]
#             damage_type = label_to_damage_type.get(label.item(), "unknown")
#             candidate = {
#                 "damageType": damage_type,
#                 "severity": severity,
#                 "confidenceScore": round(score.item(), 3),
#                 "severityWeight": weight
#             }
#             if (not best) or (weight > best["severityWeight"]) or \
#                (weight == best["severityWeight"] and score > best["confidenceScore"]):
#                 best = candidate
#         return best
#     except Exception:
#         return None


# @app.get("/batch-analyze")
# def batch_analyze():
#     logger.info("🔍 Starting batch analysis")
#     pending = list(reports_collection.find({"status": "pending"}))
#     logger.info(f"Found {len(pending)} pending reports")

#     valid_reports = [r for r in pending if "location" in r and "coordinates" in r["location"]]
#     logger.info(f"{len(valid_reports)} reports have valid location info")

#     # Haversine-based clustering
#     DISTANCE_THRESHOLD = 100  # meters
#     clusters = {}
#     for report in valid_reports:
#         try:
#             lon, lat = report["location"]["coordinates"]  # GeoJSON uses [lon, lat]
#             assigned = False
#             for cluster_id, cluster_reports in clusters.items():
#                 # Use the first report's coordinates as the cluster center
#                 cluster_center = cluster_reports[0]["location"]["coordinates"]
#                 center_lon, center_lat = cluster_center
#                 distance = haversine(lat, lon, center_lat, center_lon)
#                 if distance <= DISTANCE_THRESHOLD:
#                     clusters[cluster_id].append(report)
#                     assigned = True
#                     break
#             if not assigned:
#                 # Create a new cluster with a unique ID
#                 cluster_id = str(uuid4())
#                 clusters[cluster_id] = [report]
#         except Exception as e:
#             logger.warning(f"Skipping report due to location error: {e}")

#     for cluster_id, group in clusters.items():
#         logger.info(f"Cluster {cluster_id} has {len(group)} reports")
#         results = []
#         for case in group:
#             best = None
#             for url in case.get("imageUrls", []):
#                 pred = predict_image(url)
#                 if pred and pred.get("status") != "invalid_image":
#                     if (not best) or (pred["severityWeight"] > best["severityWeight"]) or \
#                        (pred["severityWeight"] == best["severityWeight"] and pred["confidenceScore"] > best["confidenceScore"]):
#                         best = pred
#             if best:
#                 best["priorityScore"] = round(best["severityWeight"] * case.get("trafficCongestionScore", 1.0), 2)
#                 case["finalPrediction"] = best
#                 results.append(case)

#         if results:
#             logger.info(f"✅ Finalizing {len(results)} analyzed reports for cluster {cluster_id}")
#             final = max((r["finalPrediction"] for r in results), key=lambda x: (x["severityWeight"], x["confidenceScore"]))
#             case_ids = [r["caseId"] for r in results]
#             for cid in case_ids:
#                 reports_collection.update_one({"caseId": cid}, {"$set": {
#                     "damageType": final["damageType"],
#                     "severity": final["severity"],
#                     "confidenceScore": final["confidenceScore"],
#                     "priorityScore": final["priorityScore"],
#                     "status": "analyzed"
#                 }})
#             centroid_lat = sum(r["location"]["coordinates"][1] for r in results) / len(results)
#             centroid_lon = sum(r["location"]["coordinates"][0] for r in results) / len(results)
#             batches_collection.insert_one({
#                 "batchId": str(uuid4()),
#                 "caseIds": case_ids,
#                 "centroid": {"latitude": centroid_lat, "longitude": centroid_lon},
#                 "damageResult": final,
#                 "reportCount": len(results)
#             })
#         else:
#             logger.info(f"❌ No valid predictions in cluster {cluster_id}")

#     return {"status": "done"}


from fastapi import FastAPI
from pymongo import MongoClient
from transformers import DetrImageProcessor, DetrForObjectDetection, DetrConfig
from safetensors.torch import load_file
from PIL import Image
import requests
import io
import torch
from torchvision.ops import nms
import logging
import numpy as np
from tensorflow.keras.models import load_model
from uuid import uuid4
import h3

app = FastAPI()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

MONGO_URI = "mongodb+srv://safestreet:abcd@safestreet.n7escz5.mongodb.net/?retryWrites=true&w=majority&appName=SafeStreet"
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = client["test"]
reports_collection = db["reports"]
batches_collection = db["batchReports"]

cnn_model_path = "road_classifier_model (1).keras"
road_classifier = load_model(cnn_model_path)
cnn_input_size = (224, 224)

processor = DetrImageProcessor.from_pretrained("facebook/detr-resnet-50")
config = DetrConfig.from_pretrained("facebook/detr-resnet-50", num_labels=9)
model = DetrForObjectDetection(config)
model_path = r"C:\Users\avana\Downloads\vit_detr_3__model.safetensors"
state_dict = load_file(model_path)
model.load_state_dict(state_dict)
model.eval()
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

label_to_damage_type = {
    0: "crack", 1: "crack", 2: "crack", 3: "crack",
    4: "patch", 5: "pothole", 6: "patch", 7: "patch", 8: "crack"
}
severity_weights = {"low": 1, "medium": 2, "high": 3}

def area_to_severity(area: float) -> str:
    if area > 50000:
        return "high"
    elif area >= 10000:
        return "medium"
    else:
        return "low"

def predict_image(url: str):
    try:
        response = requests.get(url)
        if response.status_code != 200:
            return None
        image = Image.open(io.BytesIO(response.content)).convert("RGB")
        img_resized = image.resize(cnn_input_size)
        img_array = np.array(img_resized) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        if road_classifier.predict(img_array)[0][0] < 0:
            return {"status": "invalid_image"}
        inputs = processor(images=image, return_tensors="pt").to(device)
        with torch.no_grad():
            outputs = model(**inputs)
        results = processor.post_process_object_detection(outputs, target_sizes=[image.size[::-1]], threshold=0.1)[0]
        boxes, scores, labels = results["boxes"], results["scores"], results["labels"]
        keep = nms(boxes, scores, iou_threshold=0.5)
        boxes, scores, labels = boxes[keep], scores[keep], labels[keep]
        best = None
        for score, label, box in zip(scores, labels, boxes):
            if label.item() >= 9:
                continue
            area = (box[2] - box[0]) * (box[3] - box[1])
            severity = area_to_severity(area)
            weight = severity_weights[severity]
            damage_type = label_to_damage_type.get(label.item(), "unknown")
            candidate = {
                "damageType": damage_type,
                "severity": severity,
                "confidenceScore": round(score.item(), 3),
                "severityWeight": weight
            }
            if (not best) or (weight > best["severityWeight"]) or \
               (weight == best["severityWeight"] and score > best["confidenceScore"]):
                best = candidate
        return best
    except Exception:
        return None

@app.get("/batch-analyze")
def batch_analyze():
    logger.info("🔍 Starting batch analysis")
    pending = list(reports_collection.find({"status": "pending"}))
    logger.info(f"Found {len(pending)} pending reports")

    valid_reports = [r for r in pending if "location" in r and "coordinates" in r["location"]]
    logger.info(f"{len(valid_reports)} reports have valid location info")

    # H3-based clustering
    H3_RESOLUTION = 12  # ~153m edge length, comparable to 100m radius
    clusters = {}
    for report in valid_reports:
        try:
            lon, lat = report["location"]["coordinates"]  # GeoJSON: [lon, lat]
            # Convert to H3 cell ID
            cell_id = h3.latlng_to_cell(lat, lon, H3_RESOLUTION)
            if cell_id not in clusters:
                clusters[cell_id] = []
            clusters[cell_id].append(report)
        except Exception as e:
            logger.warning(f"Skipping report due to location error: {e}")

    for cluster_id, group in clusters.items():
        logger.info(f"Cluster {cluster_id} has {len(group)} reports")
        results = []
        for case in group:
            best = None
            for url in case.get("imageUrls", []):
                pred = predict_image(url)
                if pred and pred.get("status") != "invalid_image":
                    if (not best) or (pred["severityWeight"] > best["severityWeight"]) or \
                       (pred["severityWeight"] == best["severityWeight"] and pred["confidenceScore"] > best["confidenceScore"]):
                        best = pred
            if best:
                best["priorityScore"] = round(best["severityWeight"] * case.get("trafficCongestionScore", 1.0), 2)
                case["finalPrediction"] = best
                results.append(case)

        if results:
            logger.info(f"✅ Finalizing {len(results)} analyzed reports for cluster {cluster_id}")
            final = max((r["finalPrediction"] for r in results), key=lambda x: (x["severityWeight"], x["confidenceScore"]))
            case_ids = [r["caseId"] for r in results]
            for cid in case_ids:
                reports_collection.update_one({"caseId": cid}, {"$set": {
                    "damageType": final["damageType"],
                    "severity": final["severity"],
                    "confidenceScore": final["confidenceScore"],
                    "priorityScore": final["priorityScore"],
                    "status": "analyzed"
                }})
            centroid_lat = sum(r["location"]["coordinates"][1] for r in results) / len(results)
            centroid_lon = sum(r["location"]["coordinates"][0] for r in results) / len(results)
            h3_cell = results[0].get("h3Cell", cluster_id) 
            batches_collection.insert_one({
                "batchId": str(uuid4()),
                "caseIds": case_ids,
                "centroid": {"latitude": centroid_lat, "longitude": centroid_lon},
                "damageResult": final,
                "reportCount": len(results),
                "h3Cell":h3_cell
            })
        else:
            logger.info(f"❌ No valid predictions in cluster {cluster_id}")

    return {"status": "done"}
