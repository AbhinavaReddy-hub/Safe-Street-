from ultralytics import YOLO
import cv2
import numpy as np
import os
import argparse

# Parse command-line arguments
parser = argparse.ArgumentParser(description="YOLO Object Detection with Confidence Threshold")
parser.add_argument("--conf", type=float, default=0.5, help="Confidence threshold for detection (default: 0.5)")
args = parser.parse_args()

# Load the trained YOLO model
model = YOLO("models/epoch20.pt")  # Ensure correct model file
class_names = model.names

# Load a video
video_path = "videos/p.mp4"  # Ensure correct filename
cap = cv2.VideoCapture(video_path)

# Check if video is loaded properly
if not cap.isOpened():
    print(f"Error: Unable to load video at {video_path}. Check the file path!")
    exit()

# Create directory to save output images
output_dir = "captured_frames"
os.makedirs(output_dir, exist_ok=True)

frame_count = 0

while True:
    ret, frame = cap.read()
    if not ret:
        break  # Exit loop if video ends

    frame_count += 1

    # Process every 3rd frame to reduce computational load
    if frame_count % 3 != 0:
        continue

    height, width, _ = frame.shape

    # Run YOLO detection with confidence threshold
    results = model.predict(frame, conf=args.conf)  # Use the confidence threshold from command-line argument

    detected = False
    detection_count = 0

    for r in results:
        boxes = r.boxes  # Get bounding boxes from results
        for box in boxes:
            # Extract the detected class, confidence score, and bounding box coordinates
            d = int(box.cls)
            c = class_names[d]
            conf = box.conf.item()  # Confidence score
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

            # Draw bounding box and label (including severity and confidence) on the frame
            cv2.rectangle(frame, (x, y), (x2, y2), color, 2)
            label_text = f"{c}: {severity} ({conf:.2f})"
            cv2.putText(frame, label_text, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

            # Print severity details to console
            print(f"Frame {frame_count} - {c} detected with severity '{severity}' at [{x}, {y}, {x2}, {y2}] (Confidence: {conf:.2f})")
            detection_count += 1
            detected = True

    # Save the output frame if detections were made
    if detected:
        output_frame_path = os.path.join(output_dir, f"frame_{frame_count}.jpg")
        cv2.imwrite(output_frame_path, frame)

    # Display the frame with detections
    cv2.imshow('Detection', frame)

    # Break if 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release resources
cap.release()
cv2.destroyAllWindows()