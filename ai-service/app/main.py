from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import Response
from app.pipeline import ai_manager
from app.utils import preprocess_image, image_to_bytes

app = FastAPI(
    title="BuildSure-AI Visual Processing Microservice",
    description="Local inference engine for 2D floor plan to 3D architectural style injection using Stable Diffusion v1.5 and ControlNet.",
    version="1.0.0"
)

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "BuildSure-AI Local Inference Engine",
        "device": ai_manager.device
    }

@app.post("/generate-render")
async def generate_architectural_render(
    file: UploadFile = File(...),
    prompt: str = Form("modern architectural luxury house, photorealistic, 8k resolution, highly detailed exterior view"),
    negative_prompt: str = Form("low quality, blurry, deformed, black and white sketch lines, ugly"),
    steps: int = Form(20)
):
    try:
        image_bytes = await file.read()
        control_image = preprocess_image(image_bytes)
        
        result_image = ai_manager.generate_render(
            control_image=control_image,
            prompt=prompt,
            negative_prompt=negative_prompt,
            steps=steps
        )
        
        output_bytes = image_to_bytes(result_image)
        return Response(content=output_bytes, media_type="image/png")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))