import torch
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel, UniPCMultistepScheduler
from PIL import Image

class AEPipelineManager:
    def __init__(self):
        self.pipe = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

    def load_model(self):
        if self.pipe is not None:
            return

        # ControlNet-Scribble integration for 2D architectural sketches
        controlnet = ControlNetModel.from_pretrained(
            "lllyasviel/sd-controlnet-scribble",
            torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
        )

        # Quantized Stable Diffusion v1.5 baseline
        self.pipe = StableDiffusionControlNetPipeline.from_pretrained(
            "stable-diffusion-v1-5/stable-diffusion-v1-5",
            controlnet=controlnet,
            torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
        )

        self.pipe.scheduler = UniPCMultistepScheduler.from_config(self.pipe.scheduler.config)
        
        if self.device == "cuda":
            self.pipe.enable_model_cpu_offload()
        else:
            self.pipe.to("cpu")

    def generate_render(self, control_image: Image.Image, prompt: str, negative_prompt: str = "low quality, blurry", steps: int = 20) -> Image.Image:
        self.load_model()
        
        image = self.pipe(
            prompt=prompt,
            image=control_image,
            negative_prompt=negative_prompt,
            num_inference_steps=steps
        ).images[0]

        return image

ai_manager = AEPipelineManager()