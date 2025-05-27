import tensorflow as tf
import numpy as np
import cv2
from tensorflow.keras.preprocessing import image
from clarity_score_util import compute_laplacian_score

model = tf.keras.models.load_model("road_dual_output_model.keras")
print("✅ Model loaded successfully.")

def classify_and_score(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    road_pred, clarity_pred = model.predict(img_array)
    laplacian_clarity = compute_laplacian_score(img_path)

    print("🛣️ Road Prediction:", "Yes" if road_pred[0][0] > 0.5 else "No")
    print("📏 Model Clarity Score:", clarity_pred[0][0])
    print("📏 Laplacian Clarity Score:", laplacian_clarity)

test_image_path = r"C:\Users\Gunavardhan\OneDrive\Desktop\ps2-2\streetSafe\road_classification\road-or-not-road.v1i.folder\test\no\cruze_4_jpg.rf.87a4744d018740fb98c29f7dcc37d4c2.jpg"
classify_and_score(test_image_path)
