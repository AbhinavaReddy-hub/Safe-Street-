import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np

# Load the trained model
model = tf.keras.models.load_model("road_classifier_model.keras")
print("✅ Model loaded successfully.")

def classify_image(img_path):
    img_height, img_width = 224, 224
    img = image.load_img(img_path, target_size=(img_height, img_width))
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    prediction = model.predict(img_array)
    if prediction[0] > 0.5:
        print("🛣️ Prediction: Road")
    else:
        print("🛣️ Prediction:Not a Road")

# Replace this with the path to your test image
test_img_path = "C:\\Users\Gunavardhan\\OneDrive\\Desktop\\ps2-2\\streetSafe\\road_classification\\road-or-not-road.v1i.folder\\test\\yes\\India_002485_jpg.rf.93c56c3ad266bebed45fdf87b639526e.jpg"
classify_image(test_img_path)
