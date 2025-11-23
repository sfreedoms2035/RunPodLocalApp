import os
try:
    import hf_transfer
except ImportError:
    os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "0"
    print("hf_transfer not found. Disabling fast downloads.")

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, AutoModelForVision2Seq, AutoProcessor
from diffusers import StableDiffusionPipeline
from PIL import Image
import io

class ModelManager:
    def __init__(self):
        self.chat_model = None
        self.chat_tokenizer = None
        self.image_pipeline = None
        self.vision_model = None
        self.vision_processor = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.status = {"status": "idle", "message": "Ready"}

    def set_status(self, status: str, message: str):
        self.status = {"status": status, "message": message}

    def load_chat_model(self, model_id: str):
        self.set_status("loading", f"Loading chat model: {model_id}...")
        print(f"Loading chat model: {model_id}...")
        try:
            self.chat_tokenizer = AutoTokenizer.from_pretrained(model_id)
            self.chat_model = AutoModelForCausalLM.from_pretrained(
                model_id, 
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                device_map="auto"
            )
            print(f"Chat model {model_id} loaded.")
            self.set_status("ready", f"Chat model {model_id} loaded.")
        except Exception as e:
            print(f"Error loading chat model: {e}")
            self.set_status("error", f"Error: {str(e)}")
            raise e

    def generate_text(self, messages: list, max_length: int = 200):
        if not self.chat_model:
            raise ValueError("Chat model not loaded.")
        
        text = self.chat_tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )
        
        inputs = self.chat_tokenizer(text, return_tensors="pt").to(self.device)
        outputs = self.chat_model.generate(**inputs, max_new_tokens=max_length)
        
        # Decode only the new tokens
        generated_ids = outputs[0][len(inputs.input_ids[0]):]
        return self.chat_tokenizer.decode(generated_ids, skip_special_tokens=True)

    def load_image_model(self, model_id: str):
        self.set_status("loading", f"Loading image model: {model_id}...")
        print(f"Loading image model: {model_id}...")
        try:
            self.image_pipeline = StableDiffusionPipeline.from_pretrained(
                model_id, 
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
            )
            self.image_pipeline.to(self.device)
            print(f"Image model {model_id} loaded.")
            self.set_status("ready", f"Image model {model_id} loaded.")
        except Exception as e:
            print(f"Error loading image model: {e}")
            self.set_status("error", f"Error: {str(e)}")
            raise e

    def generate_image(self, prompt: str):
        if not self.image_pipeline:
            raise ValueError("Image model not loaded.")
        
        image = self.image_pipeline(prompt).images[0]
        return image

    def load_vision_model(self, model_id: str):
        self.set_status("loading", f"Loading vision model: {model_id}...")
        print(f"Loading vision model: {model_id}...")
        try:
            self.vision_processor = AutoProcessor.from_pretrained(model_id)
            self.vision_model = AutoModelForVision2Seq.from_pretrained(
                model_id, 
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                device_map="auto"
            )
            print(f"Vision model {model_id} loaded.")
            self.set_status("ready", f"Vision model {model_id} loaded.")
        except Exception as e:
            print(f"Error loading vision model: {e}")
            self.set_status("error", f"Error: {str(e)}")
            raise e

    def analyze_image(self, image_bytes: bytes, prompt: str = "Describe this image."):
        if not self.vision_model:
            raise ValueError("Vision model not loaded.")
        
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        inputs = self.vision_processor(images=image, text=prompt, return_tensors="pt").to(self.device)
        
        outputs = self.vision_model.generate(**inputs, max_length=100)
        return self.vision_processor.decode(outputs[0], skip_special_tokens=True)

model_manager = ModelManager()
