import React from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import './UploadPage.css';

const UploadPage = ({ uploadedFile, setUploadedFile }) => {
  const navigate = useNavigate();

  const handleFileUpload = (file) => {
    setUploadedFile(file);
  };

  const handleContinue = () => {
    if (uploadedFile) {
      navigate('/variables');
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-page-container">
        <div className="upload-card">
          <div className="upload-card-header">
            <h1 className="upload-card-title">File Upload</h1>
            <p className="upload-card-subtitle">Upload a document to get started with the modification process</p>
          </div>

          <div className="upload-card-body">
            <FileUpload 
              onFileUpload={handleFileUpload}
              currentFile={uploadedFile}
            />
          </div>

          {uploadedFile && (
            <div className="upload-actions">
              <button 
                className="continue-button"
                onClick={handleContinue}
              >
                Continue to Variables →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;