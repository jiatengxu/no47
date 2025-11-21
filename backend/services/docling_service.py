"""
Docling Service - Handles document extraction
"""
import os
from pathlib import Path
from docling.document_converter import DocumentConverter

class DoclingService:
    def __init__(self):
        """Initialize Docling with default settings"""
        # Use default converter - works with latest Docling version
        self.converter = DocumentConverter()
    
    def extract_content(self, file_path: str, output_format: str = "markdown") -> dict:
        """
        Extract content from document
        
        Args:
            file_path: Path to the input file
            output_format: Output format (markdown, text, or json)
            
        Returns:
            Dictionary with extracted content and metadata
        """
        try:
            print(f"Starting extraction for: {file_path}")
            
            # Convert document with default settings
            result = self.converter.convert(file_path)
            
            print(f"Conversion complete, exporting to {output_format}...")
            
            # Get the converted document
            doc = result.document
            
            # Get content in requested format
            if output_format == "markdown":
                content = doc.export_to_markdown()
            elif output_format == "text":
                content = doc.export_to_text()
            elif output_format == "json":
                content = doc.export_to_dict()
            else:
                content = doc.export_to_markdown()
            
            print(f"Export successful!")
            
            # Extract basic metadata
            metadata = {
                "num_pages": len(doc.pages) if hasattr(doc, 'pages') else 0,
                "format": output_format
            }
            
            return {
                "success": True,
                "content": content,
                "metadata": metadata
            }
            
        except Exception as e:
            print(f"Extraction error: {str(e)}")
            import traceback
            traceback.print_exc()
            return {
                "success": False,
                "error": str(e)
            }
    
    def save_to_file(self, content: str, output_path: str, format: str = "txt") -> bool:
        """
        Save extracted content to file
        
        Args:
            content: Extracted content
            output_path: Where to save the file
            format: File format (txt, md, json)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                if isinstance(content, dict):
                    import json
                    json.dump(content, f, indent=2, ensure_ascii=False)
                else:
                    f.write(str(content))
            
            print(f"File saved successfully to: {output_path}")
            return True
        except Exception as e:
            print(f"Error saving file: {e}")
            return False