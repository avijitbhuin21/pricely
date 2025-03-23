import re
from difflib import SequenceMatcher
from collections import defaultdict

def normalize_quantity(quantity_str):
    """Normalize quantity strings to a standard format."""
    # Convert to lowercase and remove extra spaces
    quantity = quantity_str.lower().strip()
    
    # Handle common unit variations
    quantity = quantity.replace('ltr', 'l')
    quantity = quantity.replace('litre', 'l')
    quantity = quantity.replace('liters', 'l')
    
    # Standardize ml/l formatting
    if 'ml' in quantity and not quantity.endswith('ml'):
        quantity = re.sub(r'(\d+)\s*ml', r'\1ml', quantity)
    if 'l' in quantity and not quantity.endswith('l'):
        quantity = re.sub(r'(\d+)\s*l', r'\1l', quantity)
        
    # Convert "X x Y ml" format to a standard
    if 'x' in quantity:
        parts = quantity.split('x')
        if len(parts) == 2:
            try:
                count = int(parts[0].strip())
                size = parts[1].strip()
                # Standardize the format
                quantity = f"{count}x{size}"
            except ValueError:
                pass
    
    return quantity

def normalize_name(name):
    """Normalize product names for better matching."""
    # Convert to lowercase
    name = name.lower()
    
    # Remove common words that don't help with matching
    stop_words = ['soft', 'drink', 'bottle', 'pack', 'of', 'combo', '&', 'and', 'can']
    for word in stop_words:
        name = name.replace(f" {word} ", " ")
    
    # Remove special characters and extra spaces
    name = re.sub(r'[^\w\s]', ' ', name)
    name = re.sub(r'\s+', ' ', name).strip()
    
    return name

def calculate_similarity(name1, name2):
    """Calculate text similarity between two product names."""
    return SequenceMatcher(None, name1, name2).ratio()

def is_quantity_match(q1, q2):
    """Check if two quantities can be considered a match."""
    # Direct match
    if q1 == q2:
        return True
    
    # Common variations
    conversions = {
        '750ml': '0.75l',
        '1500ml': '1.5l',
        '2000ml': '2l',
        '2l': '2000ml',
        '1.5l': '1500ml',
        '0.75l': '750ml',
        '1l': '1000ml',
        '1000ml': '1l',
        '500ml': '0.5l',
        '0.5l': '500ml',
        '1kg': '1000g',
        '1000g': '1kg',
        '500g': '0.5kg',
        '0.5kg': '500g',
        '200g': '0.2kg',
        '0.2kg': '200g',
        '250g': '0.25kg',
        '0.25kg': '250g',
        '750g': '0.75kg',
        '0.75kg': '750g',
        '1.5kg': '1500g',
        '1500g': '1.5kg',
        '2kg': '2000g',
        '2000g': '2kg',
    }
    
    if q2 in conversions and conversions[q2] == q1:
        return True
    if q1 in conversions and conversions[q1] == q2:
        return True
    
    return False

def find_best_product_matches(data_sources):
    """Find matching products across different platforms."""
    normalized_products = {}
    all_product_groups = []
    processed_indices = defaultdict(set)
    
    # Step 1: Normalize all product data
    for source, products in data_sources.items():
        normalized_products[source] = []
        
        # Handle different data structures from each source
        for product_group in products.values():
            for product in product_group:
                normalized_name = normalize_name(product['name'])
                normalized_quantity = normalize_quantity(product['quantity'])
                
                normalized_products[source].append({
                    'original': product,
                    'normalized_name': normalized_name,
                    'normalized_quantity': normalized_quantity
                })
    
    # Step 2: Process each source as a starting point
    for source_name in normalized_products:
        for i, product in enumerate(normalized_products[source_name]):
            # Skip if this product was already processed from this source
            if i in processed_indices[source_name]:
                continue
                
            processed_indices[source_name].add(i)
            
            current_group = {
                source_name: product['original'],
                'name_signature': product['normalized_name'],
                'quantity_signature': product['normalized_quantity']
            }
            
            # Find matches in other sources
            for other_source in normalized_products:
                if other_source == source_name:
                    continue
                    
                best_match_idx = None
                best_score = 0
                
                for j, other_product in enumerate(normalized_products[other_source]):
                    if j in processed_indices[other_source]:
                        continue
                        
                    # Calculate name similarity
                    name_similarity = calculate_similarity(
                        product['normalized_name'], 
                        other_product['normalized_name']
                    )
                    
                    # Check if quantities match
                    quantity_match = is_quantity_match(
                        product['normalized_quantity'],
                        other_product['normalized_quantity']
                    )
                    
                    # Calculate overall score - prioritize quantity match
                    score = name_similarity * (2 if quantity_match else 0.5)
                    
                    if score > best_score and score > 0.6:  # Threshold for matching
                        best_score = score
                        best_match_idx = j
                
                if best_match_idx is not None:
                    current_group[other_source] = normalized_products[other_source][best_match_idx]['original']
                    processed_indices[other_source].add(best_match_idx)
            
            # Include all groups, even if they have only one platform
            all_product_groups.append(current_group)
    
    return all_product_groups

def format_output(product_groups):
    """Format the matched product groups to the required output format."""
    results = []
    
    for group in product_groups:
        # Count the number of platforms for sorting
        platform_count = sum(1 for key in group if key not in ['name_signature', 'quantity_signature'])
        
        # Select a representative image and name
        # Prioritize sources in this order: blinkit, instamart, bigbasket, dmart, zepto
        representative = None
        for source in ['blinkit', 'instamart', 'bigbasket', 'dmart', 'zepto']:
            if source in group:
                representative = group[source]
                break
        
        if not representative:
            continue  # Skip if no representative found (shouldn't happen)
        
        # Build the buy_button dictionary
        buy_button = {}
        for source in ['blinkit', 'instamart', 'bigbasket', 'dmart', 'zepto']:
            if source in group:
                product = group[source]
                buy_button[source] = {
                    "price": str(product['price']),
                    "url": product['url']
                }
        
        # Create the result entry
        result = {
            "match_count": platform_count,  # Store count for sorting
            "data": {
                "image": representative['image'],
                "name": representative['name'],
                "quantity": representative['quantity'],
                "buy_button": buy_button
            }
        }
        
        results.append(result)
    
    # Sort by match count (descending)
    results.sort(key=lambda x: x["match_count"], reverse=True)
    
    # Remove the match_count field from the final output
    for result in results:
        del result["match_count"]
    
    return results

def compare_products(data):
    """Main function to compare products across platforms."""
    # Preprocess data to ensure consistent structure
    processed_data = {}
    for source, source_data in data.items():
        processed_data[source] = source_data
    
    # Find matching products
    product_groups = find_best_product_matches(processed_data)
    
    # Format the output
    results = format_output(product_groups)
    
    return results

# Example usage:
# data = {
#     'blinkit': json.loads(open('blinkit.json').read())['data'],
#     'instamart': json.loads(open('instamart.json').read())['data'],
#     'bigbasket': json.loads(open('bigbasket.json').read())['data'],
#     'dmart': json.loads(open('Dmart.json').read())['data'],
#     'zepto': json.loads(open('zepto.json').read())['data']
# }
# comparison_results = compare_products(data)

# with open('comparison.json', 'w') as f:
#     json.dump(comparison_results, f, indent=4)