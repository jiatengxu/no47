import React from 'react';
import './ResultPage.css';

const ResultPage = ({ processedFile }) => {
  return (
    <div className="result-page">
      <div className="result-page-container">
        <div className="result-card">
          <div className="result-card-header">
            <h1 className="result-card-title">Result</h1>
            <p className="result-card-subtitle">Page 3 - To be implemented</p>
          </div>
          
          <div className="result-card-body">
            {/* This page will return the processed file */}
            {/* Implementation will be added later */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;