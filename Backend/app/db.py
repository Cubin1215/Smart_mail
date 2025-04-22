from typing import List, Optional
from datetime import datetime
from .config import supabase, TABLES
from .models import User, EmailTemplate, EmailHistory, UserSettings

class DatabaseService:
    @staticmethod
    async def create_user(email: str, name: str) -> User:
        data = {
            'email': email,
            'name': name,
            'created_at': datetime.utcnow().isoformat()
        }
        result = supabase.table(TABLES['users']).insert(data).execute()
        return User.from_dict(result.data[0])

    @staticmethod
    async def get_user(user_id: str) -> Optional[User]:
        result = supabase.table(TABLES['users']).select('*').eq('id', user_id).execute()
        if result.data:
            return User.from_dict(result.data[0])
        return None

    @staticmethod
    async def create_email_template(user_id: str, name: str, content: str) -> EmailTemplate:
        data = {
            'user_id': user_id,
            'name': name,
            'content': content,
            'created_at': datetime.utcnow().isoformat()
        }
        result = supabase.table(TABLES['email_templates']).insert(data).execute()
        return EmailTemplate.from_dict(result.data[0])

    @staticmethod
    async def get_user_templates(user_id: str) -> List[EmailTemplate]:
        result = supabase.table(TABLES['email_templates']).select('*').eq('user_id', user_id).execute()
        return [EmailTemplate.from_dict(template) for template in result.data]

    @staticmethod
    async def create_email_history(user_id: str, message_id: str, subject: str, 
                                 content: str, recipient: str) -> EmailHistory:
        data = {
            'user_id': user_id,
            'message_id': message_id,
            'subject': subject,
            'content': content,
            'recipient': recipient,
            'sent_at': datetime.utcnow().isoformat()
        }
        result = supabase.table(TABLES['email_history']).insert(data).execute()
        return EmailHistory.from_dict(result.data[0])

    @staticmethod
    async def get_user_email_history(user_id: str) -> List[EmailHistory]:
        result = supabase.table(TABLES['email_history']).select('*').eq('user_id', user_id).execute()
        return [EmailHistory.from_dict(history) for history in result.data]

    @staticmethod
    async def get_user_settings(user_id: str) -> Optional[UserSettings]:
        result = supabase.table(TABLES['user_settings']).select('*').eq('user_id', user_id).execute()
        if result.data:
            return UserSettings.from_dict(result.data[0])
        return None

    @staticmethod
    async def update_user_settings(user_id: str, settings: dict) -> UserSettings:
        data = {
            'user_id': user_id,
            **settings
        }
        result = supabase.table(TABLES['user_settings']).upsert(data).execute()
        return UserSettings.from_dict(result.data[0])

    @staticmethod
    async def update_gmail_token(user_id: str, token: str) -> None:
        await DatabaseService.update_user_settings(user_id, {'gmail_token': token})

    @staticmethod
    async def update_gemini_api_key(user_id: str, api_key: str) -> None:
        await DatabaseService.update_user_settings(user_id, {'gemini_api_key': api_key}) 