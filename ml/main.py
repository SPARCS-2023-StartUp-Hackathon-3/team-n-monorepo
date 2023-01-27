from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline

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
    image_to_text = pipeline("image-to-text", model="nlpconnect/vit-gpt2-image-captioning")

    result = list(map(lambda a: a[0]['generated_text'], image_to_text(item.urls)))
    return {"result": result}
