import os
import random
from dotenv import load_dotenv
from datetime import datetime
import base64
import json,time, psutil
from pyngrok import ngrok
import asyncio

#LOCAL IMPORTS
from .universal_function import *
from .comparison_algorithm import *


load_dotenv()

def get_api_key():
    print("Starting get_api_key function")
    api_keys = os.getenv('Google_map_api_key', '')
    print(f"Raw environment variable value: {api_keys[:10]}..." if api_keys else "No API key found")
    
    api_keys = api_keys.split()
    if not api_keys:
        raise ValueError("No API keys found in environment variable 'Google_map_api_key'")
    
    print(f"Found {len(api_keys)} API keys")
    key = random.choice(api_keys)
    now = datetime.now()
    hour_number = int(now.strftime("%I"))
    print(f"Current hour (12-hour format): {hour_number}")
    
    try:
        encoded_key = key.encode('utf-8')
        for i in range(hour_number):
            encoded_key = base64.b64encode(encoded_key)
            print(f"Encoding iteration {i+1}/{hour_number} completed")
        
        final_key = str(encoded_key, 'utf-8')
        print("Successfully encoded API key")
        return final_key
    except Exception as e:
        print(f"Error during key encoding: {str(e)}")
        raise

def kill_ngrok_processes():
    ngrok.set_auth_token(os.getenv("NGROK_AUTH_TOKEN"))
    # Kill using pyngrok
    try:
        ngrok.kill()
        print("Killed ngrok processes via pyngrok")
    except Exception as e:
        print(f"pyngrok kill error: {e}")
    
    # Find and kill by process name
    for proc in psutil.process_iter(['pid', 'name']):
        try:
            if 'ngrok' in proc.info['name'].lower():
                print(f"Killing ngrok process with PID {proc.info['pid']}")
                psutil.Process(proc.info['pid']).terminate()
                time.sleep(0.5)
                if psutil.pid_exists(proc.info['pid']):
                    psutil.Process(proc.info['pid']).kill()
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass

    # Additional OS-specific commands
    try:
        if os.name == 'nt':  # Windows
            os.system('taskkill /F /IM ngrok.exe')
        else:  # Linux/Mac
            os.system('pkill -f ngrok')
    except Exception as e:
        print(f"OS command error: {e}")
        
    # Wait to ensure processes are terminated
    time.sleep(2)

def get_compared_results(search_query, lat, lon, credentials):
    loc = geocode_location(str(lat) + ',' + str(lon))
    try:
        loop = asyncio.get_event_loop()
        data = loop.run_until_complete(get_compared_data_with_timing(search_query, loc, credentials))
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        data = loop.run_until_complete(get_compared_data_with_timing(search_query, loc, credentials))
        loop.close()

    return data