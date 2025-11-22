import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResultPage.css';

const ResultPage = ({ processedFile }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!processedFile) {
      navigate('/');
      return;
    }

    // Auto-trigger download
    handleDownload();
  }, [processedFile, navigate]);

  const handleDownload = async () => {
    if (!processedFile) return;

    try {
      // For now, we'll create a simple text file with modifications
      // Later, you can expand this to create a proper document file

      const content = generateModifiedDocument();
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'modified-questions.txt';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error generating download. Please try again.');
    }
  };

  const generateModifiedDocument = () => {
    const { originalQuestions, modifications } = processedFile;
    let content = 'MODIFIED QUESTIONS\n';
    content += '==================\n\n';

    originalQuestions?.forEach((group, groupIdx) => {
      if (group.precursor) {
        content += `CONTEXT:\n${group.precursor}\n\n`;
      }

      group.questions?.forEach((question, qIdx) => {
        const questionId = `${groupIdx}-${qIdx}`;
        const modifiedQuestion = modifications[questionId] || question;

        content += `Q: ${modifiedQuestion}\n\n`;
      });

      content += '---\n\n';
    });

    return content;
  };

  return (
    <div className="result-page">
      <div className="result-page-container">
        <div className="result-card">
          <div className="result-card-header">
            <h1 className="result-card-title">Download Ready</h1>
            <p className="result-card-subtitle">Your modified document is downloading</p>
          </div>

          <div className="result-card-body">
            <div className="success-message">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <h2>Success!</h2>
              <p>Your modified questions have been prepared and should download automatically.</p>
              <p className="small-text">
                If the download doesn't start, you can try again with the button below.
              </p>

              <button className="download-button" onClick={handleDownload}>
                ↓ Download Again
              </button>

              <button className="back-button" onClick={() => navigate('/')}>
                ← Start Over
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;