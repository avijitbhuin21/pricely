from typing import Dict, Optional, Any, List, Tuple, Union
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
    """Generate a random string of the specified length."""
    try:
        random_string = ''.join(random.choice(RANDOM_STRING_CHARS) for _ in range(length))
        log_debug(f"Generated random string: {random_string}", name="generate_random_string")
        return random_string
    except Exception as e:
        log_debug(f"Error generating random string: {str(e)}", name="generate_random_string", level="ERROR")
        return ''.join(['0' for _ in range(length)])  # Fallback to a simple string


def get_store_data(lat: float, lng: float, place: str, cookies: dict) -> Dict[str, Any]:
    """Get store data based on location coordinates."""
    log_debug(f"Getting store data for lat: {lat}, lon: {lng}, place: {place}", name="get_store_data")
    
    try:
        headers = base_headers.copy()
        headers.update({
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
        
        for attempt in range(3):
            try:
                params = {
                    'url': LOCATION_ENDPOINT,
                    'apikey': os.getenv('ZENROWS_API_KEY'),
                    'custom_headers': 'true'
                }
                
                response = requests.post(
                    'https://api.zenrows.com/v1/',
                    params=params,
                    headers=headers,
                    json=json_data,
                    timeout=30
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
                
                return {"status": "success", "primary_store": primary_store, "secondary_store": secondary_store}
                
            except requests.RequestException as e:
                response_json = {}
                try:
                    response_json = response.json() if 'response' in locals() else {}
                except:
                    pass
                
                if 'statusMessage' in response_json:
                    if response_json['statusMessage'] == "Sorry! We do not deliver to this location yet.":
                        return {"status": "failed", "reason": "Location not serviceable"}
                
                log_debug(f"Attempt {attempt+1} failed: {str(e)}", name="get_store_data", level="ERROR")
                if attempt == 2:
                    return {"status": "failed", "reason": f"Request failed after 3 attempts: {str(e)}"}
    
    except Exception as e:
        log_debug(f"Unexpected error in get_store_data: {str(e)}", name="get_store_data", level="ERROR")
    
    return {"status": "failed", "reason": "An unexpected error occurred"}


def update_cookie_with_location(location_data: Dict[str, Any], cookies: Dict[str, str]) -> Tuple[Optional[Dict[str, str]], Optional[str], Optional[str], Optional[str]]:
    """Update cookies with location data and get store information."""
    log_debug("Starting location update process", name="update_cookie_with_location")
    
    try:
        if not location_data or 'results' not in location_data or not location_data['results']:
            return None, None, None, "Invalid location data"
        
        # Extract location details
        location = location_data['results'][0]
        lat = location['geometry']['location']['lat']
        lng = location['geometry']['location']['lng']
        formatted_address = location['formatted_address']
        
        # Update store data
        store_data = get_store_data(lat, lng, formatted_address, cookies)
        log_debug(store_data, name="update_cookie_with_location")
        
        if store_data['status'] == 'success':
            primary_store, secondary_store = store_data['primary_store'], store_data['secondary_store']
            
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
            return cookies, primary_store, secondary_store, None
        else:
            return None, None, None, store_data.get('reason', "Failed to get store data")
            
    except Exception as e:
        log_debug(f"Failed to update location: {str(e)}", name="update_cookie_with_location", level="ERROR")
        return None, None, None, f"Error updating location: {str(e)}"


def get_initial_cookies() -> Optional[Dict[str, str]]:
    """Get initial cookies needed for Swiggy Instamart."""
    for attempt in range(3):
        try:
            url = 'https://www.swiggy.com/instamart/search/'
            log_debug(url, name="get_initial_cookies")
            
            params = {
                'url': url,
                'apikey': os.getenv('ZENROWS_API_KEY'), 
                'custom_headers': 'true'
            }
            
            response = requests.get(
                'https://api.zenrows.com/v1/',
                headers=base_headers,
                params=params,
                timeout=30
            )
            response.raise_for_status()
            
            if 'Zr-Cookies' not in dict(response.headers):
                log_debug("No cookies found in response headers", name="get_initial_cookies", level="ERROR")
                continue
                
            cookies = parse_cookies(dict(response.headers)['Zr-Cookies'])
            cookies['imOrderAttribution'] = '{%22entryId%22:%22BANNER-undefined%22%2C%22entryName%22:%22store-menu-items-instamart%22}'
            log_debug(cookies, name="get_initial_cookies", level="INFO")
            return cookies
            
        except requests.RequestException as e:
            log_debug(f"Attempt {attempt+1} failed: {str(e)}", name="get_initial_cookies", level="ERROR")
        except Exception as e:
            log_debug(f"Unexpected error: {str(e)}", name="get_initial_cookies", level="ERROR")
    
    log_debug("Failed to get initial cookies after 3 attempts", name="get_initial_cookies", level="ERROR")
    return None


def get_instamart_credentials(location_data: Dict[str, Any]) -> Dict[str, Any]:
    """Get credentials required for Instamart API calls."""
    try:
        cookies = get_initial_cookies()
        if not cookies:
            log_debug("Failed to get initial cookies", name="get_instamart_credentials", level="ERROR")
            return {"status": "failed", "reason": "Failed to get initial cookies"}
        
        result = update_cookie_with_location(location_data, cookies)
        if not result or result[0] is None:
            error_message = result[3] if result else "Unknown error"
            log_debug(f"Failed to update location: {error_message}", name="get_instamart_credentials", level="ERROR")
            return {"status": "failed", "reason": error_message}
        
        updated_cookies, primary_store, secondary_store, error = result
        
        if error:
            return {"status": "failed", "reason": error}
        
        data = {
            'INSTAMART': {
                'cookies': dict_to_cookie_string(updated_cookies),
                'primary_store': primary_store,
                'secondary_store': secondary_store
            }
        }
        
        return data
        
    except Exception as e:
        log_debug(f"Error in get_instamart_credentials: {str(e)}", name="get_instamart_credentials", level="ERROR")
        return {"status": "failed", "reason": f"Unexpected error: {str(e)}"}


def format_instamart_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Format Instamart search results into a standardized structure."""
    try:
        final_data = {'data': {}, 'credentials': data['credentials']}
        
        if not data.get('data') or not data['data'].get('data') or not data['data']['data'].get('widgets') or not data['data']['data']['widgets'][0].get('data'):
            log_debug("Invalid data structure for formatting", name="format_instamart_data", level="ERROR")
            return final_data
        
        for i in data['data']['data']['widgets'][0]['data']:
            try:
                all_variations = i.get('variations', [])
                product_id = i.get('product_id', '')
                
                for m in all_variations:
                    try:
                        if not m.get('display_name') or not m.get('price') or not m.get('images') or not m.get('quantity'):
                            continue
                            
                        item = {
                            'name': m['display_name'],
                            'price': m['price'].get('offer_price', 0),
                            'image': f'https://instamart-media-assets.swiggy.com/swiggy/image/upload/{m["images"][0]}',
                            'quantity': m['quantity'],
                            'url': f'https://www.swiggy.com/instamart/item/{product_id}?storeId={m.get("store_id", "")}'
                        }
                        
                        formatted_name = format_name(m['display_name'])
                        
                        if m.get('inventory', {}).get('in_stock', False):
                            if formatted_name in final_data['data']:
                                final_data['data'][formatted_name].append(item)
                            else:
                                final_data['data'][formatted_name] = [item]
                    except Exception as e:
                        log_debug(f"Error processing variation: {str(e)}", name="format_instamart_data", level="ERROR")
                        continue
            except Exception as e:
                log_debug(f"Error processing product: {str(e)}", name="format_instamart_data", level="ERROR")
                continue
        
        return final_data
        
    except Exception as e:
        log_debug(f"Error formatting data: {str(e)}", name="format_instamart_data", level="ERROR")
        return {'data': {}, 'credentials': data.get('credentials', {})}


def search_instamart(item_name: str, location_data: Dict[str, Any], credentials: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Search for items on Instamart."""
    try:
        if credentials is None:
            credentials = get_instamart_credentials(location_data)
        
        if not credentials or "status" in credentials:
            error_reason = credentials.get("reason", "Unknown error") if credentials and "status" in credentials else "Failed to get credentials"
            log_debug(f"Credentials error: {error_reason}", name="search_instamart", level="ERROR")
            return {"data": {}, "credentials": {}}
        
        if 'INSTAMART' not in credentials:
            log_debug("Invalid credentials format", name="search_instamart", level="ERROR")
            return {"data": {}, "credentials": {}}
        
        for attempt in range(3):
            try:
                data = credentials['INSTAMART']
                cookies = data['cookies']
                primary_store = data['primary_store']
                secondary_store = data['secondary_store']
                
                # Update headers for search request
                headers = base_headers.copy()
                headers.update({
                    'referer': f'{BASE_URL}/instamart/search?custom_back=true&query={urllib.parse.quote(item_name)}',
                    'matcher': generate_random_string(),
                    'Cookie': cookies
                })
                
                updated_url = (
                    f"{SEARCH_ENDPOINT}?pageNumber=0&searchResultsOffset=0&limit=40"
                    f"&query={urllib.parse.quote(item_name)}&ageConsent=false&layoutId=2671"
                    f"&pageType=INSTAMART_AUTO_SUGGEST_PAGE&isPreSearchTag=false"
                    f"&highConfidencePageNo=0&lowConfidencePageNo=0&voiceSearchTrackingId="
                    f"&storeId={primary_store}&primaryStoreId={primary_store}&secondaryStoreId={secondary_store}"
                )
                
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
                
                response = requests.post(
                    'https://api.zenrows.com/v1/',
                    params=params,
                    headers=headers,
                    json=json_data,
                    timeout=30
                )
                response.raise_for_status()
                
                log_debug(f"Search response status: {response.status_code}", name="search_instamart", level="INFO")
                response_data = response.json()
                
                return format_instamart_data({"data": response_data, "credentials": credentials})
                
            except requests.RequestException as e:
                log_debug(f"Search request failed (attempt {attempt+1}): {str(e)}", name="search_instamart", level="ERROR")
                if attempt == 2:
                    return {"data": {}, "credentials": credentials}
                    
                # Get fresh credentials for next attempt
                if attempt < 2:
                    credentials = get_instamart_credentials(location_data)
                    if not credentials or "status" in credentials:
                        return {"data": {}, "credentials": {}}
                        
            except Exception as e:
                log_debug(f"Unexpected error in search (attempt {attempt+1}): {str(e)}", name="search_instamart", level="ERROR")
                if attempt == 2:
                    return {"data": {}, "credentials": credentials}
                
    except Exception as e:
        log_debug(f"Fatal error in search_instamart: {str(e)}", name="search_instamart", level="ERROR")
    
    return {"data": {}, "credentials": {}}