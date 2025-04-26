from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
from transformers import DetrImageProcessor, DetrForObjectDetection, DetrConfig
from safetensors.torch import load_file
from PIL import Image
import requests
import io
from torchvision.ops import nms
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()


# uvicorn app:app --host 0.0.0.0 --port 8000



# Pydantic model for request validation
class ImageRequest(BaseModel):
    image_url: str

# Load model and processor (on startup)
logger.info("Loading processor and model...")
processor = DetrImageProcessor.from_pretrained("facebook/detr-resnet-50")
config = DetrConfig.from_pretrained("facebook/detr-resnet-50", num_labels=9)
model = DetrForObjectDetection(config)

# Load safetensors weights
model_path = "/Users/raghupersonal/Desktop/models/model.safetensors"
logger.info("Loading model weights from safetensors file...")
state_dict = load_file(model_path)
model.load_state_dict(state_dict)
model.eval()

# Move model to GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# Custom label mapping to backend damage types
label_to_damage_type = {
    0: "crack",  # Wheel mark part (D00)
    1: "crack",  # Construction joint part (D01)
    2: "crack",  # Equal interval (D10)
    3: "crack",  # Construction joint part (D11)
    4: "patch",  # Partial pavement, overall pavement (D20)
    5: "pothole",  # Rutting, bump, pothole, separation (D40)
    6: "patch",  # Cross walk blur (D43)
    7: "patch",  # White line blur (D44)
    8: "crack"   # D50 (Label not in the table)
}

# Custom label names for logging
custom_labels = {
    0: "Wheel mark part (D00)",
    1: "Construction joint part (D01)",
    2: "Equal interval (D10)",
    3: "Construction joint part (D11)",
    4: "Partial pavement, overall pavement (D20)",
    5: "Rutting, bump, pothole, separation (D40)",
    6: "Cross walk blur (D43)",
    7: "White line blur (D44)",
    8: "D50 (Label not in the table)"
}

# Function to map bounding box area to severity
def area_to_severity(area: float) -> str:
    if area > 50000:  # Large damage
        return "high"
    elif area >= 10000:  # Moderate damage
        return "medium"
    else:  # Small damage
        return "low"

@app.post("/predict")
async def predict(request: ImageRequest):
    try:
        # Download the image from the provided URL
        0
        logger.info(f"Downloading image from: {request.image_url}")
        response = requests.get(request.image_url)
        if response.status_code != 200:
            logger.error("Failed to download image")
            raise HTTPException(status_code=400, detail="Failed to download image")

        # Load and preprocess image
        image = Image.open(io.BytesIO(response.content)).convert("RGB")
        inputs = processor(images=image, return_tensors="pt").to(device)

        # Run inference
        logger.info("Running DETR inference...")
        with torch.no_grad():
            outputs = model(**inputs)

        # Post-process results
        target_size = [image.size[::-1]]  # (height, width)
        results = processor.post_process_object_detection(outputs, target_sizes=target_size, threshold=0.1)[0]

        # Apply Non-Maximum Suppression (NMS)
        boxes = results["boxes"]
        scores = results["scores"]
        labels = results["labels"]
        keep_indices = nms(boxes, scores, iou_threshold=0.5)
        boxes = boxes[keep_indices]
        scores = scores[keep_indices]
        labels = labels[keep_indices]

        # Log all detections
        logger.info("Detected objects:")
        for score, label, box in zip(scores, labels, boxes):
            if label.item() >= 10:
                continue
            label_name = custom_labels.get(label.item(), f"Class {label.item()}")
            logger.info(f"→ {label_name}: {score.item():.2f}, Box: {box.tolist()}")

        # Select detection with highest confidence score
        if len(scores) == 0:
            logger.error("No valid detections found")
            raise HTTPException(status_code=400, detail="No valid damage detections found")

        max_score_idx = scores.argmax().item()
        selected_score = scores[max_score_idx].item()
        selected_label = labels[max_score_idx].item()
        selected_box = boxes[max_score_idx].tolist()

        # Map label to damage type
        damage_type = label_to_damage_type.get(selected_label, "unknown")

        # Calculate bounding box area and map to severity
        xmin, ymin, xmax, ymax = selected_box
        area = (xmax - xmin) * (ymax - ymin)
        severity = area_to_severity(area)
        if(selected_score<0.4):
            selected_score=1-selected_score
        # Format response
        response = {
            "damageType": damage_type,
            "severity": severity,
            "confidenceScore": selected_score
        }

        logger.info(f"Selected detection: {response}")
        return response

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))