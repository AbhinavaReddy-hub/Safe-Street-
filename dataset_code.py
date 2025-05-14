import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Define the path to your dataset
dataset_path = "C:\Users\Gunavardhan\OneDrive\Desktop\ps2-2\streetSafe\road_classification\road-or-not-road.v1i.folder\train"  # Replace with the actual path

# Parameters
img_height, img_width = 224, 224  # Typical for MobileNet
batch_size = 32

# Data augmentation and preprocessing
datagen = ImageDataGenerator(
    rescale=1.0/255,
    validation_split=0.2  # 80-20 split for training and validation
)

# Load training data
train_data = datagen.flow_from_directory(
    dataset_path,
    target_size=(img_height, img_width),
    batch_size=batch_size,
    class_mode='binary',
    subset='training'
)

# Load validation data
val_data = datagen.flow_from_directory(
    dataset_path,
    target_size=(img_height, img_width),
    batch_size=batch_size,
    class_mode='binary',
    subset='validation'
)

# Print class indices for verification
print("Class labels:", train_data.class_indices)

# You can now use train_data and val_data to train your MobileNet model
