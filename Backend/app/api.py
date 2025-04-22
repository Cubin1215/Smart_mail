from flask import Blueprint, request, jsonify
from .email_assistant import (
    api_setup_authentication,
    get_recent_unread_messages,
    generate_suggestion_for_email,
    send_reply,
    extract_sender_info
)

api = Blueprint('api', __name__)

@api.route('/email/unread', methods=['GET'])
def get_unread_emails():
    try:
        service = api_setup_authentication()
        if not service:
            return jsonify({'error': 'Authentication failed'}), 401
        
        emails = get_recent_unread_messages(service)
        return jsonify({'success': True, 'emails': emails})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/email/generate', methods=['POST'])
def generate_email():
    try:
        data = request.json
        email_id = data.get('email_id')
        user_name = data.get('user_name')
        profession = data.get('profession')
        signature = data.get('signature')

        if not all([email_id, user_name]):
            return jsonify({'error': 'Missing required fields'}), 400

        service = api_setup_authentication()
        if not service:
            return jsonify({'error': 'Authentication failed'}), 401

        # Get email details and sender info
        sender_info = extract_sender_info(service, email_id)
        
        # Create context for AI
        user_context = {
            'name': user_name,
            'profession': profession or '',
            'signature': signature or ''
        }

        # Generate reply suggestion
        suggestion = generate_suggestion_for_email(
            service,
            email_id,
            None,  # gemini_context not needed for now
            user_context,
            user_name
        )

        return jsonify({
            'success': True,
            'to': sender_info['email'],
            'subject': f"Re: {sender_info['subject']}",
            'content': suggestion
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/email/send', methods=['POST'])
def send_email():
    try:
        data = request.json
        email_id = data.get('email_id')
        reply_text = data.get('reply_text')
        
        if not all([email_id, reply_text]):
            return jsonify({'error': 'Missing required fields'}), 400

        service = api_setup_authentication()
        if not service:
            return jsonify({'error': 'Authentication failed'}), 401

        # Send the reply
        result = send_reply(
            service,
            'me',
            email_id,
            reply_text
        )
        print(result)

        if result.get('error'):
            return jsonify({'error': result['error']}), 500

        return jsonify({'success': True, 'message': 'Reply sent successfully'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500 