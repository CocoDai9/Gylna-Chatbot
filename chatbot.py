import openai
from dotenv import load_dotenv
import os

# Load .env variables
load_dotenv()

# Set the OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

# Use the correct API call for newer versions of openai
response = openai.completions.create(
    model="gpt-4",  # You can also use "gpt-3.5" or "gpt-4" based on availability
    prompt="Hello, who are you?",  # You may want to change this dynamic input
    max_tokens=150  # You can adjust the token limit based on your needs
)

# Log the response to ensure it's working
print("Model used:", response['model'])  # Check which model is used
print("Response content:", response['choices'][0]['text'])  # Adjust the response structure for the new API
