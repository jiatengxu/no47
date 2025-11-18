import React from 'react';

const ResultPage = ({ processedFile }) => {
  return (
    <div className="gradient-bg p-3">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8">
            <div className="card custom-shadow border-0 overflow-hidden">
              <div className="card-header gradient-header text-white text-center py-5">
                <h1 className="display-5 fw-bold mb-3">Result</h1>
                <p className="lead mb-0">Page 3 - To be implemented</p>
              </div>
              
              <div className="card-body p-4 p-md-5" style={{minHeight: '200px'}}>
                {/* This page will return the processed file */}
                {/* Implementation will be added later */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;