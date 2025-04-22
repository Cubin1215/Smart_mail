from flask import Flask
from flask_cors import CORS
from app import create_app
import os
from threading import Thread

# Set environment variable to allow OAuth in development
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

app = create_app()

def run_oauth_server():
    # Create a second instance of the app for OAuth
    oauth_app = create_app()
    oauth_app.run(host="0.0.0.0", port=8000, debug=False)

if __name__ == "__main__":
    # Start OAuth server in a separate thread
    oauth_thread = Thread(target=run_oauth_server)
    oauth_thread.daemon = True
    oauth_thread.start()

    # Run the app on port 8001
    app.run(host='0.0.0.0', port=8001, debug=True) 