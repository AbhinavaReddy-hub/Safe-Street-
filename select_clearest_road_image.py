import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from clarity_score_util import compute_laplacian_score
import cv2

# Load model
model = tf.keras.models.load_model("road_dual_output_model.keras")
print("✅ Model loaded.")

def is_road(img_array):
    road_pred, _ = model.predict(img_array)
    return road_pred[0][0] > 0.5

def preprocess_image(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img) / 255.0
    return np.expand_dims(img_array, axis=0)

def select_clearest_road_image(folder_path):
    best_score = -1
    best_image_path = None

    for fname in os.listdir(folder_path):
        if not fname.lower().endswith(('.jpg', '.jpeg', '.png')):
            continue

        path = os.path.join(folder_path, fname)
        img_array = preprocess_image(path)

        if is_road(img_array):
            clarity = compute_laplacian_score(path)
            print(f"🛣️ Road detected | {fname} | Clarity: {clarity:.2f}")
            if clarity > best_score:
                best_score = clarity
                best_image_path = path
        else:
            print(f"❌ Not a road | {fname}")

    if best_image_path:
        print(f"\n✅ Clearest Road Image: {best_image_path} (Clarity: {best_score:.2f})")
    else:
        print("\n⚠️ No road image found in the folder.")

# Set your folder path
folder = r"C:\Users\Gunavardhan\OneDrive\Desktop\ps2-2\streetSafe\road_classification\sample_test_folder"
select_clearest_road_image(folder)
