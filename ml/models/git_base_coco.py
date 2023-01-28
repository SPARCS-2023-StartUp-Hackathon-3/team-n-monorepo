import requests
import torch
from PIL import Image
from transformers import AutoModelForCausalLM, AutoProcessor

processor = AutoProcessor.from_pretrained("microsoft/git-base-coco")
model = AutoModelForCausalLM.from_pretrained("microsoft/git-base-coco")

if torch.cuda.is_available():
    model = model.to('cuda')

def git_base_coco(urls: list[str]) -> list[str]:
    images = [Image.open(requests.get(url, stream=True).raw) for url in urls]
    
    ls = []
    for image in images:
        pixel_values = processor(images=[image], return_tensors="pt").pixel_values
        if torch.cuda.is_available():
            pixel_values = pixel_values.to('cuda')
        generated_ids = model.generate(pixel_values=pixel_values, max_length=50)
        generated_caption = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
        ls.append(generated_caption)
    
    return ls