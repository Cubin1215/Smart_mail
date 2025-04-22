from flask import Blueprint, jsonify, request, redirect, session
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import os
from ..email_assistant import (
    setup_authentication,
    get_recent_unread_messages,
    generate_reply,
    send_reply
)
from google.auth.transport.requests import Request
import traceback

email_bp = Blueprint("email", __name__)

# Gmail API scopes
SCOPES = [
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://mail.google.com/',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify'
]

@email_bp.route("/check-auth")
def check_auth():
    """Check if Gmail authentication is valid."""
    try:
        token_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "token.json")
        print(f"Checking token at path: {token_path}")
        
        if not os.path.exists(token_path):
            print("Token file does not exist")
            return jsonify({"success": True, "authenticated": False})
            
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                print("Token expired, attempting refresh")
                creds.refresh(Request())
                # Save refreshed credentials
                with open(token_path, 'w') as token:
                    token.write(creds.to_json())
                return jsonify({"success": True, "authenticated": True})
            print("Invalid credentials")
            return jsonify({"success": True, "authenticated": False})
            
        print("Valid credentials found")
        return jsonify({"success": True, "authenticated": True})
    except Exception as e:
        print(f"Error in check_auth: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@email_bp.route("/unread")
def get_unread():
    """Get unread emails."""
    try:
        creds = setup_authentication()
        service = build("gmail", "v1", credentials=creds)
        messages = get_recent_unread_messages(service)
        return jsonify({"success": True, "messages": messages})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@email_bp.route("/generate-reply", methods=["POST"])
def generate_email_reply():
    """Generate a reply for a specific email."""
    try:
        print("Starting generate_email_reply...")
        data = request.get_json()
        print(f"Received data: {data}")
        
        email_id = data.get("emailId")
        user_context = data.get("userContext", "")
        user_name = data.get("userName", "User")
        
        print(f"Email ID: {email_id}")
        print(f"User context: {user_context}")
        print(f"User name: {user_name}")
        
        if not email_id:
            print("Error: Email ID is required")
            return jsonify({"success": False, "error": "Email ID is required"}), 400
        
        print("Setting up authentication...")
        creds = setup_authentication()
        service = build("gmail", "v1", credentials=creds)
        
        print(f"Fetching email details for ID: {email_id}")
        # Get email details with full format to include the body
        email_detail = service.users().messages().get(
            userId='me', id=email_id, format='full'
        ).execute()
        
        # Add required fields to email_detail
        headers = email_detail.get('payload', {}).get('headers', [])
        email_detail['subject'] = next((h['value'] for h in headers if h['name'].lower() == 'subject'), "No Subject")
        print(f"Email subject: {email_detail['subject']}")
        
        # Extract and decode email body
        try:
            body = ""
            if 'parts' in email_detail.get('payload', {}):
                for part in email_detail['payload']['parts']:
                    if part.get('mimeType') == 'text/plain':
                        body = part.get('body', {}).get('data', '')
                        break
            elif 'body' in email_detail.get('payload', {}):
                body = email_detail['payload']['body'].get('data', '')
            
            if body:
                import base64
                body = base64.urlsafe_b64decode(body.encode('ASCII')).decode('utf-8')
                print("Successfully extracted email body")
            else:
                print("Warning: No email body found")
                body = email_detail.get('snippet', '')
        except Exception as e:
            print(f"Error extracting email body: {str(e)}")
            body = email_detail.get('snippet', '')
        
        email_detail['body'] = body
        
        print("Generating reply...")
        # Generate reply
        gemini_context = f"You are helping {user_name} write professional email replies."
        reply = generate_reply(
            service=service,
            email_detail=email_detail,
            gemini_context=gemini_context,
            user_context=user_context,
            user_name=user_name
        )
        
        print("Reply generated successfully")
        return jsonify({"success": True, "reply": reply})
    except Exception as e:
        print(f"Error generating reply: {str(e)}")
        print(f"Error type: {type(e)}")
        print(f"Error traceback: {traceback.format_exc()}")
        return jsonify({"success": False, "error": str(e)}), 500

@email_bp.route("/send-reply", methods=["POST"])
def send_email_reply():
    """Send a reply to a specific email."""
    try:
        data = request.get_json()
        email_id = data.get("emailId")
        reply_text = data.get("replyText")
        
        if not email_id or not reply_text:
            return jsonify({"success": False, "error": "Email ID and reply text are required"}), 400
        
        creds = setup_authentication()
        service = build("gmail", "v1", credentials=creds)
        
        success, result = send_reply(service, 'me', email_id, reply_text)
        if success:
            return jsonify({"success": True, "messageId": result})
        else:
            return jsonify({"success": False, "error": result}), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500 