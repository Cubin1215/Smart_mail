from typing import Optional, Dict, Any
from .config import supabase
from .db import DatabaseService
from .models import User
from flask import Blueprint, redirect, url_for, session, request, jsonify
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
import os
import json

# Define the scopes needed for Gmail API
SCOPES = [
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://mail.google.com/',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify'
]

class AuthService:
    @staticmethod
    async def sign_up(email: str, password: str, name: str) -> Dict[str, Any]:
        try:
            # Sign up with Supabase Auth
            auth_response = supabase.auth.sign_up({
                "email": email,
                "password": password
            })
            
            if auth_response.user:
                # Create user in our database
                user = await DatabaseService.create_user(
                    email=email,
                    name=name
                )
                
                return {
                    "user": user.to_dict(),
                    "session": auth_response.session
                }
            else:
                raise Exception("Failed to create user")
                
        except Exception as e:
            raise Exception(f"Sign up failed: {str(e)}")

    @staticmethod
    async def sign_in(email: str, password: str) -> Dict[str, Any]:
        try:
            # Sign in with Supabase Auth
            auth_response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if auth_response.user:
                # Get user from our database
                user = await DatabaseService.get_user(auth_response.user.id)
                if not user:
                    raise Exception("User not found in database")
                
                return {
                    "user": user.to_dict(),
                    "session": auth_response.session
                }
            else:
                raise Exception("Invalid credentials")
                
        except Exception as e:
            raise Exception(f"Sign in failed: {str(e)}")

    @staticmethod
    async def sign_out(session_token: str) -> None:
        try:
            supabase.auth.sign_out()
        except Exception as e:
            raise Exception(f"Sign out failed: {str(e)}")

    @staticmethod
    async def get_current_user(session_token: str) -> Optional[User]:
        try:
            # Get user from session
            user_response = supabase.auth.get_user(session_token)
            
            if user_response.user:
                # Get user from our database
                user = await DatabaseService.get_user(user_response.user.id)
                return user
            return None
            
        except Exception as e:
            raise Exception(f"Failed to get current user: {str(e)}")

    @staticmethod
    async def reset_password(email: str) -> None:
        try:
            supabase.auth.reset_password_for_email(email)
        except Exception as e:
            raise Exception(f"Password reset failed: {str(e)}")

    @staticmethod
    async def update_password(new_password: str, session_token: str) -> None:
        try:
            supabase.auth.update_user({
                "password": new_password
            })
        except Exception as e:
            raise Exception(f"Password update failed: {str(e)}")

def authenticate():
    """Authenticate with Gmail API."""
    try:
        credentials_path = os.path.join(os.path.dirname(__file__), "credentials.json")
        token_path = os.path.join(os.path.dirname(__file__), "token.json")

        # Create flow instance to manage the OAuth 2.0 Authorization Grant Flow
        flow = Flow.from_client_secrets_file(
            credentials_path,
            scopes=SCOPES,
            redirect_uri="http://localhost:8001/auth/callback"
        )

        # Generate URL for request to Google's OAuth 2.0 server
        authorization_url, state = flow.authorization_url(
            access_type='offline',  # Enable refresh token
            include_granted_scopes='true',
            prompt='consent'  # Force consent screen to ensure refresh token
        )

        # Store the state in the session
        session['state'] = state

        return redirect(authorization_url)
    except Exception as e:
        return jsonify({"error": str(e), "success": False}), 500

def callback():
    """Handle the OAuth 2.0 callback."""
    try:
        credentials_path = os.path.join(os.path.dirname(__file__), "credentials.json")
        token_path = os.path.join(os.path.dirname(__file__), "token.json")
        
        print(f"Saving token to: {token_path}")

        # Create flow instance with the stored credentials
        flow = Flow.from_client_secrets_file(
            credentials_path,
            scopes=SCOPES,
            redirect_uri="http://localhost:8001/auth/callback"
        )

        # Use the authorization server's response to fetch the OAuth 2.0 tokens
        flow.fetch_token(authorization_response=request.url)

        # Store credentials
        credentials = flow.credentials
        token_data = {
            'token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_uri': credentials.token_uri,
            'client_id': credentials.client_id,
            'client_secret': credentials.client_secret,
            'scopes': credentials.scopes
        }

        # Save the credentials for the next run
        with open(token_path, 'w') as token_file:
            json.dump(token_data, token_file)
            print("Token saved successfully")

        # Redirect to the frontend dashboard on port 3000
        return redirect("http://localhost:3000/dashboard")
    except Exception as e:
        print(f"Error in callback: {str(e)}")
        return jsonify({"error": str(e), "success": False}), 500 