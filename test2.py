from ultralytics import YOLO
import cv2
import numpy as np
import os

# Load the trained YOLO model
model = YOLO("models/epoch20.pt")  # Ensure the correct model file is used
class_names = model.names

# Load an image
image_path = "Imgs/alli3.jpeg"  # Ensure correct filename
img = cv2.imread(image_path)

# Check if image is loaded properly
if img is None:
    print(f"Error: Unable to load image at {image_path}. Check the file path!")
    exit()

# Resize after confirming successful loading
img = cv2.resize(img, (1020, 500))

height, width, _ = img.shape

# Run YOLO detection
results = model.predict(img)

# Create directory to save output images
output_dir = "captured_images"
os.makedirs(output_dir, exist_ok=True)

detected = False
detection_count = 0

for r in results:
    boxes = r.boxes  # Get bounding boxes from results
    for box in boxes:
        # Extract the detected class and bounding box coordinates
        d = int(box.cls)
        c = class_names[d]
        x, y, x2, y2 = map(int, box.xyxy[0])  # Coordinates: top-left (x,y) and bottom-right (x2,y2)
        
        # Calculate bounding box dimensions and area
        box_width = x2 - x
        box_height = y2 - y
        area = box_width * box_height
        image_area = width * height

        # Severity Classification based on area fraction
        if area > image_area * 0.07:
            severity = "High"
            color = (0, 0, 255)  # Red
        elif area > image_area * 0.03:
            severity = "Medium"
            color = (0, 165, 255)  # Orange
        else:
            severity = "Low"
            color = (0, 255, 0)  # Green

        # Draw the bounding box and label (including severity) on the image
        cv2.rectangle(img, (x, y), (x2, y2), color, 2)
        label_text = f"{c}: {severity}"
        cv2.putText(img, label_text, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
        
        # Print severity details to the console
        print(f"Detection {detection_count}: {c} detected with severity '{severity}' at [{x}, {y}, {x2}, {y2}]")
        detection_count += 1
        detected = True

# Save the output image if detections were made
if detected:
    output_image_path = os.path.join(output_dir, "detected_severity.jpg")
    cv2.imwrite(output_image_path, img)
    print(f"Image saved: {output_image_path}")

# Display the image with detections and severity labels
cv2.imshow('Detection', img)
cv2.waitKey(0)
cv2.destroyAllWindows()
