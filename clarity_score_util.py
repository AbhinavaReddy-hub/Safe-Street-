import cv2

def compute_laplacian_score(img_path):
    image = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
    if image is None:
        raise ValueError(f"Failed to load image: {img_path}")
    
    # Apply Gaussian blur first (Laplacian of Gaussian)
    blurred = cv2.GaussianBlur(image, (3, 3), 0)
    laplacian = cv2.Laplacian(blurred, cv2.CV_64F)
    
    # Return variance as a measure of clarity
    return laplacian.var()
