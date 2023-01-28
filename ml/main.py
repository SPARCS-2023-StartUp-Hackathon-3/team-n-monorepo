import requests
from fastapi import FastAPI
from PIL import Image
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoProcessor, pipeline

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
        
    image_to_text = pipeline("image-to-text", model="nlpconnect/vit-gpt2-image-captioning")

    result = list(map(lambda a: a[0]['generated_text'], image_to_text(item.urls)))
    return {"result": result}

@app.post("/multiple")
def generate_multiple_model(item: RequestItem):
    print(f'received url = {item.urls}')
    if not item.urls:
        return {"result": []}
    
    return {"result": [], "result2": generate_git_large_coco(item.urls)}


def generate_git_large_coco(urls: list[str]) -> list[str]:
    processor = AutoProcessor.from_pretrained("microsoft/git-base-coco")
    model = AutoModelForCausalLM.from_pretrained("microsoft/git-base-coco")

    ls = []
    for url in urls:
        image = Image.open(requests.get(url, stream=True).raw)
        pixel_values = processor(images=image, return_tensors="pt").pixel_values
        generated_ids = model.generate(pixel_values=pixel_values, max_length=50)
        generated_caption = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
        ls.append(generated_caption)
    
    return ls
