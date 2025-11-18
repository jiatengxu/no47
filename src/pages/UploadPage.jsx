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
    <div className="gradient-bg p-3">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8">
            <div className="card custom-shadow border-0 overflow-hidden">
              <div className="card-header gradient-header text-white text-center py-5">
                <h1 className="display-5 fw-bold mb-3">File Upload</h1>
                <p className="lead mb-0">Upload a document to get started with the modification process</p>
              </div>

              <div className="card-body p-4 p-md-5">
                <FileUpload 
                  onFileUpload={handleFileUpload}
                  currentFile={uploadedFile}
                />
              </div>

              {uploadedFile && (
                <div className="px-4 px-md-5 pb-4 text-center">
                  <button 
                    className="btn btn-primary btn-lg px-5 gradient-button"
                    onClick={handleContinue}
                  >
                    Continue to Variables →
                  </button>
                </div>
              )}

              <div className="card-footer bg-light border-0 p-4 p-md-5">
                <h3 className="h5 text-dark fw-semibold mb-3">Supported Document Types</h3>
                <p className="text-muted mb-3">You can upload the following document formats:</p>
                <div className="row g-2">
                  <div className="col-sm-6">
                    <div className="d-flex align-items-start">
                      <span className="text-success me-2">✓</span>
                      <span className="text-muted">PDF Documents (.pdf)</span>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="d-flex align-items-start">
                      <span className="text-success me-2">✓</span>
                      <span className="text-muted">Microsoft Word (.doc, .docx)</span>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="d-flex align-items-start">
                      <span className="text-success me-2">✓</span>
                      <span className="text-muted">OpenDocument Text (.odt)</span>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="d-flex align-items-start">
                      <span className="text-success me-2">✓</span>
                      <span className="text-muted">Rich Text Format (.rtf)</span>
                    </div>
                  </div>
                </div>
                <div className="alert alert-info mt-3 mb-0">
                  <small><strong>Note:</strong> Google Docs should be exported as .docx or .pdf before uploading.</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;