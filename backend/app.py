from fastapi import FastAPI
from dotenv import load_dotenv
import os
from pyngrok import ngrok
import uvicorn


load_dotenv()

app = FastAPI()

@app.post("/send-otp")
async def send_otp():
    pass

@app.post("/confirm-otp")
async def confirm_otp():
    pass

@app.post("/get-search-results")
async def get_search_results():
    pass

@app.post("/get-api-key")
async def get_api_key():
    pass

def main():
    ngrok.set_auth_token(os.getenv("NGROK_AUTH_TOKEN"))  # Replace with your Ngrok auth token
    ngrok_tunnel = ngrok.connect(addr='8000', proto="http", hostname="noble-raven-entirely.ngrok-free.app")
    print("Public URL:", ngrok_tunnel.public_url)

    uvicorn.run(app, port=8000)

if __name__ == "__main__":
    main()
