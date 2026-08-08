import io
from PIL import Image

def preprocess_image(image_bytes: bytes, target_size: int = 512) -> Image.Image:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((target_size, target_size), Image.Resampling.LANCZOS)
    return image

def image_to_bytes(image: Image.Image) -> bytes:
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()