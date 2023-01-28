from transformers import pipeline

image_to_text = pipeline("image-to-text", model="nlpconnect/vit-gpt2-image-captioning")

def vit_gpt2(urls: list[str]) -> list[str]:
    result = list(map(lambda a: a[0]['generated_text'], image_to_text(urls)))
    return result
