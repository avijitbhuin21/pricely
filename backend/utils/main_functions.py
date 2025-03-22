import os
import random
from dotenv import load_dotenv
from datetime import datetime
import base64
import json

load_dotenv()

# Local imports
from utils.universal_function import *
from utils.comparison_algorithm import compare_products
from utils.Blinkit_Handler import search_blinkit
from utils.BigBasket_Handler import search_bigbasket
from utils.Dmart_Handler import search_dmart
from utils.Instamart_Handler import search_instamart
from utils.Zepto_Handler import search_zepto


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

import concurrent.futures
import time
from typing import Dict, Any

def get_compared_data_with_timing(search_query: str) -> tuple:
    # Define the search functions and their respective platforms
    search_tasks = {
        'blinkit': search_blinkit,
        'instamart': search_instamart,
        'bigbasket': search_bigbasket,
        'dmart': search_dmart,
        'zepto': search_zepto
    }
    
    # Store the results and timing information
    results = {}
    timing_info = {
        'total_start': time.time(),
        'platform_times': {},
        'sequential_estimate': 0
    }
    
    # Use ThreadPoolExecutor for concurrent execution
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        # Start all search tasks
        future_to_platform = {}
        for platform, search_function in search_tasks.items():
            # Wrap each function to measure its execution time
            def timed_search(platform, func, query):
                start = time.time()
                try:
                    result = func(query)
                    elapsed = time.time() - start
                    return {
                        'data': result,
                        'time': elapsed
                    }
                except Exception as exc:
                    elapsed = time.time() - start
                    return {
                        'data': {},
                        'error': str(exc),
                        'time': elapsed
                    }
            
            future = executor.submit(timed_search, platform, search_function, search_query)
            future_to_platform[future] = platform
        
        # Process results as they complete
        for future in concurrent.futures.as_completed(future_to_platform):
            platform = future_to_platform[future]
            try:
                result_with_timing = future.result()
                results[platform] = result_with_timing['data']
                timing_info['platform_times'][platform] = result_with_timing['time']
                timing_info['sequential_estimate'] += result_with_timing['time']
            except Exception as exc:
                print(f"{platform} search generated an exception: {exc}")
                results[platform] = {}
    
    # Calculate the total concurrent execution time
    timing_info['total_time'] = time.time() - timing_info['total_start']
    timing_info['speedup'] = timing_info['sequential_estimate'] / timing_info['total_time']
    
    # Compare the collected data
    compared_data = compare_products(results)
    
    return compared_data, timing_info