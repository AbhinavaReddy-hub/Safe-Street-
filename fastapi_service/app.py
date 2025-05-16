
# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# from transformers import DetrImageProcessor, DetrForObjectDetection, DetrConfig
# from safetensors.torch import load_file
# from PIL import Image
# import requests
# import io
# import torch
# import tensorflow as tf
# from tensorflow.keras.preprocessing import image as keras_image
# import numpy as np
# import logging
# # uvicorn app:app --host 0.0.0.0 --port 8000 --reload
# # --- Logging Setup ---
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger("fastapi_service")

# # --- FastAPI App ---
# app = FastAPI(title="SafeStreet Inference API")

# # --- Pydantic Models ---
# class BatchRequest(BaseModel):
#     image_urls: list[str]

# class BatchResponse(BaseModel):
#     damageType: str
#     severity: str
#     confidenceScore: float

# class RoadRequest(BaseModel):
#     image_urls: list[str]

# class RoadResponse(BaseModel):
#     valid: list[bool]

# # --- Load Road-Classification Model ---
# logger.info("Loading road-classification model...")
# road_model = tf.keras.models.load_model("/Users/raghupersonal/Desktop/RoadOrNot/road_classifier_model.keras")  # adjust path as needed
# logger.info("✅ Road-classifier loaded.")

# # --- Load DETR Damage Model ---
# logger.info("Loading DETR processor and model...")
# processor = DetrImageProcessor.from_pretrained("facebook/detr-resnet-50")
# config = DetrConfig.from_pretrained("facebook/detr-resnet-50", num_labels=9)
# model = DetrForObjectDetection(config)
# model_path = "/Users/raghupersonal/Desktop/models/model.safetensors"  # adjust path to safetensors file
# state_dict = load_file(model_path)
# model.load_state_dict(state_dict)
# model.eval()
# device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
# model.to(device)
# logger.info(f"DETR model loaded on device: {device}")

# # --- Helper Functions ---
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
#     return "low"

# # Road detection helper

# def is_road_image(img: Image.Image) -> bool:
#     # Resize and normalize for Keras model
#     arr = keras_image.img_to_array(img.resize((224, 224))) / 255.0
#     arr = np.expand_dims(arr, axis=0)
#     pred = road_model.predict(arr)
#     return bool(pred[0] > 0.5)

# # Single-image damage inference

# def infer_single(img: Image.Image):
#     inputs = processor(images=img, return_tensors="pt").to(device)
#     with torch.no_grad():
#         outputs = model(**inputs)
#     results = processor.post_process_object_detection(
#         outputs,
#         target_sizes=[img.size[::-1]],
#         threshold=0.1
#     )[0]

#     boxes, scores, labels = results["boxes"], results["scores"], results["labels"]
#     keep = torch.ops.torchvision.nms(boxes, scores, iou_threshold=0.5)
#     boxes, scores, labels = boxes[keep], scores[keep], labels[keep]

#     if len(scores) == 0:
#         return None

#     idx = scores.argmax().item()
#     score = float(scores[idx].item())
#     label = int(labels[idx].item())
#     xmin, ymin, xmax, ymax = boxes[idx].tolist()
#     area = (xmax - xmin) * (ymax - ymin)

#     damage = label_to_damage_type.get(label, "unknown")
#     severity = area_to_severity(area)
#     if score < 0.4:
#         score = 1.0 - score

#     return {
#         "damageType": damage,
#         "severity": severity,
#         "confidenceScore": round(score, 3)
#     }

# # --- FastAPI Endpoints ---

# @app.post("/validate-road", response_model=RoadResponse)
# async def validate_road(req: RoadRequest):
#     if not req.image_urls:
#         raise HTTPException(status_code=400, detail="No image_urls provided.")
#     valid_flags = []
#     for url in req.image_urls:
#         try:
#             resp = requests.get(url, timeout=10)
#             resp.raise_for_status()
#             img = Image.open(io.BytesIO(resp.content)).convert("RGB")
#         except Exception as e:
#             logger.error(f"Road-detection fetch failed for {url}: {e}")
#             valid_flags.append(False)
#             continue
#         valid_flags.append(is_road_image(img))
#     logger.info(f"Road-validation results: {valid_flags}")
#     return {"valid": valid_flags}

# @app.post("/predict_case", response_model=BatchResponse)
# async def predict_case(req: BatchRequest):
#     if not req.image_urls:
#         raise HTTPException(status_code=400, detail="No image URLs provided")
#     best = None
#     order = {"low":1, "medium":2, "high":3}
#     for url in req.image_urls:
#         try:
#             resp = requests.get(url, timeout=5)
#             resp.raise_for_status()
#             img = Image.open(io.BytesIO(resp.content)).convert("RGB")
#         except Exception as e:
#             logger.warning(f"Image load failed for {url}: {e}")
#             continue

#         pred = infer_single(img)
#         if not pred:
#             continue

#         if (not best) \
#            or (order[pred["severity"]] > order[best["severity"]]) \
#            or (order[pred["severity"]] == order[best["severity"]] and \
#                pred["confidenceScore"] > best["confidenceScore"]):
#             best = pred

#     if not best:
#         raise HTTPException(status_code=400, detail="No valid detections found.")
#     return best





# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# from transformers import DetrImageProcessor, DetrForObjectDetection, DetrConfig
# from safetensors.torch import load_file
# from PIL import Image
# import requests
# import io
# import torch
# import tensorflow as tf
# from tensorflow.keras.preprocessing import image as keras_image
# import numpy as np
# import logging

# # uvicorn app:app --host 0.0.0.0 --port 8000 --reload

# # --- Logging Setup ---
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger("fastapi_service")

# # --- FastAPI App ---
# app = FastAPI(title="SafeStreet Inference API")

# # --- Pydantic Models ---
# class BatchRequest(BaseModel):
#     image_urls: list[str]

# class BatchResponse(BaseModel):
#     damageType: str
#     severity: str
#     confidenceScore: float

# class RoadRequest(BaseModel):
#     image_urls: list[str]

# class RoadResponse(BaseModel):
#     valid: list[bool]


# # --- Load Road‐Classification Model ---
# logger.info("Loading road‐classification model...")
# road_model = tf.keras.models.load_model(
#     "/Users/raghupersonal/Desktop/RoadOrNot/road_classifier_model.keras"
# )
# logger.info("✅ Road‐classifier loaded.")


# # --- Load DETR Damage Model ---
# logger.info("Loading DETR processor and model...")
# processor = DetrImageProcessor.from_pretrained("facebook/detr-resnet-50")
# config    = DetrConfig.from_pretrained("facebook/detr-resnet-50", num_labels=9)
# model     = DetrForObjectDetection(config)
# model_path= "/Users/raghupersonal/Desktop/models/model.safetensors"
# state_dict= load_file(model_path)
# model.load_state_dict(state_dict)
# model.eval()

# device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
# model.to(device)
# logger.info(f"DETR model loaded on device: {device}")


# # --- Damage Helpers ---
# label_to_damage_type = {
#     0: "crack", 1: "crack", 2: "crack", 3: "crack",
#     4: "patch", 5: "pothole", 6: "patch", 7: "patch", 8: "crack"
# }
# def area_to_severity(area: float) -> str:
#     if area > 50000:
#         return "high"
#     elif area >= 10000:
#         return "medium"
#     else:
#         return "low"

# def infer_single(img: Image.Image):
#     inputs = processor(images=img, return_tensors="pt").to(device)
#     with torch.no_grad():
#         outputs = model(**inputs)

#     results = processor.post_process_object_detection(
#         outputs,
#         target_sizes=[img.size[::-1]],
#         threshold=0.1
#     )[0]

#     boxes, scores, labels = results["boxes"], results["scores"], results["labels"]
#     keep = torch.ops.torchvision.nms(boxes, scores, iou_threshold=0.5)
#     boxes, scores, labels = boxes[keep], scores[keep], labels[keep]

#     if not scores.size(0):
#         return None

#     idx   = scores.argmax().item()
#     score = float(scores[idx].item())
#     label = int(labels[idx].item())
#     xmin, ymin, xmax, ymax = boxes[idx].tolist()
#     area  = (xmax - xmin) * (ymax - ymin)

#     damage   = label_to_damage_type.get(label, "unknown")
#     severity = area_to_severity(area)
#     if score < 0.4:
#         score = 1.0 - score

#     return {
#         "damageType": damage,
#         "severity": severity,
#         "confidenceScore": round(score, 3)
#     }


# # --- Road‐Detection Helper (UPDATED) ---
# def is_road_image(img: Image.Image) -> bool:
#     """
#     1) Resize with BILINEAR interpolation (matches keras.preprocessing.load_img)
#     2) Convert to numpy array, normalize [0,1]
#     3) Expand dims and run model
#     """
#     # 1) Resize exactly as load_img does
#     resized = img.resize((224, 224), resample=Image.BILINEAR)

#     # 2) Convert & normalize
#     arr = keras_image.img_to_array(resized) / 255.0
#     arr = np.expand_dims(arr, axis=0)

#     # Debug logs
#     logger.info(f"Road-check input shape: {arr.shape}")
#     logger.info(f"Road-check pixel sample [0,0,0]: {arr[0,0,0,0]:.4f}")

#     # 3) Inference
#     pred = road_model.predict(arr)
#     score = float(pred[0][0])
#     logger.info(f"Road-model raw output: {score:.4f}")

#     return score > 0.5


# # --- FastAPI Endpoints ---

# @app.post("/validate-road", response_model=RoadResponse)
# async def validate_road(req: RoadRequest):
#     if not req.image_urls:
#         raise HTTPException(status_code=400, detail="No image_urls provided")

#     valid_flags = []
#     for url in req.image_urls:
#         try:
#             resp = requests.get(url, timeout=10)
#             resp.raise_for_status()
#             img = Image.open(io.BytesIO(resp.content)).convert("RGB")
#         except Exception as e:
#             logger.error(f"Road-detection fetch failed for {url}: {e}")
#             valid_flags.append(False)
#             continue

#         valid_flags.append(is_road_image(img))

#     logger.info(f"Road-validation results: {valid_flags}")
#     return {"valid": valid_flags}


# @app.post("/predict_case", response_model=BatchResponse)
# async def predict_case(req: BatchRequest):
#     if not req.image_urls:
#         raise HTTPException(status_code=400, detail="No image URLs provided")

#     best  = None
#     order = {"low":1, "medium":2, "high":3}

#     for url in req.image_urls:
#         try:
#             resp = requests.get(url, timeout=5)
#             resp.raise_for_status()
#             img = Image.open(io.BytesIO(resp.content)).convert("RGB")
#         except Exception as e:
#             logger.warning(f"Image load failed for {url}: {e}")
#             continue

#         pred = infer_single(img)
#         if not pred:
#             continue

#         # choose worst (highest severity) OR tie → higher confidence
#         if (not best) or \
#            (order[pred["severity"]] > order[best["severity"]]) or \
#            (order[pred["severity"]] == order[best["severity"]] and 
#             pred["confidenceScore"] > best["confidenceScore"]):
#             best = pred

#     if not best:
#         raise HTTPException(status_code=400, detail="No valid detections found")

#     logger.info(f"Returning prediction: {best}")
#     return best





# app.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import DetrImageProcessor, DetrForObjectDetection, DetrConfig
from safetensors.torch import load_file
from PIL import Image
import requests
import io
import torch
import tensorflow as tf
from tensorflow.keras.preprocessing import image as keras_image
import numpy as np
import logging

# uvicorn app:app --host 0.0.0.0 --port 8000 --reload

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fastapi_service")

# --- FastAPI App ---
app = FastAPI(title="SafeStreet Inference API")


# --- Pydantic Models ---
class BatchRequest(BaseModel):
    image_urls: list[str]


class BatchResponse(BaseModel):
    damageType: str
    severity: str
    confidenceScore: float


class RoadRequest(BaseModel):
    image_urls: list[str]


class RoadResponse(BaseModel):
    valid: list[bool]


# --- Load Road‐Classification Model ---
logger.info("Loading road-classification model...")
road_model = tf.keras.models.load_model(
    "/Users/raghupersonal/Desktop/RoadOrNot/road_classifier_model.keras"
)
logger.info("✅ Road-classifier loaded.")


# --- Load DETR Damage Model ---
logger.info("Loading DETR processor and model...")
processor  = DetrImageProcessor.from_pretrained("facebook/detr-resnet-50")
config     = DetrConfig.from_pretrained("facebook/detr-resnet-50", num_labels=9)
model      = DetrForObjectDetection(config)
model_path = "/Users/raghupersonal/Desktop/models/model.safetensors"
state_dict = load_file(model_path)
model.load_state_dict(state_dict)
model.eval()

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
logger.info(f"DETR model loaded on device: {device}")


# --- Damage Helpers ---
label_to_damage_type = {
    0: "crack",  1: "crack", 2: "crack", 3: "crack",
    4: "patch",  5: "pothole", 6: "patch", 7: "patch", 8: "crack"
}


def area_to_severity(area: float) -> str:
    if area > 50000:
        return "high"
    elif area >= 10000:
        return "medium"
    else:
        return "low"


def infer_single(img: Image.Image):
    # Prepare input for DETR
    inputs = processor(images=img, return_tensors="pt").to(device)
    with torch.no_grad():
        outputs = model(**inputs)

    results = processor.post_process_object_detection(
        outputs,
        target_sizes=[img.size[::-1]],
        threshold=0.1
    )[0]

    boxes, scores, labels = results["boxes"], results["scores"], results["labels"]
    keep = torch.ops.torchvision.nms(boxes, scores, iou_threshold=0.5)
    boxes, scores, labels = boxes[keep], scores[keep], labels[keep]

    if not scores.size(0):
        return None

    idx   = scores.argmax().item()
    score = float(scores[idx].item())
    label = int(labels[idx].item())
    xmin, ymin, xmax, ymax = boxes[idx].tolist()
    area  = (xmax - xmin) * (ymax - ymin)

    damage   = label_to_damage_type.get(label, "unknown")
    severity = area_to_severity(area)
    # invert very low confidence
    if score < 0.4:
        score = 1.0 - score

    return {
        "damageType": damage,
        "severity": severity,
        "confidenceScore": round(score, 3)
    }


# --- Road‐Detection Helper (UPDATED) ---
def is_road_image(img: Image.Image) -> bool:
    """
    1) Resize with BILINEAR interpolation
    2) Normalize exactly as keras_image.load_img → img_to_array /255
    3) Expand dims and predict
    """
    # 1) Resize with PIL.BILINEAR
    resized = img.resize((224, 224), resample=Image.BILINEAR)

    # 2) Convert & normalize
    arr = keras_image.img_to_array(resized) / 255.0
    arr = np.expand_dims(arr, axis=0)

    # Debug logs (optional)
    logger.info(f"Road-check input shape: {arr.shape}")
    logger.info(f"Road-check pixel sample [0,0,0]: {arr[0,0,0,0]:.4f}")

    # 3) Inference
    pred  = road_model.predict(arr, verbose=0)  # shape = (1,1)
    score = float(pred[0][0])
    logger.info(f"Road-model raw output: {score:.4f}")

    return score > 0.5


# --- FastAPI Endpoints ---


@app.post("/validate-road", response_model=RoadResponse)
async def validate_road(req: RoadRequest):
    if not req.image_urls:
        raise HTTPException(status_code=400, detail="No image_urls provided")

    valid_flags = []
    for url in req.image_urls:
        try:
            resp = requests.get(url, timeout=10)
            resp.raise_for_status()
            img = Image.open(io.BytesIO(resp.content)).convert("RGB")
        except Exception as e:
            logger.error(f"Road-detection fetch failed for {url}: {e}")
            valid_flags.append(False)
            continue

        valid_flags.append(is_road_image(img))

    logger.info(f"Road-validation results: {valid_flags}")
    return {"valid": valid_flags}


@app.post("/predict_case", response_model=BatchResponse)
async def predict_case(req: BatchRequest):
    if not req.image_urls:
        raise HTTPException(status_code=400, detail="No image URLs provided")

    best  = None
    order = {"low":1, "medium":2, "high":3}

    for url in req.image_urls:
        try:
            resp = requests.get(url, timeout=5)
            resp.raise_for_status()
            img = Image.open(io.BytesIO(resp.content)).convert("RGB")
        except Exception as e:
            logger.warning(f"Image load failed for {url}: {e}")
            continue

        pred = infer_single(img)
        if not pred:
            continue

        # pick highest severity or, on tie, higher confidence
        if (not best) or \
           (order[pred["severity"]] > order[best["severity"]]) or \
           (order[pred["severity"]] == order[best["severity"]] and
            pred["confidenceScore"] > best["confidenceScore"]):
            best = pred

    if not best:
        raise HTTPException(status_code=400, detail="No valid detections found")

    logger.info(f"Returning prediction: {best}")
    return best
