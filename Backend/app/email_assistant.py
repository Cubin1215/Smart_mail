import os
import sys
import base64
import traceback
import re
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv

import google.generativeai as genai
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

# Create blueprint
email_bp = Blueprint('email', __name__)

# ---------------- Gmail API & Scopes Setup ----------------
# If modifying these scopes, delete the file token.json.
# Using multiple scopes to ensure proper access
SCOPES = [
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://mail.google.com/',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify'
]

# ---------------- Gemini API Setup ----------------
# Configure Gemini API with your API key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable is not set")
genai.configure(api_key=api_key)

def setup_authentication():
    """
    Set up Gmail API authentication and return credentials.
    """
    creds = None
    token_path = os.path.join(os.path.dirname(__file__), "token.json")
    credentials_path = os.path.join(os.path.dirname(__file__), "credentials.json")
    
    # Check if token exists
    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)
    
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
            except Exception as e:
                print(f"Error refreshing credentials: {e}")
                # If refresh fails, force re-authentication
                if os.path.exists(token_path):
                    os.remove(token_path)
                flow = InstalledAppFlow.from_client_secrets_file(credentials_path, SCOPES)
                creds = flow.run_local_server(port=8080)
        else:
            flow = InstalledAppFlow.from_client_secrets_file(credentials_path, SCOPES)
            creds = flow.run_local_server(port=8080)
        
        # Save the credentials for the next run
        with open(token_path, "w") as token:
            token.write(creds.to_json())
    
    return creds

def get_recent_unread_messages(service, user_id="me", limit=30):
    """
    Retrieve at most `limit` unread emails.
    Returns a list of dictionaries containing email id, subject, snippet, and date.
    """
    unread_messages = []
    page_token = None

    while len(unread_messages) < limit:
        try:
            response = service.users().messages().list(
                userId=user_id,
                q='is:unread category:primary',
                pageToken=page_token,
                maxResults=limit - len(unread_messages)
            ).execute()
            messages = response.get('messages', [])
            if not messages:
                break
            unread_messages.extend(messages)
            page_token = response.get('nextPageToken')
            if not page_token:
                break
        except HttpError as error:
            print(f"An error occurred retrieving messages: {error}")
            break

    detailed_messages = []
    for msg in unread_messages:
        try:
            msg_id = msg['id']
            message_detail = service.users().messages().get(
                userId=user_id, id=msg_id, format='full'
            ).execute()
            headers = message_detail.get('payload', {}).get('headers', [])
            subject = next((h['value'] for h in headers if h['name'].lower() == 'subject'), "No Subject")
            from_header = next((h['value'] for h in headers if h['name'].lower() == 'from'), "Unknown Sender")
            to_header = next((h['value'] for h in headers if h['name'].lower() == 'to'), "")
            date = next((h['value'] for h in headers if h['name'].lower() == 'date'), None)
            snippet = message_detail.get('snippet', "No snippet available")
            
            # Convert email date to timestamp
            if date:
                from email.utils import parsedate_to_datetime
                try:
                    date_obj = parsedate_to_datetime(date)
                    date = int(date_obj.timestamp() * 1000)  # Convert to milliseconds
                except Exception as e:
                    print(f"Error parsing date: {e}")
                    date = None
            
            detailed_messages.append({
                'id': msg_id,
                'subject': subject,
                'from': from_header,
                'to': to_header,
                'date': date,
                'snippet': snippet
            })
        except HttpError as error:
            print(f"An error occurred retrieving message details: {error}")
            continue
    
    return detailed_messages

def select_reply_recipients(headers):
    """
    Given a list of headers from the original email, display the recipients and ask the user how to reply.
    Returns a tuple: (to_field, cc_field)
    """
    original_from = next((h['value'] for h in headers if h['name'].lower() == 'from'), '')
    original_to = next((h['value'] for h in headers if h['name'].lower() == 'to'), '')
    original_cc = next((h['value'] for h in headers if h['name'].lower() == 'cc'), '')

    print("\nOriginal email recipient details:")
    print(f"From: {original_from}")
    print(f"To: {original_to}")
    print(f"Cc: {original_cc if original_cc else 'None'}")
    print("\nHow would you like to reply?")
    print("1. Reply only to the sender")
    print("2. Reply to all (sender, To, and Cc)")
    print("3. Reply to specific email addresses")
    
    choice = input("Enter 1, 2, or 3: ").strip()
    
    if choice == "1":
        to_field = original_from
        cc_field = ""
    elif choice == "2":
        to_field = original_from
        # Combine original 'To' and 'Cc' (if present)
        cc_field = original_to
        if original_cc:
            cc_field = cc_field + ", " + original_cc if cc_field else original_cc
    elif choice == "3":
        addresses = input("Enter the email addresses to reply to (comma-separated): ").strip()
        to_field = addresses
        cc_field = ""
    else:
        print("Invalid choice. Defaulting to reply only to the sender.")
        to_field = original_from
        cc_field = ""
    
    return to_field, cc_field

def process_generated_email(email_text):
    """
    Additional processing to remove instructions and placeholders from generated emails.
    """
    # Remove bracketed instructions
    clean_text = re.sub(r'\[.*?\]', '', email_text)
    
    # Remove placeholder indicators
    clean_text = re.sub(r'e\.g\.,\s*', '', clean_text)
    
    # Fix any double spaces from removals
    clean_text = re.sub(r'\s+', ' ', clean_text)
    
    # Ensure blank lines between paragraphs
    paragraphs = [p.strip() for p in clean_text.split('\n\n') if p.strip()]
    return '\n\n'.join(paragraphs)

def format_email_for_mobile(content):
    """
    Format email content to ensure it's readable on mobile devices.
    Uses proper paragraph breaks and ensures greeting is separate.
    """
    # First, clean up any extraneous whitespace and line breaks
    content = re.sub(r'\s+', ' ', content).strip()
    
    # Look for common greeting patterns and ensure they're on their own line
    greeting_patterns = [
        r'(Dear [^,]+,)', 
        r'(Hello [^,]+,)',
        r'(Hi [^,]+,)'
    ]
    
    for pattern in greeting_patterns:
        match = re.search(pattern, content)
        if match:
            greeting = match.group(1)
            # Replace the greeting with a properly formatted version
            content = content.replace(greeting, f"{greeting}\n\n")
            break
    
    # Look for common closing patterns and format them properly
    closing_patterns = [
        r'(Best regards,?\s*[A-Za-z ]+)$', 
        r'(Sincerely,?\s*[A-Za-z ]+)$',
        r'(Regards,?\s*[A-Za-z ]+)$',
        r'(Best,?\s*[A-Za-z ]+)$'
    ]
    
    for pattern in closing_patterns:
        match = re.search(pattern, content)
        if match:
            closing = match.group(1)
            # Split the closing into signature and name
            if ',' in closing:
                parts = closing.split(',', 1)
                formatted_closing = f"\n\n{parts[0]},\n{parts[1].strip()}"
                content = content.replace(closing, formatted_closing)
            break
    
    # Split the remaining content into logical paragraphs
    # Look for sentences that could start new paragraphs
    paragraph_splits = [
        r'(\. [A-Z][^.!?]+[.!?])', # Sentences starting with capital letters
        r'(! [A-Z][^.!?]+[.!?])',
        r'(\? [A-Z][^.!?]+[.!?])'
    ]
    
    # Start with the greeting-adjusted content
    formatted_content = content
    
    # Now identify potential paragraph breaks and insert them
    for pattern in paragraph_splits:
        # Find all potential paragraph breaks
        matches = re.finditer(pattern, formatted_content)
        # Track position adjustments as we modify the string
        position_adjustment = 0
        
        for match in matches:
            # Only add paragraph breaks after complete sentences
            sentence = match.group(1)
            # Get the position accounting for previous adjustments
            position = match.start(1) + position_adjustment
            
            # Replace the period and space with period, newline, newline
            if formatted_content[position] in '.!?':
                # Insert a paragraph break after this sentence
                formatted_content = (
                    formatted_content[:position+1] + 
                    "\n\n" + 
                    formatted_content[position+2:]
                )
                # Update position adjustment
                position_adjustment += 1
    
    # Clean up any excessive newlines
    formatted_content = re.sub(r'\n{3,}', '\n\n', formatted_content)
    
    return formatted_content

def create_mime_message(to_field, cc_field, subject, body_text):
    """
    Create a properly formatted MIME message that renders well on mobile.
    """
    # Format the body text for mobile readability
    formatted_body = format_email_for_mobile(body_text)
    
    # Create message with proper MIME settings for email clients
    message = MIMEMultipart('alternative')
    message['To'] = to_field
    message['Subject'] = subject
    if cc_field:
        message['Cc'] = cc_field
    
    # Create both plain text and HTML versions
    # Plain text version with explicit line breaks
    text_part = MIMEText(formatted_body, 'plain')
    
    # HTML version with paragraph tags for better rendering
    html_body = ''
    for paragraph in formatted_body.split('\n\n'):
        if paragraph.strip():
            # Special handling for greeting and signature
            if paragraph.startswith('Dear') or paragraph.startswith('Hello') or paragraph.startswith('Hi'):
                html_body += f"<p>{paragraph}</p>"
            elif 'regards' in paragraph.lower() or 'sincerely' in paragraph.lower() or 'best,' in paragraph.lower():
                closing_parts = paragraph.split('\n')
                if len(closing_parts) > 1:
                    html_body += f"<p>{closing_parts[0]}<br>{closing_parts[1]}</p>"
                else:
                    html_body += f"<p>{paragraph}</p>"
            else:
                html_body += f"<p>{paragraph}</p>"
    
    html_part = MIMEText(f"""
    <html>
      <head></head>
      <body>
        {html_body}
      </body>
    </html>
    """, 'html')
    
    # Attach both parts - email clients will use the best one they support
    message.attach(text_part)
    message.attach(html_part)
    
    return message

def format_email_content(content):
    """
    Format email content to ensure natural paragraph breaks and smooth text flow.
    Prevents artificial paragraph breaks that split sentences unnaturally.
    """
    # First, identify the real paragraph structure
    # Genuine paragraphs typically end with complete sentences (period, question mark, etc.)
    # followed by a line break
    
    # Split the email by lines first to analyze structure
    lines = content.splitlines()
    
    # Initialize variables
    paragraphs = []
    current_paragraph = ""
    
    # Try to intelligently identify real paragraph breaks vs artificial line breaks
    for i, line in enumerate(lines):
        cleaned_line = line.strip()
        
        # Skip empty lines
        if not cleaned_line:
            continue
            
        # Check if this is a greeting (should be its own paragraph)
        if cleaned_line.startswith("Dear ") and "," in cleaned_line:
            if current_paragraph:
                paragraphs.append(current_paragraph.strip())
                current_paragraph = ""
            paragraphs.append(cleaned_line)
            continue
            
        # Check if this is a signature (should be its own paragraph)
        if (cleaned_line.startswith("Best") or 
            cleaned_line.startswith("Regards") or 
            cleaned_line.startswith("Sincerely") or
            "regards" in cleaned_line.lower()):
            if current_paragraph:
                paragraphs.append(current_paragraph.strip())
                current_paragraph = ""
            paragraphs.append(cleaned_line)
            continue
            
        # Check if this line completes a paragraph
        # A paragraph typically ends with a complete sentence
        if current_paragraph and (
            current_paragraph.rstrip().endswith(".") or
            current_paragraph.rstrip().endswith("!") or
            current_paragraph.rstrip().endswith("?") or
            current_paragraph.rstrip().endswith(":") or
            # Check if next line starts a new paragraph (capital letter)
            (i < len(lines) - 1 and 
             lines[i+1].strip() and 
             lines[i+1].strip()[0].isupper())):
            current_paragraph += " " + cleaned_line
            paragraphs.append(current_paragraph.strip())
            current_paragraph = ""
        else:
            # Otherwise, this is a continuation of the current paragraph
            if current_paragraph:
                current_paragraph += " " + cleaned_line
            else:
                current_paragraph = cleaned_line
    
    # Add the last paragraph if it's not empty
    if current_paragraph:
        paragraphs.append(current_paragraph.strip())
    
    # Clean up each paragraph - remove double spaces, excessive whitespace
    clean_paragraphs = []
    for p in paragraphs:
        # Replace multiple spaces with a single space
        clean_p = re.sub(r' +', ' ', p)
        # Remove spaces before punctuation
        clean_p = re.sub(r' ([.,;:!?])', r'\1', clean_p)
        clean_paragraphs.append(clean_p)
    
    # Join paragraphs with double newlines for proper spacing
    return "\n\n".join(clean_paragraphs)

def create_reply_message(service, user_id, original_msg_id, reply_text, to_override=None, cc_override=None):
    """
    Create a MIME message for replying to an email that works well on mobile devices.
    """
    # Get full message details
    original_msg = service.users().messages().get(userId=user_id, id=original_msg_id, format='full').execute()
    thread_id = original_msg['threadId']
    headers = original_msg.get('payload', {}).get('headers', [])
    subject = next((h['value'] for h in headers if h['name'].lower() == 'subject'), "No Subject")
    original_from = next((h['value'] for h in headers if h['name'].lower() == 'from'), "")
    message_id = next((h['value'] for h in headers if h['name'].lower() == 'message-id'), "")
    
    # Ensure subject has Re: prefix
    if not subject.lower().startswith('re:'):
        subject = f"Re: {subject}"
    
    # Use overrides if provided; otherwise default to original sender
    to_field = to_override if to_override is not None else original_from
    
    # Create a MIME message with both text and HTML parts
    reply_message = create_mime_message(to_field, cc_override, subject, reply_text)
    
    # Add headers for proper threading
    if message_id:
        reply_message['In-Reply-To'] = message_id
        reply_message['References'] = message_id
    
    # Convert to Gmail API format
    raw_message = base64.urlsafe_b64encode(reply_message.as_bytes()).decode('utf-8')
    
    return {
        'raw': raw_message,
        'threadId': thread_id
    }

def extract_sender_info(service, email_id, user_id="me"):
    """
    Extract sender name and other details from an email to personalize replies.
    """
    try:
        message = service.users().messages().get(userId=user_id, id=email_id, format='full').execute()
        headers = message.get('payload', {}).get('headers', [])
        
        from_header = next((h['value'] for h in headers if h['name'].lower() == 'from'), "")
        
        # Try to extract name from From header
        if '<' in from_header:
            header_name = from_header.split('<')[0].strip()
            if header_name.startswith('"') and header_name.endswith('"'):
                header_name = header_name[1:-1]
        else:
            header_name = from_header.split('@')[0].capitalize()
        
        return {
            "name": header_name or "there",
            "email": from_header,
            "found_method": "header"
        }
            
    except Exception as e:
        print(f"Error extracting sender info: {e}")
        return {"name": "there", "email": from_header, "found_method": "default"}

def generate_reply(service, email_detail, gemini_context, user_context, user_name):
    """
    Generate a reply suggestion for a given email using the Gemini generative AI model.
    """
    try:
        print("Starting generate_reply function...")
        print(f"Email detail keys: {email_detail.keys()}")
        
        # Get sender information
        print("Extracting sender information...")
        sender_info = extract_sender_info(service, email_detail['id'])
        print(f"Sender info: {sender_info}")
        
        # Create appropriate greeting
        greeting = f"Dear {sender_info['name']},"
        print(f"Created greeting: {greeting}")
        
        # Get email body from the email_detail
        body_text = email_detail.get('body', email_detail.get('snippet', ''))
        print(f"Email body length: {len(body_text)}")
        
        print("Creating prompt for Gemini...")
        prompt = f"{gemini_context}\n\n"
        prompt += f"Email received from: {sender_info['name']}\n"
        prompt += f"Subject: {email_detail['subject']}\n\n"
        prompt += f"Full email content:\n{body_text}\n\n"
        
        if user_context.strip():
            prompt += f"Additional instructions: {user_context}\n\n"
        
        prompt += f"""
IMPORTANT FORMATTING AND CONTENT INSTRUCTIONS:
1. Begin with: "{greeting}"
2. Write a substantive and professional email that addresses all points from the original message.
3. Use clear, specific language and avoid vague placeholders or instructions.
4. DO NOT include bracketed text like [briefly mention illness] or [suggest timeframe] in your response.
5. Write naturally as if you're a real person composing an email. Be specific and direct.
6. If mentioning an illness, use a specific but generic description like "a severe flu" or "a medical issue".
7. When suggesting timeframes, use concrete examples like "48 hours" or "by the end of the week".
8. End with: "Best regards,\\n{user_name}"
9. Make sure all paragraphs are fully developed with complete information.
10. REMOVE ANY AND ALL PLACEHOLDER TEXT in the final response.

YOUR RESPONSE MUST FOLLOW THIS STRUCTURE:
{greeting}

[First paragraph: Acknowledge the original email and apologize if needed]

[Second paragraph: Provide specific explanation (not placeholders or instructions)]

[Additional paragraphs as needed with REAL content, not placeholders]

[Final paragraph: Next steps or appreciation]

Best regards,
{user_name}
"""
        
        print("Generating content with Gemini...")
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        
        if not response or not response.text:
            print("Error: Empty response from Gemini")
            return "Error: Unable to generate a reply. Please try again."
            
        generated_text = response.text.strip()
        print(f"Generated text length: {len(generated_text)}")
        
        # Post-processing to remove any remaining placeholders
        print("Post-processing generated text...")
        placeholder_patterns = [
            r'\[.*?\]',                  # Anything in square brackets
            r'\(e\.g\.,.*?\)',          # Anything with e.g.
            r'\[suggest .*?\]',         # Instructions to suggest something
            r'\[briefly .*?\]',         # Instructions to briefly mention something
        ]
        
        for pattern in placeholder_patterns:
            generated_text = re.sub(pattern, '', generated_text)
        
        # Clean up any double spaces created by removing placeholders
        generated_text = re.sub(r' +', ' ', generated_text)
        print("Post-processing complete")
        
        return generated_text
    except Exception as e:
        print(f"Error in generate_reply: {str(e)}")
        print(f"Error type: {type(e)}")
        print(f"Error traceback: {traceback.format_exc()}")
        return f"Error generating reply: {str(e)}"

def simplified_edit_suggestion(reply_text):
    """
    Simplified version of edit_suggestion that doesn't require user interaction.
    Just processes the generated email and returns it.
    """
    # Clean up any remaining placeholders
    clean_reply = process_generated_email(reply_text)
    return clean_reply

def edit_suggestion(reply_text, service=None, email_detail=None, gemini_context=None, user_name=None):
    """
    Allow the user to iteratively edit the suggested reply until they're satisfied.
    Can regenerate responses using Gemini if needed.
    """
    # First, clean up any remaining placeholders
    current_reply = process_generated_email(reply_text)
    
    while True:
        print("\nHere's the current reply text:")
        print("-" * 50)
        print(current_reply)
        print("-" * 50)
        
        satisfaction = input("\nAre you happy with this reply? (yes/no): ").strip().lower()
        
        if satisfaction == 'yes':
            return current_reply
        
        print("\nHow would you like to improve it?")
        print("1. Edit the text myself")
        print("2. Regenerate with new instructions")
        print("3. Keep as is and proceed anyway")
        
        choice = input("Enter your choice (1, 2, or 3): ").strip()
        
        if choice == '1':
            # Manual editing
            print("\nYou can edit the reply below. Press Enter twice when you're done.")
            print("(If you're using a terminal that doesn't support multi-line input, type '/done' on a new line to finish editing)")
            
            lines = []
            line = input()
            
            # Handle different input methods (multi-line or /done marker)
            if line == "/done":
                continue  # Skip this iteration, keeping the current reply
                
            while True:
                if line == "/done":
                    break
                    
                lines.append(line)
                line = input()
                
                # Check for double Enter press (empty line twice)
                if not line and lines and not lines[-1]:
                    lines.pop()  # Remove the last empty line
                    break
            
            # If user provided any content, use it; otherwise keep original
            if lines:
                current_reply = '\n'.join(lines)
                # Do one more cleanup pass to ensure no placeholders
                current_reply = process_generated_email(current_reply)
            else:
                print("No changes made, keeping original suggestion.")
                
        elif choice == '2':
            # Regenerate with new instructions
            if service and email_detail and gemini_context and user_name:
                new_instructions = input("\nWhat specific improvements would you like to see in the regenerated email? ").strip()
                print("Regenerating suggestion...")
                
                try:
                    # Make direct modification for recipient name change requests
                    if "dear" in new_instructions.lower() and "not" in new_instructions.lower():
                        current_name = None
                        new_name = None
                        
                        # Try to extract the current and new names from the instructions
                        name_parts = new_instructions.lower().split("dear ")
                        if len(name_parts) > 1:
                            current_part = name_parts[1].split(",")[0].strip()
                            current_name = current_part
                            
                            # Look for replacement instructions like "use X instead" or "change to Y"
                            change_indicators = ["not", "instead", "change to", "replace with", "use"]
                            for indicator in change_indicators:
                                if indicator in new_instructions.lower():
                                    parts = new_instructions.lower().split(indicator)
                                    if len(parts) > 1:
                                        potential_name = parts[1].strip()
                                        if potential_name and potential_name != current_name:
                                            # Extract the name, handling potential punctuation
                                            for punct in [',', '.', ':', ';']:
                                                if punct in potential_name:
                                                    potential_name = potential_name.split(punct)[0].strip()
                                            new_name = potential_name
                        
                        # If we found both names, do a direct replacement
                        if current_name and new_name:
                            # Do case-insensitive replacement of "Dear [old name]" with "Dear [new name]"
                            pattern = re.compile(re.escape(f"Dear {current_name}"), re.IGNORECASE)
                            current_reply = pattern.sub(f"Dear {new_name}", current_reply)
                            print(f"Changed recipient from '{current_name}' to '{new_name}'")
                            continue
                    
                    # If the direct name change didn't work, regenerate the full email
                    new_reply = generate_reply(
                        service, 
                        email_detail, 
                        gemini_context, 
                        new_instructions, 
                        user_name
                    )
                    current_reply = process_generated_email(new_reply)
                except Exception as e:
                    print(f"Error regenerating suggestion: {e}")
                    print("Keeping the current version.")
            else:
                print("Sorry, regeneration is not available in this context. Please edit manually.")
                
        elif choice == '3':
            # Keep as is
            print("Keeping the current suggestion as is.")
            return current_reply
            
        else:
            print("Invalid choice. Please select 1, 2, or 3.")

def api_setup_authentication():
    """
    Modified setup_authentication function for API context.
    Checks for token in a specific location and handles authentication more gracefully.
    """
    creds = None
    token_path = os.path.join(os.path.dirname(__file__), "token.json")
    credentials_path = os.path.join(os.path.dirname(__file__), "credentials.json")
    
    # Check if token exists
    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)
    
    # If there are no (valid) credentials available, raise an exception
    # This is different from the CLI version which would prompt for login
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
            except Exception as e:
                raise Exception(f"Failed to refresh credentials: {e}")
        else:
            raise Exception("No valid credentials found. Please authenticate using the CLI tool first.")
        
        # Save the refreshed credentials
        with open(token_path, "w") as token:
            token.write(creds.to_json())
    
    return creds

def send_reply(service, user_id, original_msg_id, reply_text, email_detail=None, gemini_context=None, user_name=None):
    """
    Ask the user about reply recipients and send the reply using the Gmail API.
    Ensures the email is properly formatted.
    """
    try:
        # First, let the user iteratively edit the reply until satisfied
        final_reply = edit_suggestion(
            reply_text, 
            service=service, 
            email_detail=email_detail, 
            gemini_context=gemini_context, 
            user_name=user_name
        )
        
        # Apply formatting fixes to ensure proper paragraph structure
        formatted_reply = format_email_content(final_reply)
        
        # Preview the formatted email
        print("\nHere's how your formatted email will look:")
        print("-" * 50)
        print(formatted_reply)
        print("-" * 50)
        
        confirm = input("Does this formatting look correct? (yes/no): ").strip().lower()
        if confirm != "yes":
            print("Let's fix the formatting manually.")
            formatted_reply = manual_format_fix(formatted_reply)
        
        # Retrieve the original email headers to decide recipients
        original_msg = service.users().messages().get(userId=user_id, id=original_msg_id, format='metadata').execute()
        headers = original_msg.get('payload', {}).get('headers', [])
        to_field, cc_field = select_reply_recipients(headers)
        
        # Create and send the reply message with the chosen recipients
        message_body = create_reply_message(service, user_id, original_msg_id, formatted_reply, to_override=to_field, cc_override=cc_field)
        
        # Send as a proper reply within the thread
        sent_message = service.users().messages().send(
            userId=user_id, 
            body=message_body
        ).execute()
        
        print(f"\nSent reply for message ID: {original_msg_id} (sent message ID: {sent_message['id']})")
        return True
    except HttpError as error:
        print(f"An error occurred sending the reply: {error}")
        return False

def manual_format_fix(email_text):
    """
    Allows manual fixing of email formatting when automatic detection fails.
    """
    print("\nLet's manually fix the formatting of this email.")
    print("Please edit the text below, using blank lines to separate paragraphs.")
    print("When you're done, press Enter twice.")
    
    lines = []
    line = input()
    
    while True:
        if not line and lines and not lines[-1]:
            # Double blank line - we're done
            break
            
        lines.append(line)
        line = input()
    
    # Remove trailing empty line if present
    if lines and not lines[-1]:
        lines.pop()
        
    return "\n".join(lines)

def edit_reply(reply_text, service=None, email_detail=None, gemini_context=None, user_name=None):
    """
    Allow the user to edit the generated reply before sending.
    Returns the edited reply text.
    """
    print("\nGenerated reply:")
    print("-" * 50)
    print(reply_text)
    print("-" * 50)
    
    while True:
        print("\nOptions:")
        print("1. Edit the reply")
        print("2. Use as is")
        print("3. Generate a new reply")
        choice = input("Enter your choice (1-3): ").strip()
        
        if choice == "1":
            # Open the default editor with the current reply
            import tempfile
            import subprocess
            
            with tempfile.NamedTemporaryFile(mode='w+', suffix='.txt', delete=False) as temp_file:
                temp_file.write(reply_text)
                temp_file.flush()
                
                # Try to open the default editor
                editor = os.environ.get('EDITOR', 'notepad' if os.name == 'nt' else 'nano')
                subprocess.call([editor, temp_file.name])
                
                # Read the edited content
                with open(temp_file.name, 'r') as f:
                    edited_reply = f.read().strip()
                
                # Clean up the temporary file
                os.unlink(temp_file.name)
                
                return edited_reply
                
        elif choice == "2":
            return reply_text
            
        elif choice == "3":
            if service and email_detail and gemini_context and user_name:
                new_reply = generate_reply(service, email_detail, gemini_context, "", user_name)
                return edit_reply(new_reply, service, email_detail, gemini_context, user_name)
            else:
                print("Cannot generate new reply: Missing required parameters")
                continue
                
        else:
            print("Invalid choice. Please try again.")

def send_email(service, user_id, to, subject, body, cc=None):
    """
    Send an email using the Gmail API.
    Returns True if successful, False otherwise.
    """
    try:
        # Create message
        message = MIMEMultipart()
        message['to'] = to
        if cc:
            message['cc'] = cc
        message['subject'] = subject
        
        # Add body
        msg = MIMEText(body)
        message.attach(msg)
        
        # Encode message
        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
        
        # Send message
        sent_message = service.users().messages().send(
            userId=user_id,
            body={'raw': raw_message}
        ).execute()
        
        print(f"Message sent successfully! Message ID: {sent_message['id']}")
        return True
        
    except HttpError as error:
        print(f"An error occurred while sending the email: {error}")
        return False
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return False

@email_bp.route("/generate", methods=["POST"])
def generate():
    try:
        data = request.get_json()
        message_id = data.get("message_id")
        user_name = data.get("user_name", "User")
        user_context = data.get("user_context", "")

        if not message_id:
            return jsonify({"error": "message_id is required"}), 400

        creds = setup_authentication()
        service = build("gmail", "v1", credentials=creds)
        
        reply_text = generate_reply(message_id, {"name": user_name, "profession": user_context})
        return jsonify({"reply": reply_text})

    except Exception as e:
        print(f"Error in generate endpoint: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@email_bp.route("/edit", methods=["POST"])
def edit():
    try:
        data = request.get_json()
        message_id = data.get("message_id")
        user_name = data.get("user_name", "User")
        user_context = data.get("user_context", "")
        edit_instructions = data.get("edit_instructions", "")

        if not message_id or not edit_instructions:
            return jsonify({"error": "message_id and edit_instructions are required"}), 400

        creds = setup_authentication()
        service = build("gmail", "v1", credentials=creds)
        
        edited_reply = edit_reply(service, message_id, user_name, user_context, edit_instructions)
        return jsonify({"reply": edited_reply})

    except Exception as e:
        print(f"Error in edit endpoint: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@email_bp.route("/send", methods=["POST"])
def send():
    try:
        data = request.get_json()
        to = data.get("to")
        subject = data.get("subject")
        body_text = data.get("body_text")
        cc = data.get("cc")

        if not all([to, subject, body_text]):
            return jsonify({"error": "to, subject, and body_text are required"}), 400

        creds = setup_authentication()
        service = build("gmail", "v1", credentials=creds)
        
        message_id = send_email(service, to, subject, body_text, cc)
        return jsonify({"message_id": message_id})

    except Exception as e:
        print(f"Error in send endpoint: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

def main():
    # Gather user details for context
    print("Welcome to Email Assistant powered by Gemini AI!")
    print("Please enter some information about yourself to personalize email replies:")
    name = input("Enter your name: ").strip()
    salutation = input("Enter your salutation (e.g., Mr., Ms., Dr., etc.): ").strip()
    ending = input("Enter your ending (e.g., Regards, Best, etc.): ").strip()
    profession = input("Enter your profession: ").strip()
    about = input("Briefly describe your role or what you are currently working on: ").strip()

    # Define the context for generating reply suggestions
    gemini_context = f"""
    You are helping {salutation} {name}, a {profession}.
    Background: {about}
    
    You should write detailed, thoughtful replies that thoroughly address all points in the original email.
    Always include {ending}\n{name}
    at the end of your responses.
    """

    # Get Gmail API service
    try:
        creds = setup_authentication()
        service = build("gmail", "v1", credentials=creds)
        
        # Get the user's email address
        profile = service.users().getProfile(userId='me').execute()
        user_id = profile.get('emailAddress', 'me')
        print(f"Authenticated as: {user_id}")
        
        # 1. Retrieve recent unread emails
        print("\nRetrieving unread emails...")
        unread_emails = get_recent_unread_messages(service, user_id)
        if not unread_emails:
            print("No unread emails found.")
            return

        # 2. List the unread emails with indices
        print("\nUnread Emails:")
        for idx, email in enumerate(unread_emails):
            print(f"[{idx}] Subject: {email['subject']}")
            print(f"     Snippet: {email['snippet']}\n")

        # 3. Ask user which emails they want reply suggestions for
        selected_indices_input = input("Enter the indices of the emails you want suggestions for (comma-separated): ").strip()
        if not selected_indices_input:
            print("No emails selected. Exiting.")
            return

        try:
            selected_indices = [int(x.strip()) for x in selected_indices_input.split(",")]
        except ValueError:
            print("Invalid input. Please enter numeric indices separated by commas.")
            return

        suggestions = {}
        for idx in selected_indices:
            if 0 <= idx < len(unread_emails):
                email_detail = unread_emails[idx]
                print(f"\nFor email [{idx}] with subject: {email_detail['subject']}")
                user_context = input("Do you have any specific request or additional context for replying to this email? If not, press Enter: ").strip()
                print("Generating suggestion...")
                suggestion = generate_reply(service, email_detail, gemini_context, user_context, name)
                print(f"\nSuggestion for email [{idx}]:\n{suggestion}\n")
                
                # Give opportunity to edit before adding to suggestions
                improved_suggestion = edit_suggestion(
                    suggestion,
                    service=service,
                    email_detail=email_detail,
                    gemini_context=gemini_context,
                    user_name=name
                )
                
                suggestions[idx] = {
                    'email_id': email_detail['id'],
                    'suggestion': improved_suggestion,
                    'subject': email_detail['subject']
                }
            else:
                print(f"Index {idx} is out of range.")

        # 4. Ask if the user wants to send any of the suggested replies
        if suggestions:
            send_confirmation = input("Do you want to send any of these suggestions as replies? (yes/no): ").strip().lower()
            if send_confirmation != "yes":
                print("No emails will be sent. Exiting.")
                return

            send_indices_input = input("Enter the indices of the suggestions you want to send (comma-separated): ").strip()
            if not send_indices_input:
                print("No suggestions selected for sending. Exiting.")
                return

            try:
                send_indices = [int(x.strip()) for x in send_indices_input.split(",")]
            except ValueError:
                print("Invalid input for sending indices.")
                return

            for idx in send_indices:
                if idx in suggestions:
                    email_id = suggestions[idx]['email_id']
                    reply_text = suggestions[idx]['suggestion']
                    print(f"\nPreparing to send reply for email with subject: {suggestions[idx]['subject']}")
                    send_reply(
                        service, 
                        user_id, 
                        email_id, 
                        reply_text,
                        email_detail=email_detail,
                        gemini_context=gemini_context,
                        user_name=name
                    )
                else:
                    print(f"No suggestion found for index {idx}.")
        else:
            print("No suggestions were generated. Exiting.")
            
    except HttpError as error:
        print(f"An error occurred with the Gmail API: {error}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    main()