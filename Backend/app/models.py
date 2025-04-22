from datetime import datetime
from typing import Optional, Dict, Any

class User:
    def __init__(self, id: str, email: str, name: str, created_at: datetime):
        self.id = id
        self.email = email
        self.name = name
        self.created_at = created_at

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'User':
        return cls(
            id=data['id'],
            email=data['email'],
            name=data['name'],
            created_at=datetime.fromisoformat(data['created_at'])
        )

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'created_at': self.created_at.isoformat()
        }

class EmailTemplate:
    def __init__(self, id: str, user_id: str, name: str, content: str, created_at: datetime):
        self.id = id
        self.user_id = user_id
        self.name = name
        self.content = content
        self.created_at = created_at

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'EmailTemplate':
        return cls(
            id=data['id'],
            user_id=data['user_id'],
            name=data['name'],
            content=data['content'],
            created_at=datetime.fromisoformat(data['created_at'])
        )

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'content': self.content,
            'created_at': self.created_at.isoformat()
        }

class EmailHistory:
    def __init__(self, id: str, user_id: str, message_id: str, subject: str, 
                 content: str, recipient: str, sent_at: datetime):
        self.id = id
        self.user_id = user_id
        self.message_id = message_id
        self.subject = subject
        self.content = content
        self.recipient = recipient
        self.sent_at = sent_at

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'EmailHistory':
        return cls(
            id=data['id'],
            user_id=data['user_id'],
            message_id=data['message_id'],
            subject=data['subject'],
            content=data['content'],
            recipient=data['recipient'],
            sent_at=datetime.fromisoformat(data['sent_at'])
        )

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'user_id': self.user_id,
            'message_id': self.message_id,
            'subject': self.subject,
            'content': self.content,
            'recipient': self.recipient,
            'sent_at': self.sent_at.isoformat()
        }

class UserSettings:
    def __init__(self, user_id: str, gmail_token: Optional[str] = None, 
                 gemini_api_key: Optional[str] = None, default_template: Optional[str] = None):
        self.user_id = user_id
        self.gmail_token = gmail_token
        self.gemini_api_key = gemini_api_key
        self.default_template = default_template

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'UserSettings':
        return cls(
            user_id=data['user_id'],
            gmail_token=data.get('gmail_token'),
            gemini_api_key=data.get('gemini_api_key'),
            default_template=data.get('default_template')
        )

    def to_dict(self) -> Dict[str, Any]:
        return {
            'user_id': self.user_id,
            'gmail_token': self.gmail_token,
            'gemini_api_key': self.gemini_api_key,
            'default_template': self.default_template
        } 