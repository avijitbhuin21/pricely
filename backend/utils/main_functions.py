import os
import random
from dotenv import load_dotenv
from datetime import datetime
import base64
import json

load_dotenv()

def get_api_key():
    api_keys = os.getenv('Google_map_api_key', '').split()
    if not api_keys:
        raise ValueError("No API keys found in environment variable 'Google_map_api_key'")
    
    key = random.choice(api_keys)
    now = datetime.now()
    hour_number = int(now.strftime("%I"))
    
    encoded_key = key.encode('utf-8')
    for _ in range(hour_number):
        encoded_key = base64.b64encode(encoded_key)
    
    return str(encoded_key, 'utf-8')

def decode_api_key(encoded_key):
    now = datetime.now()
    hour_number = int(now.strftime("%I"))
    
    decoded_key = encoded_key
    for _ in range(hour_number):
        try:
            decoded_key = base64.b64decode(decoded_key)
        except Exception as e:
            raise ValueError(f"Failed to decode API key: {e}")
    
    return decoded_key.decode('utf-8')

