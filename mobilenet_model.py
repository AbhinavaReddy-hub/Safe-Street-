import tensorflow as tf

def build_model():
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights='imagenet'
    )
    base_model.trainable = False

    inputs = tf.keras.Input(shape=(224, 224, 3))
    x = base_model(inputs, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)

    road_output = tf.keras.layers.Dense(1, activation='sigmoid', name='road_output')(x)
    clarity_output = tf.keras.layers.Dense(1, activation='linear', name='clarity_output')(x)

    model = tf.keras.Model(inputs=inputs, outputs=[road_output, clarity_output])

    model.compile(
        optimizer='adam',
        loss={
            'road_output': 'binary_crossentropy',
            'clarity_output': 'mse'
        },
        metrics={'road_output': 'accuracy'}
    )

    return model
