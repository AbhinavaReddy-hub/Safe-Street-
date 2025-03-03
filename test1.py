from ultralytics import YOLO
import cv2
import numpy as np
import os

# Load the trained YOLO model
model = YOLO("Heroin.pt")  # Ensure the correct model file is used
class_names = model.names

# Load an image
image_path = "MicrosoftTeams-image_32.jpg"  # Change this to your image file
img = cv2.imread(image_path)

# Resize for better visualization
img = cv2.resize(img, (1020, 500))

# Run YOLO detection
results = model.predict(img)

for r in results:
    boxes = r.boxes  # Get bounding boxes

detected = False  # Flag to track detection

for box in boxes:
    d = int(box.cls)
    c = class_names[d]
    x, y, w, h = map(int, box.xyxy[0])  # Extract bounding box coordinates

    # Draw bounding box and label
    cv2.rectangle(img, (x, y), (w, h), (255, 0, 0), 2)
    cv2.putText(img, c, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
    
    detected = True  # Object detected, trigger image saving

# Save the output image if objects are detected
output_dir = "captured_images"
os.makedirs(output_dir, exist_ok=True)

if detected:
    img_filename = os.path.join(output_dir, "detected_image.jpg")
    cv2.imwrite(img_filename, img)
    print(f"Image saved: {img_filename}")

# Show the image
cv2.imshow('Detection', img)
cv2.waitKey(0)
cv2.destroyAllWindows()
