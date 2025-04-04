import requests
import urllib
import json
import os
from dotenv import load_dotenv
import uuid
import hashlib
# LOCAL IMPORTS
from .universal_function import *

load_dotenv()


def get_zepto_credentials(location_data):
    pos_data = {"latitude":location_data['results'][0]['geometry']['location']['lat'],"longitude":location_data['results'][0]['geometry']['location']['lng']}
    log_debug(pos_data, 'pos_data')

    headers = {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'priority': 'u=1, i',
        'referer': 'https://www.zeptonow.com/search',
        'rsc': '1',
        'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Microsoft Edge";v="134"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0',
        'cookie': f'user_position={urllib.parse.quote(json.dumps(pos_data).replace(" ", ""))}; latitude={location_data['results'][0]['geometry']['location']['lat']}; longitude={location_data['results'][0]['geometry']['location']['lng']}'
    }

    params = {
        'url': 'https://www.zeptonow.com/search',
        'apikey': os.getenv('ZENROWS_API_KEY'),
        'custom_headers': 'true',
    }

    response = requests.get('https://api.zenrows.com/v1/', params=params, headers=headers)
    log_debug(response.headers, 'response')

    device_id = None
    session_id = None

    data_str = parse_cookies(dict(response.headers) ['Zr-Cookies'])
    storeId = json.loads(urllib.parse.unquote_plus(data_str['serviceability']))
    device_id = data_str['device_id']
    session_id = data_str['session_id']
    xrsf_token = data_str['XSRF-TOKEN']
    if storeId['primaryStore']['serviceable'] == False:
        storeId = 'location not servicable'
    else:
        storeId = storeId['primaryStore']['storeId']

   
    log_debug(storeId, 'storeid')
    
    data = {}
    data['ZEPTO'] = {
        'storeId': storeId,
        'deviceId': device_id,
        'sessionId': session_id,
        'xrsfToken': xrsf_token,
    }
    

    return data

def format_zepto_data(data):
    final_data = {'data': {}, 'credentials': data['credentials']}
    results_list = []
    base_product_url = "https://www.zeptonow.com/pn/"

    layout = data.get("data", {}).get("layout", [])

    for widget in layout:
        widget_name = widget.get("widgetName", "")
        if widget_name.startswith("SEARCHED_PRODUCTS"):
            items = widget.get("data", {}).get("resolver", {}).get("data", {}).get("items", [])
            for item in items:
                product_response = item.get("productResponse")
                if not product_response:
                    continue

                if not product_response.get("outOfStock", True):
                    try:
                        product_info = product_response.get("product", {})
                        variant_info = product_response.get("productVariant", {})

                        name = product_info.get("name")
                        if not name:
                            continue

                        # Use superSaverSellingPrice as per user example
                        price_raw = product_response.get("superSaverSellingPrice")
                        # Format price as string integer part after division by 100
                        price = str(price_raw // 100) if price_raw is not None else "N/A"

                        images = variant_info.get("images", [])
                        image_path = images[0]['path'] if images and 'path' in images[0] else None
                        # Use the provided function for image URL
                        image_url = convert_to_image_url_zepto(image_path, name) if image_path else ""

                        variant_id = variant_info.get("id")
                        if not variant_id:
                           continue

                        # Use the provided function for cleaning the name for URL
                        cleaned_name = blinkit_clean_string(name)
                        # Handle potential empty cleaned_name
                        if not cleaned_name:
                             cleaned_name = "product" # Default slug if name cleans to empty

                        product_url = f'{base_product_url}{cleaned_name}/pvid/{variant_id}'

                        quantity = variant_info.get("formattedPacksize", "N/A")

                        results_list.append({
                            "platform": "Zepto",
                            "name": name,
                            "price": price,
                            "image_url": image_url,
                            "product_url": product_url,
                            "quantity": quantity,
                        })
                    except (KeyError, IndexError, TypeError) as e:
                        # Skip product if data extraction fails with new logic
                        continue

    final_data['data'] = results_list

    return final_data

def search_zepto(item_name, location_data, credentials=None):

    for i in range(1):
        if credentials != "cred":
            return {"data": {}, "credentials": {}}
        try:
            credentials = get_zepto_credentials(location_data) if credentials is None else credentials
            
            print(credentials)
            
            storeId = credentials['ZEPTO']['storeId']
            session_id = credentials['ZEPTO']['sessionId']
            device_id = credentials['ZEPTO']['deviceId']
            xrsf_token = credentials['ZEPTO']['xrsfToken']


            if storeId == 'location not servicable':
                log_debug('Location not servicable', 'Error', 'ERROR')
                return {"data": {}, "credentials": {}}

            headers = {
                'accept': 'application/json, text/plain, */*',
                'accept-language': 'en-US,en;q=0.9',
                'app_sub_platform': 'WEB',
                'app_version': '12.64.1',
                'appversion': '12.64.1',
                'auth_revamp_flow': 'v2',
                'compatible_components': 'CONVENIENCE_FEE,RAIN_FEE,EXTERNAL_COUPONS,STANDSTILL,BUNDLE,MULTI_SELLER_ENABLED,PIP_V1,ROLLUPS,SCHEDULED_DELIVERY,SAMPLING_ENABLED,ETA_NORMAL_WITH_149_DELIVERY,ETA_NORMAL_WITH_199_DELIVERY,HOMEPAGE_V2,NEW_ETA_BANNER,VERTICAL_FEED_PRODUCT_GRID,AUTOSUGGESTION_PAGE_ENABLED,AUTOSUGGESTION_PIP,AUTOSUGGESTION_AD_PIP,BOTTOM_NAV_FULL_ICON,COUPON_WIDGET_CART_REVAMP,DELIVERY_UPSELLING_WIDGET,MARKETPLACE_CATEGORY_GRID,NO_PLATFORM_CHECK_ENABLED_V2,SUPER_SAVER:1,SUPERSTORE_V1,PROMO_CASH:0,24X7_ENABLED_V1,TABBED_CAROUSEL_V2,HP_V4_FEED,WIDGET_BASED_ETA,NEW_ROLLUPS_ENABLED,RERANKING_QCL_RELATED_PRODUCTS,PLP_ON_SEARCH,PAAN_BANNER_WIDGETIZED,ROLLUPS_UOM,DYNAMIC_FILTERS,PHARMA_ENABLED,AUTOSUGGESTION_RECIPE_PIP,SEARCH_FILTERS_V1,QUERY_DESCRIPTION_WIDGET,MEDS_WITH_SIMILAR_SALT_WIDGET,NEW_FEE_STRUCTURE,NEW_BILL_INFO,RE_PROMISE_ETA_ORDER_SCREEN_ENABLED,SUPERSTORE_V1,MANUALLY_APPLIED_DELIVERY_FEE_RECEIVABLE,MARKETPLACE_REPLACEMENT,ZEPTO_PASS,ZEPTO_PASS:1,ZEPTO_PASS:2,ZEPTO_PASS_RENEWAL,CART_REDESIGN_ENABLED,SHIPMENT_WIDGETIZATION_ENABLED,TABBED_CAROUSEL_V2,24X7_ENABLED_V1,PROMO_CASH:0,HOMEPAGE_V2,SUPER_SAVER:1,NO_PLATFORM_CHECK_ENABLED_V2,HP_V4_FEED,GIFT_CARD,SCLP_ADD_MONEY,GIFTING_ENABLED,OFSE,WIDGET_BASED_ETA,NEW_ETA_BANNER,',
                'content-type': 'application/json',
                'device_id': device_id,
                'deviceid': device_id,
                'marketplace_type': 'ZEPTO_NOW',
                'origin': 'https://www.zeptonow.com',
                'platform': 'WEB',
                'priority': 'u=1, i',
                'referer': 'https://www.zeptonow.com/',
                'request-signature': '84f14e08fa1db682e91c73cb849101407de6cb12bbc7081f51a6b8849531a6ef',
                'request_id': str(uuid.uuid4()),
                'requestid': str(uuid.uuid4()),
                'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Microsoft Edge";v="134"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
                'session_id': session_id,
                'sessionid': session_id,
                'store_etas': '{"[storeid]":10}'.replace('[storeid]', storeId),
                'store_id': storeId,
                'store_ids': storeId,
                'storeid': storeId,
                'tenant': 'ZEPTO',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0',
                'x-without-bearer': 'true',
                'x-xsrf-token': 'ArICbpkF8nqiU1a8TtmxP:uOOFJ9yzKNGAb-CX6fWd_kB1Yko.u39xyrAi0a3LtRiDtCndUCk+qZIW4pH3IjBHW83Qu+A',
                # 'cookie': '_gcl_au=1.1.306867764.1743534367; _fbp=fb.1.1743534367704.765124336133697702; mp_dcc8757645c1c32f4481b555710c7039_mixpanel=%7B%22distinct_id%22%3A%22%24device%3A490c50d0-dc08-444a-badd-2071b6146982%22%2C%22%24device_id%22%3A%22490c50d0-dc08-444a-badd-2071b6146982%22%2C%22%24initial_referrer%22%3A%22%24direct%22%2C%22%24initial_referring_domain%22%3A%22%24direct%22%2C%22__mps%22%3A%7B%7D%2C%22__mpso%22%3A%7B%22%24initial_referrer%22%3A%22%24direct%22%2C%22%24initial_referring_domain%22%3A%22%24direct%22%7D%2C%22__mpus%22%3A%7B%7D%2C%22__mpa%22%3A%7B%7D%2C%22__mpu%22%3A%7B%7D%2C%22__mpr%22%3A%5B%5D%2C%22__mpap%22%3A%5B%5D%7D; _ga=GA1.1.1821052556.1743534369; _ga_37QQVCR1ZS=GS1.1.1743534380.1.0.1743534380.60.0.0; _ga_52LKG2B3L1=GS1.1.1743534368.1.1.1743534427.1.0.167987248',
            }

            json_data = {
                'query': item_name,
                'pageNumber': 1,
                'intentId': str(uuid.uuid4()),
                'mode': 'AUTOSUGGEST',
                'userSessionId': session_id,
            }
            body = json.dumps(json_data, separators=(',', ':'))
            headers['Content-Length'] = str(len(body)) 

            params = {
                'url': 'https://api.zeptonow.com/api/v3/search',
                'apikey': os.getenv('ZENROWS_API_KEY'),
                'custom_headers': 'true',
            }

            response = requests.post(
                'https://api.zenrows.com/v1/',
                params=params,
                headers=headers,
                data=body 
            )
            log_debug(response.json(), 'response', 'INFO')

            return format_zepto_data({"data": response.json(), "credentials": credentials})
        except Exception as e:
            log_debug(str(e), 'Error', 'ERROR')
            credentials = get_zepto_credentials(location_data)

    return {"data":{}, "credentials": {}}
    
