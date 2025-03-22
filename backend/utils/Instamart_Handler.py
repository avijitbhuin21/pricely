from typing import Dict, Optional, Any, List
import requests
import os
import urllib.parse
import random
from dotenv import load_dotenv

# LOCAL IMPORTS
from .universal_function import *

load_dotenv()

# Class-level constants
BASE_URL = "https://www.swiggy.com"
SEARCH_ENDPOINT = f"{BASE_URL}/api/instamart/search"
LOCATION_ENDPOINT = f"{BASE_URL}/api/instamart/home/select-location"
RANDOM_STRING_CHARS = "0123456789abcdefg"
RANDOM_STRING_LENGTH = 23

base_headers = {
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9',
            'content-type': 'application/json',
            'origin': BASE_URL,
            'priority': 'u=1, i',
            'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Microsoft Edge";v="134"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0',
            'x-build-version': '2.258.0',
            'imOrderAttribution': '{%22entryId%22:%22BANNER-undefined%22%2C%22entryName%22:%22store-menu-items-instamart%22}'
        }



def generate_random_string(length: int = RANDOM_STRING_LENGTH) -> str:
    random_string = ''.join(random.choice(RANDOM_STRING_CHARS) for _ in range(length))
    log_debug(f"Generated random string: {random_string}", name="generate_random_string")
    return random_string

def get_store_data(lat: float, lng: float, place: str, cookies: dict) -> None:
    log_debug(f"Getting store data for lat: {lat}, lon: {lng}, place: {place}", name="get_store_data")
    base_headers.update({
        'referer': f'{BASE_URL}/instamart',
        'matcher': generate_random_string(),
        'Cookie': dict_to_cookie_string(cookies)
    })
    
    json_data = {
        'data': {
            'lat': lat,
            'lng': lng,
            'address': place,
            'addressId': '',
            'annotation': place,
            'clientId': 'INSTAMART-APP',
        }
    }
    for i in range(3):
        try:
            params = {
                'url': LOCATION_ENDPOINT,
                'apikey': os.getenv('ZENROWS_API_KEY'),
                'custom_headers': 'true'
            }
            response = requests.post(
                'https://api.zenrows.com/v1/',
                params=params,
                headers=base_headers,
                json=json_data
            )
            response.raise_for_status()
            
            data = response.json()
            log_debug(data, "Store Data")
            
            primary_store = data['data']['storeId']
            try:
                secondary_store = data['data']['storesDetails'][1]['id']
                
            except (KeyError, IndexError):
                secondary_store = ''
                log_debug("No secondary store found", name="get_store_data", level="INFO")
            
            return primary_store, secondary_store
                
        except requests.RequestException as e:
            log_debug(f"Failed to get store data: {str(e)}", name="get_store_data", level="ERROR")
    return False

def update_cookie_with_location(location_data, cookies) -> None:
    log_debug("Starting location update process", name="update_cookie_with_location")
    for i in range(3):
        try:
            
            # Extract location details
            location = location_data['results'][0]
            lat = location['geometry']['location']['lat']
            lng = location['geometry']['location']['lng']
            formatted_address = location['formatted_address']
            
            # Update store data
            xx = get_store_data(lat, lng, formatted_address, cookies)
            if xx != False:
                primary_store, secondary_store = xx
            
            # Update location cookie
            location_info = {
                "lat": lat,
                "lng": lng,
                "address": formatted_address,
                "id": "",
                "annotation": formatted_address,
                "name": ""
            }
            cookies['userLocation'] = urllib.parse.quote(str(location_info))
            return cookies, primary_store, secondary_store
            
        except Exception as e:
            log_debug(f"Failed to update location: {str(e)}", name="update_cookie_with_location", level="ERROR")
    return False



def get_initial_cookies() -> None:
    for i in range(3):
        try:
            url = 'https://www.swiggy.com/instamart/search/'
            log_debug(url)
            params = {
                'url': url,
                'apikey': os.getenv('ZENROWS_API_KEY'), 
                'custom_headers': 'true'
            }
            response = requests.get(
                'https://api.zenrows.com/v1/',
                headers=base_headers,
                params=params  # This line was missing
            )
            log_debug(response.text, name="initialize_instamart_agent", level="INFO")
            response.raise_for_status()
            
            cookies = parse_cookies(dict(response.headers)['Zr-Cookies'])
            cookies['imOrderAttribution'] = '{%22entryId%22:%22BANNER-undefined%22%2C%22entryName%22:%22store-menu-items-instamart%22}'
            log_debug(cookies, name="initialize_instamart_agent", level="INFO")
            return cookies
            
        except requests.RequestException as e:
            log_debug(f"Failed to initialize Instamart session: {str(e)}", name="initialize_instamart_agent", level="ERROR")
    return False


def get_instamart_credentials(location_data: Dict[str, Any]) -> Dict[str, Any]:
    xx = get_initial_cookies()
    if xx != False:
        cookies = xx
    else:
        log_debug("Failed to get initial cookies", name="get_instamart_credentials", level="ERROR")

    xx = update_cookie_with_location(location_data, cookies)
    if xx != False:
        c, ps,ss = xx
        cookies.update(c)
    else:
        log_debug("Failed to update location", name="get_instamart_credentials", level="ERROR")

    data = {}
    data['INSTAMART'] = {
        'cookies': dict_to_cookie_string(cookies),
        'primary_store': ps,
        'secondary_store': ss
    }
    return data

def format_instamart_data(data: Dict[str, Any]) -> Dict[str, Any]:
    final_data = {'data': {}, 'credentials': data['credentials']}

    for i in data['data']['data']['widgets'][0]['data']:
        all_variations = i['variations']
        product_id = i['product_id']
        for m in all_variations:
            item ={
            'name' : m['display_name'],
            'price' : m['price']['offer_price'],
            'image' : f'https://instamart-media-assets.swiggy.com/swiggy/image/upload/{m['images'][0]}',
            'quantity' : m['quantity'],
            'url' : f'https://www.swiggy.com/instamart/item/{product_id}?storeId={m['store_id']}'
            }
            formatted_name = format_name(m['display_name'])
            if m['inventory']['in_stock'] == True:
                if formatted_name in final_data['data']:
                    final_data['data'][formatted_name].append(item)
                else:
                    final_data['data'][formatted_name] = [item]
    return final_data

def search_instamart(item_name, location_data, credentials = None) -> Dict[str, Any]:
    credentials = get_instamart_credentials(location_data) if credentials is None else credentials

    for i in range(3):
        try:
            data = credentials['INSTAMART']
            cookies = data['cookies']
            primary_store = data['primary_store']
            secondary_store = data['secondary_store']
            
            # Update headers for search request
            base_headers.update({
                'referer': f'{BASE_URL}/instamart/search?custom_back=true&query={urllib.parse.quote(item_name)}',
                'matcher': generate_random_string(),
                'Cookie': cookies
            })
            

            updated_url = SEARCH_ENDPOINT + f'?pageNumber=0&searchResultsOffset=0&limit=40&query={urllib.parse.quote(item_name)}&ageConsent=false&layoutId=2671&pageType=INSTAMART_AUTO_SUGGEST_PAGE&isPreSearchTag=false&highConfidencePageNo=0&lowConfidencePageNo=0&voiceSearchTrackingId=&storeId={primary_store}&primaryStoreId={primary_store}&secondaryStoreId={secondary_store}'
            log_debug(updated_url, name="search_instamart")
            params = {
                'url': updated_url,
                'apikey': os.getenv('ZENROWS_API_KEY'),
                'custom_headers': 'true'
            }
                
            json_data = {
                'facets': {},
                'sortAttribute': '',
            }
            
            try:
                response = requests.post(
                    'https://api.zenrows.com/v1/',
                    params=params,
                    headers=base_headers,
                    json=json_data
                )
                response.raise_for_status()
                log_debug(response.text, name="search_instamart", level="INFO")
                log_debug(f"Search response status: {response.status_code}", name="search_instamart", level="INFO")
                response_data = response.json()
                log_debug(response_data, name="search_instamart", level="DEBUG")
                
                return format_instamart_data({"data": response_data, "credentials": credentials})
                
            except requests.RequestException as e:
                log_debug(f"Search request failed: {str(e)}", name="search_instamart", level="ERROR")
                raise
        except Exception as e:
            log_debug(f"Search request failed: {str(e)}", name="search_instamart", level="ERROR")
            credentials = get_instamart_credentials(location_data)

    return {"data":{}, "credentials": {}}
