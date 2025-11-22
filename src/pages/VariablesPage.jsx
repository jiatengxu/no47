import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './VariablesPage.css';

const VariablesPage = ({ uploadedFile, setExtractedQuestions }) => {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState(null);

  // Redirect if no file uploaded
  useEffect(() => {
    if (!uploadedFile) {
      navigate('/');
    }
  }, [uploadedFile, navigate]);

  // Auto-extract on component mount
  useEffect(() => {
    if (uploadedFile && !questions && !error && !processing) {
      extractQuestionsFromDocument();
    }
  }, [uploadedFile, questions, error, processing]);

  const extractQuestionsFromDocument = async () => {
    setProcessing(true);
    setError(null);

    try {
      // Step 1: Extract content with Docling
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const extractResponse = await fetch(
        'http://localhost:8000/extract?output_format=text',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!extractResponse.ok) {
        throw new Error(`Docling extraction failed with status: ${extractResponse.status}`);
      }

      const extractResult = await extractResponse.json();

      if (!extractResult.success) {
        throw new Error(extractResult.message || 'Document extraction failed');
      }

      // Step 2: Pass extracted content to Claude for question extraction
      const documentContent = extractResult.data.content;

      const claudeResponse = await fetch('http://localhost:8000/api/extract-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_content: documentContent,
        }),
      });

      if (!claudeResponse.ok) {
        throw new Error(`Claude extraction failed with status: ${claudeResponse.status}`);
      }

      const claudeResult = await claudeResponse.json();

      if (!claudeResult.success) {
        throw new Error(claudeResult.message || 'Question extraction failed');
      }

      setQuestions(claudeResult.questions);
      setExtractedQuestions(claudeResult.questions);
    } catch (err) {
      setError(err.message);
      console.error('Processing error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const getTotalQuestionCount = () => {
    if (!questions || !Array.isArray(questions)) return 0;
    return questions.reduce((total, group) => {
      if (group && Array.isArray(group.questions)) {
        return total + group.questions.length;
      }
      return total;
    }, 0);
  };

  const getQuestionNumber = (groupIndex, questionIndex) => {
    if (!questions || !Array.isArray(questions)) return questionIndex + 1;
    let count = 0;
    for (let i = 0; i < groupIndex; i++) {
      if (questions[i] && Array.isArray(questions[i].questions)) {
        count += questions[i].questions.length;
      }
    }
    return count + questionIndex + 1;
  };

  const handleContinue = () => {
    if (questions && questions.length > 0) {
      navigate('/modifications');
    }
  };

  return (
    <div className="variables-page">
      <div className="variables-page-container">
        <div className="variables-card">
          <div className="variables-card-header">
            <h1 className="variables-card-title">Extracted Questions</h1>
            <p className="variables-card-subtitle">
              Questions identified from your document
            </p>
          </div>

          <div className="variables-card-body">
            {uploadedFile && (
              <div className="file-info-section">
                <h3>Uploaded File</h3>
                <p><strong>Name:</strong> {uploadedFile.name}</p>
                <p><strong>Size:</strong> {(uploadedFile.size / 1024).toFixed(2)} KB</p>
              </div>
            )}

            {processing && (
              <div className="loading-section">
                <div className="spinner"></div>
                <p>Extracting document and identifying questions...</p>
              </div>
            )}

            {error && (
              <div className="error-section">
                <h3>Error</h3>
                <p>{error}</p>
                <button onClick={() => navigate('/')}>Go Back and Try Another File</button>
              </div>
            )}

            {!processing && !error && questions && questions.length > 0 && (
              <div className="questions-section">
                <h3>Questions ({getTotalQuestionCount()} found)</h3>
                
                {questions.map((group, groupIndex) => (
                  <div key={groupIndex} className="question-group">
                    {group.precursor && group.precursor !== null && (
                      <div className="precursor-content">
                        <div className="precursor-header">
                          <span className="precursor-badge">CONTEXT</span>
                        </div>
                        <p className="precursor-text">{group.precursor}</p>
                      </div>
                    )}
                    
                    <div className="questions-in-group">
                      {group.questions && Array.isArray(group.questions) && group.questions.map((question, questionIndex) => (
                        <div key={`${groupIndex}-${questionIndex}`} className="question-item">
                          <div className="question-number">
                            Q{getQuestionNumber(groupIndex, questionIndex)}
                          </div>
                          <div className="question-content">
                            <p className="question-text">{question}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="action-buttons">
                  <button
                    className="continue-button"
                    onClick={handleContinue}
                  >
                    Continue to Modifications →
                  </button>
                </div>
              </div>
            )}

            {!processing && !error && questions && questions.length === 0 && (
              <div className="no-questions-section">
                <p>No questions were identified in this document.</p>
                <button onClick={() => navigate('/')}>Upload Another File</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariablesPage;