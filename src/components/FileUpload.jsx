import React, { useState, useRef } from 'react';
import './FileUpload.css';

const FileUpload = ({ onFileUpload, currentFile }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file) => {
    // Store the file
    onFileUpload(file);

    // Create preview based on file type
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview({
          type: 'image',
          url: e.target.result,
          name: file.name,
          size: formatFileSize(file.size)
        });
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      setFilePreview({
        type: 'pdf',
        name: file.name,
        size: formatFileSize(file.size)
      });
    } else if (file.type.includes('text') || file.type.includes('json') || file.type.includes('xml')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview({
          type: 'text',
          content: e.target.result.substring(0, 500), // First 500 characters
          name: file.name,
          size: formatFileSize(file.size)
        });
      };
      reader.readAsText(file);
    } else {
      setFilePreview({
        type: 'other',
        name: file.name,
        size: formatFileSize(file.size),
        fileType: file.type || 'Unknown'
      });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const removeFile = () => {
    onFileUpload(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-100">
      <div 
        className={`upload-area border border-2 border-secondary-subtle rounded-3 p-5 text-center bg-light ${isDragging ? 'dragging' : ''} ${filePreview ? 'has-file p-3' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!filePreview ? triggerFileInput : undefined}
        role="button"
        tabIndex={0}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="d-none"
          accept=".pdf,.doc,.docx,.odt,.rtf"
        />
        
        {!filePreview ? (
          <div className="upload-prompt">
            <svg 
              className="upload-icon text-secondary mb-3" 
              width="64"
              height="64"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
            <h3 className="h4 text-dark mb-2">Drop your file here</h3>
            <p className="text-secondary mb-3">or click to browse</p>
            <span className="text-muted small">Supports PDF and Document files (.pdf, .doc, .docx)</span>
          </div>
        ) : (
          <div className="file-preview">
            {filePreview.type === 'image' && (
              <div className="image-preview mb-3">
                <img src={filePreview.url} alt={filePreview.name} className="img-fluid rounded" style={{maxHeight: '300px'}} />
              </div>
            )}
            
            {filePreview.type === 'pdf' && (
              <div className="pdf-preview d-flex flex-column align-items-center mb-3">
                <svg className="text-danger mb-2" width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                <span className="badge bg-danger">PDF Document</span>
              </div>
            )}
            
            {filePreview.type === 'text' && (
              <div className="text-preview bg-dark text-light p-3 rounded mb-3 text-start" style={{maxHeight: '200px', overflowY: 'auto'}}>
                <pre className="mb-0 text-light" style={{fontSize: '0.875rem'}}>{filePreview.content}</pre>
                {filePreview.content.length >= 500 && (
                  <p className="text-warning text-center mt-2 mb-0 fst-italic">Preview truncated...</p>
                )}
              </div>
            )}
            
            {filePreview.type === 'other' && (
              <div className="other-preview d-flex flex-column align-items-center mb-3">
                <svg className="text-secondary mb-2" width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z" />
                </svg>
                <span className="badge bg-secondary">{filePreview.fileType}</span>
              </div>
            )}
            
            <div className="file-info">
              <p className="fw-semibold text-dark mb-1 text-break">{filePreview.name}</p>
              <p className="text-muted small mb-3">{filePreview.size}</p>
              <button onClick={removeFile} className="btn btn-danger btn-sm">
                Remove File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;