import tensorflow as tf
import pandas as pd
import numpy as np
import os
from clarity_score_util import compute_laplacian_score

def create_dataframe_from_folder(dataset_path):
    data = []
    for class_label in ['yes', 'no']:
        class_dir = os.path.join(dataset_path, class_label)
        for fname in os.listdir(class_dir):
            if fname.lower().endswith(('.jpg', '.jpeg', '.png')):
                path = os.path.join(class_dir, fname)
                clarity = compute_laplacian_score(path)
                label = 1 if class_label == 'yes' else 0
                data.append({'filepath': path, 'label': label, 'clarity': clarity})
    return pd.DataFrame(data)

class CustomDataLoader(tf.keras.utils.Sequence):
    def __init__(self, df, batch_size=32, img_size=(224, 224), shuffle=True):
        self.df = df
        self.batch_size = batch_size
        self.img_size = img_size
        self.shuffle = shuffle
        self.on_epoch_end()

    def __len__(self):
        return int(np.ceil(len(self.df) / self.batch_size))

    def on_epoch_end(self):
        self.df = self.df.sample(frac=1).reset_index(drop=True)

    def __getitem__(self, index):
        batch_df = self.df.iloc[index*self.batch_size:(index+1)*self.batch_size]
        images, roads, clarity_scores = [], [], []

        for _, row in batch_df.iterrows():
            img = tf.keras.preprocessing.image.load_img(row['filepath'], target_size=self.img_size)
            img = tf.keras.preprocessing.image.img_to_array(img) / 255.0
            images.append(img)
            roads.append(row['label'])
            clarity_scores.append(row['clarity'])

        return tf.convert_to_tensor(images), {
            'road_output': tf.convert_to_tensor(roads, dtype=tf.float32),
            'clarity_output': tf.convert_to_tensor(clarity_scores, dtype=tf.float32)
        }
