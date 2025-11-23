from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from model_manager import model_manager
import io
import base64

app = FastAPI(title="RunPod AI Web App")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoadModelRequest(BaseModel):
    model_id: str
    model_type: str  # "chat", "image", "vision"

class ChatRequest(BaseModel):
    messages: list
    max_length: int = 200

# ... (lines 26-53 omitted)

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        response = model_manager.generate_text(request.messages, request.max_length)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-image")
async def generate_image(request: ImageRequest):
    try:
        image = model_manager.generate_image(request.prompt)
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        return {"image_base64": img_str}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze")
async def analyze(file: UploadFile = File(...), prompt: str = "Describe this image"):
    try:
        contents = await file.read()
        analysis = model_manager.analyze_image(contents, prompt)
        return {"analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
