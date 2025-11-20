"""
Claude API Service - Handles communication with Anthropic's Claude API

⚠️  SECURITY NOTE:
API keys should NOT be stored in source code in production environments.
For cloud deployments, move API_KEY to environment variables or a secrets manager.
See: https://docs.anthropic.com/en/api/getting-started

Current approach (local development only):
- API key stored in environment variables or .env file
- Never commit .env to version control
"""

import os
from anthropic import Anthropic

class ClaudeService:
    def __init__(self):
        """Initialize Claude API client with API key from environment"""
        self.api_key = os.getenv('ANTHROPIC_API_KEY')
        if not self.api_key:
            raise ValueError(
                "ANTHROPIC_API_KEY not found in environment variables. "
                "Please set it before running the application. "
                "For local development, add it to your .env file."
            )
        self.client = Anthropic(api_key=self.api_key)
        self.conversation_history = []
    
    def simple_message(self, prompt: str) -> str:
        """
        Send a simple message to Claude and get a response.
        
        Args:
            prompt: The user's message/prompt
            
        Returns:
            Claude's response text
        """
        try:
            message = self.client.messages.create(
                model="claude-opus-4-1",
                max_tokens=1024,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            return message.content[0].text
        except Exception as e:
            raise Exception(f"Claude API error: {str(e)}")
    
    def chat_message(self, prompt: str) -> str:
        """
        Send a message in a conversation with Claude.
        Maintains conversation history for context.
        
        Args:
            prompt: The user's message/prompt
            
        Returns:
            Claude's response text
        """
        try:
            # Add user message to history
            self.conversation_history.append({
                "role": "user",
                "content": prompt
            })
            
            # Send message with full conversation history
            message = self.client.messages.create(
                model="claude-opus-4-1",
                max_tokens=2048,
                messages=self.conversation_history
            )
            
            response_text = message.content[0].text
            
            # Add assistant response to history
            self.conversation_history.append({
                "role": "assistant",
                "content": response_text
            })
            
            return response_text
        except Exception as e:
            raise Exception(f"Claude API error: {str(e)}")
    
    def reset_conversation(self):
        """Clear conversation history"""
        self.conversation_history = []
    
    def get_conversation_history(self):
        """Return current conversation history"""
        return self.conversation_history