import requests
import torch
from PIL import Image
from transformers import BlipForConditionalGeneration, BlipProcessor

processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

# if cuda is available, use cuda
if torch.cuda.is_available():
    model = model.cuda()

def blip_base(urls: list[str]) -> list[str]:
    images = [Image.open(requests.get(url, stream=True).raw)
                .convert('RGB')
        for url in urls
    ]
    
    ls = []
    for image in images:
        inputs = processor(images=[image], return_tensors="pt", padding=True)
        if torch.cuda.is_available():
            inputs = inputs.to('cuda')
        out = model.generate(**inputs)
        ls.append(processor.batch_decode(out, skip_special_tokens=True)[0])
    
    return ls