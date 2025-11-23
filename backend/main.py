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
    max_length: int = 2048

class ImageRequest(BaseModel):
    prompt: str

@app.get("/")
async def root():
    return {"message": "RunPod AI Backend is running"}

@app.get("/api/model-status")
async def get_model_status():
    return model_manager.status

def load_model_task(model_id: str, model_type: str):
    try:
        if model_type == "chat":
            model_manager.load_chat_model(model_id)
        elif model_type == "image":
            model_manager.load_image_model(model_id)
        elif model_type == "vision":
            model_manager.load_vision_model(model_id)
    except Exception as e:
        print(f"Background load error: {e}")

@app.post("/api/load-model")
async def load_model(request: LoadModelRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(load_model_task, request.model_id, request.model_type)
    return {"message": f"Started loading model {request.model_id}"}

from fastapi.responses import StreamingResponse

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        return StreamingResponse(
            model_manager.generate_text_stream(request.messages, request.max_length),
            media_type="text/plain"
        )
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
