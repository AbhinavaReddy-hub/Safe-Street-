from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import DetrImageProcessor, DetrForObjectDetection, DetrConfig
from safetensors.torch import load_file
from PIL import Image
import requests
import io
import torch
from torchvision.ops import nms
import logging

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

# --- Load Model & Processor ---
logger.info("Loading DETR processor and model...")
processor = DetrImageProcessor.from_pretrained("facebook/detr-resnet-50")
config = DetrConfig.from_pretrained("facebook/detr-resnet-50", num_labels=9)
model = DetrForObjectDetection(config)

model_path = "/Users/raghupersonal/Desktop/models/model.safetensors"  # Place your safetensors file here
logger.info(f"Loading model weights from {model_path}...")
state_dict = load_file(model_path)
model.load_state_dict(state_dict)
model.eval()

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
logger.info(f"Model loaded on device: {device}")

# --- Mapping & Helpers ---
label_to_damage_type = {
    0: "crack", 1: "crack", 2: "crack", 3: "crack",
    4: "patch", 5: "pothole", 6: "patch", 7: "patch", 8: "crack"
}

def area_to_severity(area: float) -> str:
    if area > 50000:
        return "high"
    elif area >= 10000:
        return "medium"
    return "low"

def infer_single(image: Image.Image):
    inputs = processor(images=image, return_tensors="pt").to(device)
    with torch.no_grad():
        outputs = model(**inputs)
    results = processor.post_process_object_detection(
        outputs,
        target_sizes=[image.size[::-1]],
        threshold=0.1
    )[0]

    boxes, scores, labels = results["boxes"], results["scores"], results["labels"]
    keep = nms(boxes, scores, iou_threshold=0.5)
    boxes, scores, labels = boxes[keep], scores[keep], labels[keep]

    if len(scores) == 0:
        return None

    # pick top by score
    idx = scores.argmax().item()
    score = float(scores[idx].item())
    label = int(labels[idx].item())
    xmin, ymin, xmax, ymax = boxes[idx].tolist()
    area = (xmax - xmin) * (ymax - ymin)

    damage = label_to_damage_type.get(label, "unknown")
    severity = area_to_severity(area)
    if score < 0.4:
        score = 1.0 - score

    return {"damageType": damage, "severity": severity, "confidenceScore": round(score, 3)}

@app.post("/predict_case", response_model=BatchResponse)
async def predict_case(req: BatchRequest):
    if not req.image_urls:
        raise HTTPException(status_code=400, detail="No image URLs provided")

    best = None
    for url in req.image_urls:
        try:
            logger.info(f"Downloading image: {url}")
            resp = requests.get(url, timeout=5)
            resp.raise_for_status()
            img = Image.open(io.BytesIO(resp.content)).convert("RGB")
        except Exception as e:
            logger.warning(f"Failed to load {url}: {e}")
            continue

        pred = infer_single(img)
        if not pred:
            continue

        # choose worst severity → priority: high > med > low
        order = {"low":1, "medium":2, "high":3}
        if (not best) or (order[pred["severity"]] > order[best["severity"]]) or \
           (order[pred["severity"]] == order[best["severity"]] and pred["confidenceScore"] > best["confidenceScore"]):
            best = pred

    if not best:
        raise HTTPException(status_code=400, detail="No valid detections")

    logger.info(f"Returning prediction: {best}")
    return best
