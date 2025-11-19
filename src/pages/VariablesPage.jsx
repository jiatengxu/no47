import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './VariablesPage.css';

const VariablesPage = ({ uploadedFile, setProcessedFile }) => {
  const navigate = useNavigate();
  const [extracting, setExtracting] = useState(false);
  const [extractedContent, setExtractedContent] = useState(null);
  const [error, setError] = useState(null);
  const [outputFormat, setOutputFormat] = useState('markdown');

  // Redirect if no file uploaded
  useEffect(() => {
    if (!uploadedFile) {
      navigate('/');
    }
  }, [uploadedFile, navigate]);

  const handleExtract = async () => {
    if (!uploadedFile) return;

    setExtracting(true);
    setError(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', uploadedFile);

      // Send to backend
      const response = await fetch(`http://localhost:8000/extract?output_format=${outputFormat}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setExtractedContent(result.data);
      } else {
        throw new Error(result.message || 'Extraction failed');
      }
    } catch (err) {
      setError(err.message);
      console.error('Extraction error:', err);
    } finally {
      setExtracting(false);
    }
  };

  const handleDownload = () => {
    if (extractedContent && extractedContent.download_url) {
      window.open(`http://localhost:8000${extractedContent.download_url}`, '_blank');
    }
  };

  return (
    <div className="variables-page">
      <div className="variables-page-container">
        <div className="variables-card">
          <div className="variables-card-header">
            <h1 className="variables-card-title">Document Extraction</h1>
            <p className="variables-card-subtitle">
              Extract content from your uploaded document
            </p>
          </div>

          <div className="variables-card-body">
            {uploadedFile && (
              <div className="file-info-section">
                <h3>Uploaded File</h3>
                <p><strong>Name:</strong> {uploadedFile.name}</p>
                <p><strong>Size:</strong> {(uploadedFile.size / 1024).toFixed(2)} KB</p>
                <p><strong>Type:</strong> {uploadedFile.type}</p>
              </div>
            )}

            {!extractedContent && (
              <div className="extraction-controls">
                <div className="format-selector">
                  <label htmlFor="format">Output Format:</label>
                  <select
                    id="format"
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    disabled={extracting}
                  >
                    <option value="markdown">Markdown (.md)</option>
                    <option value="text">Plain Text (.txt)</option>
                    <option value="json">JSON (.json)</option>
                  </select>
                </div>

                <button
                  onClick={handleExtract}
                  disabled={extracting || !uploadedFile}
                  className="extract-button"
                >
                  {extracting ? 'Extracting...' : 'Extract Content'}
                </button>
              </div>
            )}

            {extracting && (
              <div className="loading-section">
                <div className="spinner"></div>
                <p>Processing document with Docling...</p>
              </div>
            )}

            {error && (
              <div className="error-section">
                <h3>Error</h3>
                <p>{error}</p>
                <button onClick={() => setError(null)}>Try Again</button>
              </div>
            )}

            {extractedContent && (
              <div className="success-section">
                <h3>Extraction Complete!</h3>
                
                <div className="metadata">
                  <p><strong>Pages:</strong> {extractedContent.metadata.num_pages}</p>
                  <p><strong>Format:</strong> {extractedContent.metadata.format}</p>
                  <p><strong>Output File:</strong> {extractedContent.output_filename}</p>
                </div>

                <div className="content-preview">
                  <h4>Content Preview:</h4>
                  <pre>{typeof extractedContent.content === 'string' 
                    ? extractedContent.content.substring(0, 500) + '...'
                    : JSON.stringify(extractedContent.content, null, 2).substring(0, 500) + '...'
                  }</pre>
                </div>

                <div className="action-buttons">
                  <button onClick={handleDownload} className="download-button">
                    Download Extracted File
                  </button>
                  <button onClick={() => setExtractedContent(null)} className="reset-button">
                    Extract Another Document
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariablesPage;