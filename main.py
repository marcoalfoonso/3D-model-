from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
import os

app = FastAPI()

IMAGE_PATH = "images/latest.jpg"

@app.post("/upload")
async def upload_image(request: Request):
    data = await request.body()

    os.makedirs("images", exist_ok=True)

    with open("images/latest.jpg", "wb") as f:
        f.write(data)

    return {"status": "saved"}


@app.get("/latest")
def get_latest():
    if not os.path.exists("images/latest.jpg"):
        return JSONResponse({"error": "No image yet"}, status_code=404)
    
    return FileResponse(IMAGE_PATH, media_type="image/jpeg")