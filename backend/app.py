from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
from pyngrok import ngrok

# LOCAL IMPORTS
from utils.main_functions import *

load_dotenv()



app = Flask(__name__)

@app.route("/send-otp", methods=["POST"])
def send_otp():
    pass

@app.route("/confirm-otp", methods=["POST"])
def confirm_otp():
    pass

@app.route("/get-search-results", methods=["POST"])
def get_search_results():
    data = request.get_json()
    item_name = data.get("item_name")
    lat = data.get("lat")
    lon = data.get("lon")
    credentials = data.get("credentials", {})
    
    print(f"Received search request:")
    print(f"Item name: {item_name}")
    print(f"Latitude: {lat}")
    print(f"Longitude: {lon}")
    print(f"Credentials: {credentials}")

    data = get_compared_results(item_name, lat, lon, credentials)
    print(data)
    
    return jsonify({"status": "success", "data": data})

@app.route("/get-api-key", methods=["POST"])
def get_api_key_route():
    print("Entering get_api_key_route handler")
    key = get_api_key()
    return jsonify(key)

def main():
    kill_ngrok_processes()
    ngrok.set_auth_token(os.getenv("NGROK_AUTH_TOKEN"))
    ngrok_tunnel = ngrok.connect(addr='5000', proto="http", hostname="noble-raven-entirely.ngrok-free.app")
    print("Public URL:", ngrok_tunnel.public_url)
    
    app.run(port=5000, debug=True)  
    
if __name__ == "__main__":
    main()


# remove the logo in the home page
#  so update the name and the location section similer to zepto  name pricely- compare it
# add the hamburger menu
# app opening animation, they will send
# in the sign in page add a drop shadow to the white secction.
# password hide and show button
# instead of the solid pink colour add the gradient colour they provided
# make the recent search logos a little smaller.
# in the searchbar add changing names. like provided
# add slider in the home page.
# recommended daily needs also needs a animation
# remove the borders from the recent search and keep them small


# web analytics
# edit offer prices from the admin panel
# add the sliding thingy
# normal anaytics
# in the admin panel we need to update slideshow images as well
# the daily needs sections should be updated from the admin panel
# add push notifications as well.

