import requests
from fastapi import FastAPI
from PIL import Image
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoProcessor

from models.git_base_coco import git_base_coco
from models.vit_gpt2 import vit_gpt2

app = FastAPI()

class RequestItem(BaseModel):
    urls: list[str]

class ResponseItem(BaseModel):
    result: list[str]

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/alt")
def generate_alt_text(item: RequestItem) -> ResponseItem:
    print(f'received url = {item.urls}')
    if not item.urls:
        return {"result": []}
    return {"result": vit_gpt2(item.urls)}

@app.post("/multiple")
def generate_multiple_model(item: RequestItem):
    print(f'received url = {item.urls}')
    if not item.urls:
        return {"result": []}
    
    return {"result": [], "result2": git_base_coco(item.urls)}

