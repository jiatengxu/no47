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
    onFileUpload(file);

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
          content: e.target.result.substring(0, 500),
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
    <div className="upload-container">
      <div 
        className={`upload-area ${isDragging ? 'dragging' : ''} ${filePreview ? 'has-file' : ''}`}
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
          style={{ display: 'none' }}
          accept=".pdf,.doc,.docx,.odt,.rtf"
        />
        
        {!filePreview ? (
          <div className="upload-prompt">
            <svg 
              className="upload-icon"
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
            <h3 className="upload-title">Drop your file here</h3>
            <p className="upload-subtitle">or click to browse</p>
            <span className="upload-hint">Supports PDF and Document files (.pdf, .doc, .docx)</span>
          </div>
        ) : (
          <div className="file-preview">
            {filePreview.type === 'image' && (
              <div className="image-preview">
                <img src={filePreview.url} alt={filePreview.name} className="preview-image" />
              </div>
            )}
            
            {filePreview.type === 'pdf' && (
              <div className="pdf-preview">
                <svg className="preview-icon preview-icon-pdf" width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                <span className="file-badge file-badge-pdf">PDF Document</span>
              </div>
            )}
            
            {filePreview.type === 'text' && (
              <div className="text-preview">
                <pre className="text-preview-content">{filePreview.content}</pre>
                {filePreview.content.length >= 500 && (
                  <p className="text-preview-truncated">Preview truncated...</p>
                )}
              </div>
            )}
            
            {filePreview.type === 'other' && (
              <div className="other-preview">
                <svg className="preview-icon preview-icon-file" width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z" />
                </svg>
                <span className="file-badge file-badge-other">{filePreview.fileType}</span>
              </div>
            )}
            
            <div className="file-info">
              <p className="file-name">{filePreview.name}</p>
              <p className="file-size">{filePreview.size}</p>
              <button onClick={removeFile} className="remove-button">
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