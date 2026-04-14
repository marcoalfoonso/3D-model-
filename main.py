from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

#folder paths
BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR  = os.path.join(BASE_DIR,"static")

#serve static files
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

IMAGE_PATH = os.path.join(STATIC_DIR,"latest.jpg")

#Root -> serves robot page

@app.get("/")
def index():
    return FileResponse(os.path.join(STATIC_DIR,"index.html"))

@app.post("/upload")
async def upload_image(request: Request):
    data = await request.body()

    with open(IMAGE_PATH, "wb") as f:
        f.write(data)

    return {"status": "saved"}


@app.get("/latest")
def get_latest():
    if not os.path.exists(IMAGE_PATH):
        return JSONResponse({"error": "No image yet"}, status_code=404)
    
    return FileResponse(IMAGE_PATH, media_type="image/jpeg")