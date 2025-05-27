from mobilenet_model import build_model
from dataset_code import create_dataframe_from_folder, CustomDataLoader
from sklearn.model_selection import train_test_split

dataset_path = r"C:\Users\Gunavardhan\OneDrive\Desktop\ps2-2\streetSafe\road_classification\road-or-not-road.v1i.folder\train"

df = create_dataframe_from_folder(dataset_path)
train_df, val_df = train_test_split(df, test_size=0.2, random_state=42)

train_loader = CustomDataLoader(train_df)
val_loader = CustomDataLoader(val_df)

model = build_model()

history = model.fit(train_loader, validation_data=val_loader, epochs=20)

model.save("road_dual_output_model.keras")
print("✅ Model saved as 'road_dual_output_model.keras'")
