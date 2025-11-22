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
import json
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

    def extract_questions(self, document_content: str) -> list:
        """
        Extract questions and their related precursor content from document.
        Groups questions that share the same precursor.
        
        Args:
            document_content: The full document text extracted by Docling
            
        Returns:
            List of dicts with 'precursor' and 'questions' (array) keys
        """
        try:
            prompt = f"""Extract all questions and their directly related precursor content from this document.

Group questions that share the same precursor content together.

For each group:
1. Include any story, context, passage, or content the questions directly refer to as 'precursor'
2. Include all related questions as an array in 'questions'
3. Only include items you identify as questions worth modifying for educational purposes
4. Skip standalone instructions, page numbers, or generic headers
5. If a question has no related precursor content, set precursor to null

Return ONLY a JSON array with this structure:
[{{"precursor": "context/story text", "questions": ["question 1", "question 2"]}}, {{"precursor": null, "questions": ["standalone question"]}}]

Document:
{document_content}"""
            
            message = self.client.messages.create(
                model="claude-opus-4-1",
                max_tokens=4096,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            response_text = message.content[0].text
            
            # Handle potential markdown code blocks
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            questions_data = json.loads(response_text)
            
            # Post-process: Convert empty precursors to null and group by precursor
            processed_data = []
            precursor_map = {}
            
            for item in questions_data:
                # Convert empty string precursor to null
                precursor = item.get('precursor')
                if precursor == "" or precursor is None:
                    precursor = None
                
                precursor_key = precursor if precursor else "__NO_PRECURSOR__"
                
                if precursor_key not in precursor_map:
                    precursor_map[precursor_key] = {
                        "precursor": precursor,
                        "questions": []
                    }
                
                # Add questions to the group
                if isinstance(item.get('questions'), list):
                    precursor_map[precursor_key]["questions"].extend(item.get('questions', []))
            
            # Convert map back to list, maintaining order
            processed_data = list(precursor_map.values())
            
            return processed_data
            
        except Exception as e:
            raise Exception(f"Question extraction error: {str(e)}")

    def modify_content(self, original_text: str, selected_tags: list, tag_metadata: dict, is_precursor: bool = False) -> str:
        """
        Modify a question or precursor text according to selected tags.
        
        Args:
            original_text: The original question or precursor text
            selected_tags: List of tag IDs to apply
            tag_metadata: Dictionary containing tag information
            is_precursor: Whether this is a precursor (True) or question (False)
            
        Returns:
            Modified text
        """
        if not selected_tags:
            return original_text
        
        try:
            # Build tag instructions with full context
            tag_instructions = []
            for tag_id in selected_tags:
                if tag_id in tag_metadata:
                    tag = tag_metadata[tag_id]
                    tag_instructions.append(
                        f"- {tag['name']}: {tag['description']}\n"
                        f"  Purpose: {tag['purpose']}"
                    )
            
            content_type = "precursor" if is_precursor else "question"
            
            prompt = f"""Modify the following {content_type} according to these tags:

{chr(10).join(tag_instructions)}

Original {content_type.capitalize()}:
{original_text}

Important: Keep all critical information intact. Preserve the core meaning and educational value.
Return ONLY the modified text, nothing else."""

            message = self.client.messages.create(
                model="claude-opus-4-1",
                max_tokens=2048,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            return message.content[0].text
            
        except Exception as e:
            raise Exception(f"Content modification error: {str(e)}")