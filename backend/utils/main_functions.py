import os
import random
from dotenv import load_dotenv
from datetime import datetime
import base64
import json,time, psutil
from pyngrok import ngrok
import asyncio
import time
from functools import partial 


#LOCAL IMPORTS
from .universal_function import *
from .comparison_algorithm import *
from .BigBasket_Handler import search_bigbasket
from .Blinkit_Handler import search_blinkit
from .Instamart_Handler import search_instamart
from .Dmart_Handler import search_dmart
from .Zepto_Handler import search_zepto


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



async def get_compared_data_async(search_query, location_data, initial_credentials=None):
    """
    Fetches data from all platforms concurrently, compares results,
    and returns combined data and credentials.
    """
    start_time = time.time()
    log_debug(f"Starting concurrent search for '{search_query}'", "Orchestrator", "INFO")

    if initial_credentials is None:
        initial_credentials = {}

    loop = asyncio.get_running_loop()

    # --- Create Tasks for each platform using run_in_executor ---
    # We use partial to pass arguments to the functions running in the executor
    tasks = []

    # BigBasket
    bb_cred = initial_credentials.get('BIGBASKET')
    bb_task = loop.run_in_executor(None, partial(search_bigbasket, search_query, location_data, {'BigBasket': bb_cred} if bb_cred else None))
    tasks.append(bb_task)
    log_debug("Created BigBasket task", "Orchestrator")

    # Blinkit
    bl_cred = initial_credentials.get('BLINKIT')
    bl_task = loop.run_in_executor(None, partial(search_blinkit, search_query, location_data, {'BLINKIT': bl_cred} if bl_cred else None))
    tasks.append(bl_task)
    log_debug("Created Blinkit task", "Orchestrator")

    # Instamart
    im_cred = initial_credentials.get('INSTAMART')
    im_task = loop.run_in_executor(None, partial(search_instamart, search_query, location_data, {'INSTAMART': im_cred} if im_cred else None))
    tasks.append(im_task)
    log_debug("Created Instamart task", "Orchestrator")

    # DMart
    dm_cred = initial_credentials.get('DMART') # DMart doesn't seem to use credentials in the provided code
    dm_task = loop.run_in_executor(None, partial(search_dmart, search_query, location_data, None)) # Pass None for creds
    tasks.append(dm_task)
    log_debug("Created DMart task", "Orchestrator")

    # Zepto
    zp_cred = initial_credentials.get('ZEPTO')
    zp_task = loop.run_in_executor(None, partial(search_zepto, search_query, location_data, {'ZEPTO': zp_cred} if zp_cred else None))
    tasks.append(zp_task)
    log_debug("Created Zepto task", "Orchestrator")

    # --- Run tasks concurrently and gather results ---
    log_debug(f"Running {len(tasks)} tasks concurrently...", "Orchestrator", "INFO")
    results = await asyncio.gather(*tasks, return_exceptions=True)
    log_debug("All tasks completed.", "Orchestrator", "INFO")

    # --- Process Results ---
    all_products = []
    final_credentials = {}
    platform_names = ["BigBasket", "Blinkit", "Instamart", "DMart", "Zepto"] # Keep order consistent with tasks

    for i, res in enumerate(results):
        platform = platform_names[i].upper()
        if isinstance(res, Exception):
            log_debug(f"Task for {platform} failed: {res}", "Orchestrator", "ERROR")
            # Keep original credential if task failed, if it existed
            if platform in initial_credentials:
                 final_credentials[platform] = initial_credentials[platform]
        elif isinstance(res, dict) and "data" in res and "credentials" in res:
            log_debug(f"Task for {platform} succeeded.", "Orchestrator", "SUCCESS")
            platform_data = res.get("data", [])
            platform_creds = res.get("credentials", {})

            if isinstance(platform_data, list):
                all_products.extend(platform_data)
                log_debug(f"Added {len(platform_data)} products from {platform}", "Orchestrator")
            else:
                 log_debug(f"Received non-list data from {platform}: {type(platform_data)}", "Orchestrator", "WARNING")


            # Extract and store credentials correctly
            if platform_creds and platform in platform_creds:
                 final_credentials[platform] = platform_creds[platform]
                 log_debug(f"Updated credentials for {platform}", "Orchestrator")
            elif platform in initial_credentials :
                 # If handler didn't return creds but we had initial ones, keep them
                 final_credentials[platform] = initial_credentials[platform]
                 log_debug(f"Kept initial credentials for {platform} as none were returned", "Orchestrator", "INFO")
            # Handle DMart case where credentials might always be None/empty
            elif platform == "DMART":
                 final_credentials[platform] = {} # Or whatever default DMart should have

        else:
            log_debug(f"Unexpected result type from {platform}: {type(res)}", "Orchestrator", "ERROR")
            # Keep original credential if task gave weird result
            if platform in initial_credentials:
                 final_credentials[platform] = initial_credentials[platform]


    log_debug(f"Total products collected before comparison: {len(all_products)}", "Orchestrator", "INFO")

    compared_data = []
    if all_products:
        try:
            log_debug("Running comparison algorithm...", "Orchestrator", "INFO")
            comparison_start_time = time.time()
            # Consider running in executor if Mistral call is blocking and slow
            # compared_data = await loop.run_in_executor(None, partial(group_and_sort_products, all_products, search_query))
            compared_data = group_and_sort_products(all_products, search_query)
            comparison_time = time.time() - comparison_start_time
            log_debug(f"Comparison finished in {comparison_time:.2f}s. Found {len(compared_data)} groups.", "Orchestrator", "SUCCESS")
        except Exception as e:
            log_debug(f"Comparison algorithm failed: {e}", "Orchestrator", "ERROR")
            compared_data = [] # Return empty list on failure
    else:
        log_debug("No products found to compare.", "Orchestrator", "WARNING")

    # --- Format Final Output ---
    final_result = {
        "data": compared_data,
        "credentials": final_credentials
    }

    total_time = time.time() - start_time
    log_debug(f"Orchestration completed in {total_time:.2f} seconds.", "Orchestrator", "SUCCESS")

    return final_result

def get_compared_results(search_query, lat, lon, credentials=None):
    loc = geocode_location(f'{lat},{lon}')
    try:
        loop = asyncio.get_event_loop()
        data = loop.run_until_complete(get_compared_data_async(search_query, loc, credentials))
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        data = loop.run_until_complete(get_compared_data_async(search_query, loc, credentials))
        loop.close()

    return data
