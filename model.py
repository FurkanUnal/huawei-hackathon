from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Hugging Face model path for LLaMA (you might need a specific model link)
model_name = "meta-llama/Llama-3.2-11B-Vision-Instruct"

# Load tokenizer and model from Hugging Face
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Input text
input_text = "Once upon a time"
inputs = tokenizer(input_text, return_tensors="pt")

# Generate text
outputs = model.generate(inputs['input_ids'], max_length=50)
generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

print(generated_text)
