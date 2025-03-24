import re
from difflib import SequenceMatcher

from utils.Blinkit_Handler import search_blinkit
from utils.BigBasket_Handler import search_bigbasket
from utils.Dmart_Handler import search_dmart
from utils.Instamart_Handler import search_instamart
from utils.Zepto_Handler import search_zepto

import asyncio
import time
from typing import Dict, Any

from utils.universal_function import *

def compare_grocery_products(data, search_query):
    """
    Compare products from different grocery stores based on name similarity and quantity.
    
    Args:
        data (dict): Data from different grocery stores
        search_query (str): Search query to filter relevant products
    
    Returns:
        dict: Formatted data with grouped products and store comparisons
    """
    # Extract all products and credentials from different stores
    all_products = []
    store_credentials = {}
    
    # Process BigBasket data
    if 'bigbasket' in data:
        store_credentials['BIGBASKET'] = data['bigbasket'].get('credentials', {}).get('BigBasket', {})
        for query, products in data['bigbasket'].get('data', {}).items():
            for product in products:
                all_products.append({
                    'store': 'bigbasket',
                    'name': product.get('name', ''),
                    'price': parse_price(product.get('price', '0')),
                    'quantity': product.get('quantity', ''),
                    'image': product.get('image', ''),
                    'url': product.get('url', '')
                })
    
    # Process Blinkit data
    if 'Blinkit' in data:
        store_credentials['BLINKIT'] = data['Blinkit'].get('credentials', {}).get('BLINKIT', {})
        for query, products in data['Blinkit'].get('data', {}).items():
            for product in products:
                all_products.append({
                    'store': 'blinkit',
                    'name': product.get('name', ''),
                    'price': parse_price(product.get('price', '0')),
                    'quantity': product.get('quantity', ''),
                    'image': product.get('image', ''),
                    'url': product.get('url', '')
                })
    
    # Process Dmart data
    if 'Dmart' in data:
        store_credentials['DMART'] = data['Dmart'].get('credentials') or {}
        for query, products in data['Dmart'].get('data', {}).items():
            for product in products:
                all_products.append({
                    'store': 'dmart',
                    'name': product.get('name', ''),
                    'price': parse_price(product.get('price', '0')),
                    'quantity': product.get('quantity', ''),
                    'image': product.get('image', ''),
                    'url': product.get('url', '')
                })
    
    # Process Instamart data - deduplicate entries with same name but different quantities
    if 'Instamart' in data:
        store_credentials['INSTAMART'] = data['Instamart'].get('credentials', {}).get('INSTAMART', {})
        instamart_products = []
        seen_product_names = set()
        
        for query, products in data['Instamart'].get('data', {}).items():
            for product in products:
                product_name = product.get('name', '').lower().strip()
                # Only add the first instance of each product name from Instamart
                if product_name not in seen_product_names:
                    seen_product_names.add(product_name)
                    instamart_products.append({
                        'store': 'instamart',
                        'name': product.get('name', ''),
                        'price': parse_price(product.get('price', '0')),
                        'quantity': product.get('quantity', ''),
                        'image': product.get('image', ''),
                        'url': product.get('url', '')
                    })
        
        all_products.extend(instamart_products)
    
    # Process Zepto data
    if 'Zepto' in data:
        store_credentials['ZEPTO'] = data['Zepto'].get('credentials', {}).get('ZEPTO', {})
        for query, products in data['Zepto'].get('data', {}).items():
            for product in products:
                all_products.append({
                    'store': 'zepto',
                    'name': product.get('name', ''),
                    'price': parse_price(product.get('price', '0')),
                    'quantity': product.get('quantity', ''),
                    'image': product.get('image', ''),
                    'url': product.get('url', '')
                })
    
    # Filter products by relevance to search query
    filtered_products = filter_by_relevance(all_products, search_query)
    
    # Normalize product names and quantities
    normalized_products = [normalize_product(product) for product in filtered_products]
    
    # Group similar products
    grouped_products = group_similar_products(normalized_products)
    
    # Format the output
    result = format_output(grouped_products, store_credentials)
    
    return result

def parse_price(price):
    """Convert price to integer regardless of input format."""
    if isinstance(price, int):
        return price
    if isinstance(price, str):
        # Extract digits from the string
        digits = re.findall(r'\d+', price)
        if digits:
            return int(digits[0])
    return 0

def normalize_product(product):
    """Normalize product information for better comparison."""
    normalized = product.copy()
    
    # Normalize name: lowercase, remove extra spaces
    name = product['name'].lower().strip()
    
    # Keep original name for display
    normalized['original_name'] = product['name']
    normalized['name'] = name
    
    # Normalize quantity
    normalized['original_quantity'] = product['quantity']
    normalized['normalized_quantity'] = normalize_quantity(product['quantity'])
    
    return normalized

def normalize_quantity(quantity_str):
    """Normalize quantity to a standard format for comparison."""
    if not quantity_str:
        return ""
    
    quantity_str = quantity_str.lower().strip()
    
    # Define conversion chart
    conversions = {
        '750ml': '0.75l', '1500ml': '1.5l', '2000ml': '2l', '2l': '2000ml',
        '1.75l': '1750ml', '1750ml': '1.75l', '1.5l': '1500ml', '0.75l': '750ml',
        '1l': '1000ml', '1000ml': '1l', '500ml': '0.5l', '0.5l': '500ml',
        '200ml': '0.2l', '0.2l': '200ml', '600ml': '0.6l', '0.6l': '600ml',
        '300ml': '0.3l', '0.3l': '300ml', '125ml': '0.125l', '0.125l': '125ml',
        '1.8l': '1800ml', '1800ml': '1.8l', '1.2l': '1200ml', '1200ml': '1.2l',
        # Weight conversions
        '1kg': '1000g', '1000g': '1kg', '500g': '0.5kg', '0.5kg': '500g',
        '200g': '0.2kg', '0.2kg': '200g', '250g': '0.25kg', '0.25kg': '250g',
        '750g': '0.75kg', '0.75kg': '750g', '1.5kg': '1500g', '1500g': '1.5kg',
        '2kg': '2000g', '2000g': '2kg',
        # Pack equivalents
        '2pcs': '2 pieces', '2pieces': '2 pcs', '2pack': '2 pcs',
        '4pcs': '4 pieces', '4pieces': '4 pcs', '4pack': '4 pcs',
        '6pcs': '6 pieces', '6pieces': '6 pcs', '6pack': '6 pcs',
        '8pcs': '8 pieces', '8pieces': '8 pcs', '8pack': '8 pcs',
        '10pcs': '10 pieces', '10pieces': '10 pcs', '10pack': '10 pcs',
        '10 x 125ml': '10pcs', '10pieces': '10 x 125ml',
        '4 x 150ml': '4pcs', '4pieces': '4 x 150ml',
    }
    
    # Remove spaces between number and unit
    quantity_str = re.sub(r'(\d+)\s+([a-zA-Z]+)', r'\1\2', quantity_str)
    
    # Check for direct conversion
    if quantity_str in conversions:
        return conversions[quantity_str]
    
    # Check for multi-pack notation (e.g., "2 x 1.2 ltr")
    multi_pack_match = re.match(r'(\d+)\s*(?:x|pack|pcs|pieces|pc)\s*(?:(\d+(?:\.\d+)?)\s*([a-zA-Z]+))?', quantity_str)
    if multi_pack_match:
        count = multi_pack_match.group(1)
        
        # If it's a format like "2 x 1.2 ltr"
        if multi_pack_match.group(2) and multi_pack_match.group(3):
            value = multi_pack_match.group(2)
            unit = multi_pack_match.group(3)
            return f"{count} x {value}{unit}"
        
        # If it's just "2 pack" or "2 pieces"
        return f"{count} pieces"
    
    # If no conversion needed, return as is
    return quantity_str

def calculate_name_similarity(name1, name2):
    """Calculate similarity between two product names."""
    return SequenceMatcher(None, name1, name2).ratio()

def extract_keywords(text):
    """Extract important keywords from text."""
    text = text.lower()
    # Remove common stopwords
    stopwords = ['and', 'the', 'a', 'an', 'in', 'on', 'at', 'of', 'for', 'with', 'by']
    words = text.split()
    keywords = [word for word in words if word not in stopwords]
    return keywords

def filter_by_relevance(products, search_query):
    """Filter products based on relevance to search query."""
    if not search_query:
        return products
    
    query_keywords = extract_keywords(search_query.lower())
    if not query_keywords:
        return products
    
    # Extract brand names from the query if present
    potential_brands = ['frooti', 'slice', 'maaza', 'appy', 'real', 'paper boat']
    query_brands = [brand for brand in potential_brands if brand in search_query.lower()]
    
    relevant_products = []
    for product in products:
        product_name = product['name'].lower()
        
        # Calculate keyword presence score
        keyword_score = sum(1 for keyword in query_keywords if keyword in product_name) / max(1, len(query_keywords))
        
        # Calculate overall similarity score
        similarity_score = calculate_name_similarity(search_query.lower(), product_name)
        
        # Brand match bonus
        brand_bonus = 0
        if query_brands:
            for brand in query_brands:
                if brand in product_name:
                    brand_bonus = 0.2
                    break
        
        # Combined relevance score (weighted average)
        relevance_score = 0.6 * keyword_score + 0.2 * similarity_score + brand_bonus
        
        # Add product if above threshold
        if relevance_score >= 0.4:  # Threshold for relevance
            relevant_products.append(product)
    
    return relevant_products

def group_similar_products(products):
    """Group similar products based on name and quantity."""
    groups = []
    
    for product in products:
        matched = False
        
        for group in groups:
            representative = group[0]
            
            # Check if quantity matches exactly
            if product['normalized_quantity'] == representative['normalized_quantity']:
                # Check name similarity
                similarity = calculate_name_similarity(product['name'], representative['name'])
                if similarity >= 0.8:  # 80% similarity threshold
                    group.append(product)
                    matched = True
                    break
        
        if not matched:
            # Create a new group
            groups.append([product])
    
    return groups

def format_output(grouped_products, store_credentials):
    """Format the output as required."""
    result_data = []
    
    for group in grouped_products:
        if not group:
            continue
        
        # Use the first product's name and image for the group
        group_representative = group[0]
        
        # Create the product entry
        product_entry = {
            "name": group_representative['original_name'],
            "quantity": group_representative['original_quantity'],
            "image_url": group_representative['image'],
            "buy_button": {}
        }
        
        # Add buy buttons for each store
        for product in group:
            store_name = product['store'].lower()
            formatted_store_name = store_name.capitalize() if store_name != 'instamart' else 'Instamart'
            if store_name == 'bigbasket':
                formatted_store_name = 'BIGBASKET'
            elif store_name == 'blinkit':
                formatted_store_name = 'blinkit'
            elif store_name == 'dmart':
                formatted_store_name = 'DMART'
            elif store_name == 'zepto':
                formatted_store_name = 'ZEPTO'
            
            product_entry["buy_button"][formatted_store_name] = {
                "price": product['price'],
                "url": product['url']
            }
        
        result_data.append(product_entry)
    
    # Ensure all stores have credentials in the output, even if empty
    all_credentials = {
        "ZEPTO": store_credentials.get("ZEPTO", {}),
        "BIGBASKET": store_credentials.get("BIGBASKET", {}),
        "BLINKIT": store_credentials.get("BLINKIT", {}),
        "INSTAMART": store_credentials.get("INSTAMART", {}),
        "DMART": store_credentials.get("DMART", {})
    }
    
    return {
        "data": result_data,
        "credentials": all_credentials
    }

async def get_compared_data_with_timing(search_query: str, location_data, credentials = None) -> tuple:
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
    
    async def process_platform(platform, search_function, query):
        """Asynchronous wrapper for each platform's search function"""
        start = time.time()
        try:
            # Run the synchronous function in a thread pool
            result = await asyncio.to_thread(search_function, query, location_data, credentials)
            elapsed = time.time() - start
            
            results[platform] = result
            
        except Exception as exc:
            print(f"{platform} search generated an exception: {exc}")
            results[platform] = {}
    
    # Create tasks for all platforms
    tasks = []
    for platform, search_function in search_tasks.items():
        tasks.append(process_platform(platform, search_function, search_query))
    
    # Wait for all search operations to complete
    await asyncio.gather(*tasks)
    
    log_debug(results, "get_compared_data_with_timing", "INFO")
    
    # Format data for comparison algorithm
    formatted_data = {
        'Blinkit': results.get('blinkit', {}),
        'Instamart': results.get('instamart', {}),
        'bigbasket': results.get('bigbasket', {}),
        'Dmart': results.get('dmart', {}),
        'Zepto': results.get('zepto', {})
    }
    
    # Use our comparison algorithm
    compared_data = compare_grocery_products(formatted_data, search_query)
    
    # Ensure all required store credentials are present
    for store in ['ZEPTO', 'INSTAMART', 'BLINKIT', 'BIGBASKET', 'DMART']:
        if store not in compared_data['credentials']:
            compared_data['credentials'][store] = {}
    
    return compared_data