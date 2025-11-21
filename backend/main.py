"""
FastAPI Backend for Document Processing with Claude API Integration
"""
import os
from dotenv import load_dotenv
load_dotenv()

import json
import shutil
from pathlib import Path
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from services.docling_service import DoclingService
from services.claude_service import ClaudeService

# Initialize FastAPI
app = FastAPI(
    title="Document Processing API",
    description="Backend for extracting and processing documents with Docling and Claude AI",
    version="1.0.0"
)

# Configure CORS - Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
docling_service = DoclingService()
try:
    claude_service = ClaudeService()
except ValueError as e:
    print(f"Warning: Claude API service failed to initialize: {e}")
    claude_service = None

# Configure paths
BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
OUTPUT_DIR = BASE_DIR / "outputs"

# Ensure directories exist
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.doc'}


def is_allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "message": "Document Processing API is running",
        "version": "1.0.0",
        "claude_available": claude_service is not None
    }


@app.post("/api/claude/test")
async def test_claude():
    """
    Simple test endpoint to verify Claude API integration.
    Sends a test prompt and returns response to confirm connectivity.
    
    Returns:
        Test response from Claude API
    """
    if not claude_service:
        raise HTTPException(
            status_code=503,
            detail="Claude API service is not available. Check ANTHROPIC_API_KEY environment variable."
        )
    
    try:
        response = claude_service.simple_message("Reply with just 'ack' to confirm you received this message.")
        
        return JSONResponse({
            "success": True,
            "message": "Claude API test successful",
            "response": response
        })
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Claude API test failed: {str(e)}"
        )


@app.post("/api/claude/message")
async def send_message(user_message: dict):
    """
    Send a message to Claude and get a response.
    
    Request body:
        {
            "message": "Your message here",
            "use_conversation": false  # Set to true for multi-turn conversation
        }
    
    Returns:
        Claude's response
    """
    if not claude_service:
        raise HTTPException(
            status_code=503,
            detail="Claude API service is not available. Check ANTHROPIC_API_KEY environment variable."
        )
    
    try:
        message = user_message.get("message", "").strip()
        use_conversation = user_message.get("use_conversation", False)
        
        if not message:
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        if use_conversation:
            response = claude_service.chat_message(message)
        else:
            response = claude_service.simple_message(message)
        
        return JSONResponse({
            "success": True,
            "response": response,
            "conversation_mode": use_conversation
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@app.post("/api/claude/reset")
async def reset_conversation():
    """Reset conversation history"""
    if not claude_service:
        raise HTTPException(status_code=503, detail="Claude API service is not available")
    
    try:
        claude_service.reset_conversation()
        return JSONResponse({
            "success": True,
            "message": "Conversation history cleared"
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/api/extract-questions")
async def extract_questions(request_data: dict):
    """
    Extract questions and precursor content from document using Claude.
    
    Request body:
        {
            "document_content": "The full extracted document text from Docling"
        }
    
    Returns:
        List of questions with their precursor content
    """
    if not claude_service:
        raise HTTPException(
            status_code=503,
            detail="Claude API service is not available. Check ANTHROPIC_API_KEY environment variable."
        )
    
    try:
        document_content = request_data.get("document_content", "").strip()
        
        if not document_content:
            raise HTTPException(status_code=400, detail="Document content cannot be empty")
        
        questions = claude_service.extract_questions(document_content)
        
        return JSONResponse({
            "success": True,
            "questions": questions
        })
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse Claude response: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# Original document extraction endpoints remain below
@app.post("/extract")
async def extract_document(
    file: UploadFile = File(...),
    output_format: str = "markdown"
):
    """
    Extract content from uploaded document
    
    Args:
        file: Uploaded document file
        output_format: Output format (markdown, text, or json)
        
    Returns:
        Extracted content and metadata
    """
    
    # Validate file
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Generate unique filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_extension = Path(file.filename).suffix
    unique_filename = f"{timestamp}_{file.filename}"
    file_path = UPLOAD_DIR / unique_filename
    
    try:
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Extract content
        result = docling_service.extract_content(
            str(file_path),
            output_format=output_format
        )
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result.get("error", "Extraction failed"))
        
        # Save extracted content to file
        output_extension = "md" if output_format == "markdown" else "txt" if output_format == "text" else "json"
        output_filename = f"{timestamp}_{Path(file.filename).stem}_extracted.{output_extension}"
        output_path = OUTPUT_DIR / output_filename
        
        docling_service.save_to_file(
            result["content"],
            str(output_path),
            format=output_extension
        )
        
        # Return result with download link
        return JSONResponse({
            "success": True,
            "message": "Document processed successfully",
            "data": {
                "original_filename": file.filename,
                "output_filename": output_filename,
                "content": result["content"],
                "metadata": result["metadata"],
                "download_url": f"/download/{output_filename}"
            }
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")
    
    finally:
        # Cleanup: Remove uploaded file
        if file_path.exists():
            file_path.unlink()


@app.get("/download/{filename}")
async def download_file(filename: str):
    """
    Download processed file
    
    Args:
        filename: Name of the file to download
        
    Returns:
        File download response
    """
    file_path = OUTPUT_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type='application/octet-stream'
    )


@app.get("/files")
async def list_output_files():
    """
    List all processed files in output directory
    
    Returns:
        List of available files with metadata
    """
    files = []
    for file_path in OUTPUT_DIR.glob("*"):
        if file_path.is_file():
            stat = file_path.stat()
            files.append({
                "filename": file_path.name,
                "size": stat.st_size,
                "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                "download_url": f"/download/{file_path.name}"
            })
    
    return {
        "success": True,
        "count": len(files),
        "files": files
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True  # Auto-reload on code changes
    )