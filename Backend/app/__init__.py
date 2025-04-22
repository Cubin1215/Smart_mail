from flask import Flask
from flask_cors import CORS
from .routes.email import email_bp
from .auth import authenticate, callback
import os

def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)
    
    # Configure session
    app.secret_key = os.getenv('FLASK_SECRET_KEY', 'dev')
    
    # Configure CORS
    CORS(app, resources={
        r"/*": {
            "origins": ["*"],
            "supports_credentials": True
        }
    })
    
    # Register auth routes
    app.add_url_rule('/auth/gmail', 'auth_gmail', authenticate)
    app.add_url_rule('/auth/callback', 'auth_callback', callback)
    
    # Register email routes blueprint
    app.register_blueprint(email_bp, url_prefix='/api/email')
    
    return app 