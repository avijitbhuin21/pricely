from dotenv import load_dotenv
import requests
import os
from datetime import datetime
import json
import urllib.parse
import time
import random
import re

load_dotenv()

DEBUG = True

def log_debug(data, name=None, level="DEBUG"):
    if DEBUG:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        if isinstance(data, (dict, list)):
            data = json.dumps(data, indent=2)
        message = f"[{timestamp}] [{level}] {name}: {data}" if name else f"[{timestamp}] [{level}] {data}"
        print(message)

def geocode_location(location_name, api_key=random.choice(os.getenv('Google_map_api_key', '').split())):
    try:
        if not location_name:
            return {"error": "Location name is required"}
        if not api_key:
            return {"error": "API key is required"}
        geocode_url = "https://maps.googleapis.com/maps/api/geocode/json"
        params = {
            'address': location_name,
            'key': api_key
        }
        response = requests.get(geocode_url, params=params)
        response.raise_for_status()
        data = response.json()
        if data.get('status') != 'OK':
            error_message = data.get('error_message', 'Unknown error occurred')
            return {"error": error_message}
        return data
    except requests.exceptions.RequestException as e:
        error_message = f"Request failed: {str(e)}"
        return {"error": error_message}
    except Exception as e:
        error_message = f"Unexpected error: {str(e)}"
        return {"error": error_message}

def get_place_autocomplete(input_query, api_key= random.choice(os.getenv('Google_map_api_key').split()), language='en', types='geocode'):
    try:
        if not input_query:
            log_debug("Input query is required", "Error", "ERROR")
            return {"error": "Input query is required"}
        if not api_key:
            return {"error": "API key is required"}        
        base_url = "https://maps.googleapis.com/maps/api/place/autocomplete/json"
        params = {
            'input': input_query,
            'key': api_key,
            'language': language,
            'types': types
        }
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        data = response.json()
        if data.get('status') != 'OK':
            error_message = data.get('error_message', 'Unknown error occurred')
            log_debug(error_message, "GoogleAPI", "ERROR")
            return {"error": error_message}
        suggestions = []
        for idx, prediction in enumerate(data.get('predictions', [])):
            suggestion = prediction.get('description')
            if suggestion:
                suggestions.append(suggestion)
                print(f"{idx+1}. {suggestion}")
        time.sleep(1)
        if not suggestions:
            log_debug("No suggestions found", "Warning")
        return suggestions
    except requests.exceptions.RequestException as e:
        error_message = f"Request failed: {str(e)}"
        return {"error": error_message}
    except Exception as e:
        error_message = f"Unexpected error: {str(e)}"
        return {"error": error_message}
    
def parse_cookies(cookie_string):
    cookie_dict = {}
    if not cookie_string:
        return cookie_dict
    try:
        cookies = cookie_string.split('; ')
        for cookie in cookies:
            main_part = cookie.split(';')[0]
            if '=' in main_part:
                name, value = main_part.split('=', 1)
                cookie_dict[name] = value
            else:
                log_debug(f"Skipping malformed cookie: {cookie}", "parse_cookies", "WARNING")
    except Exception as e:
        return {}
    return cookie_dict

def extract_cookies_from_response(response):
    try:
        if not response:
            return {}
        headers = dict(response.headers)
        headers = {k.lower(): v for k, v in headers.items()}
        if 'set-cookie' not in headers:
            return {}
        cookie_string = headers['set-cookie']
        cookies = parse_cookies(cookie_string)
        return cookies
    except Exception as e:
        return {}

def dict_to_cookie_string(cookie_dict):
    return "; ".join(f"{key}={value}" for key, value in cookie_dict.items())

def blinkit_clean_string(string):
    cleaned_string = re.sub(r"[^a-zA-Z0-9 ]", "", string)
    cleaned_string = re.sub(r" +", " ", cleaned_string)
    return cleaned_string.replace(" ","-").lower()

def format_name(input_string, original = False):
    split_parts = re.split(r'[^a-zA-Z0-9\s]', input_string)
    if original:
        return  [part for part in split_parts if part][0].strip()
    return  [part for part in split_parts if part][0].lower().strip()

def convert_to_image_url_zepto(path, name):
    def zepto_format_string(input_string):
        import re
        result = re.sub(r'[^a-zA-Z0-9]', '-', input_string)
        result = re.sub(r'-+', '-', result)
        return result
    return f'https://cdn.zeptonow.com/production/ik-seo/{path.split(".")[0]}/{zepto_format_string(name)}.{path.split(".")[-1]}'
