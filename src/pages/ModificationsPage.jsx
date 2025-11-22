import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import modificationTags from '../data/modificationTags.json';
import TagChip from '../components/TagChip';
import QuestionModifier from '../components/QuestionModifier';
import './ModificationsPage.css';

const ModificationsPage = ({ uploadedFile, questions, setProcessedFile }) => {
  const navigate = useNavigate();
  const [modifications, setModifications] = useState({});
  const [showWarning, setShowWarning] = useState(false);

  // Redirect if no questions
  useEffect(() => {
    if (!questions || questions.length === 0) {
      navigate('/');
    }
  }, [questions, navigate]);

  // Initialize modifications state
  useEffect(() => {
    const initialModifications = {};
    questions?.forEach((group, groupIdx) => {
      group.questions?.forEach((_, qIdx) => {
        initialModifications[`${groupIdx}-${qIdx}`] = {
          selectedTags: [],
          isLocked: false,
          preview: null,
        };
      });
    });
    setModifications(initialModifications);
  }, [questions]);

  const handleTagSelect = (questionId, tagId, isSelected) => {
    setModifications((prev) => {
      const current = prev[questionId];
      const newTags = isSelected
        ? [...current.selectedTags, tagId]
        : current.selectedTags.filter((t) => t !== tagId);

      return {
        ...prev,
        [questionId]: {
          ...current,
          selectedTags: newTags,
          preview: null, // Clear preview when tags change
        },
      };
    });
  };

  const handleApplyTags = async (questionId, questionText) => {
    const { selectedTags } = modifications[questionId];

    // If no tags selected, don't call Claude
    if (selectedTags.length === 0) {
      setModifications((prev) => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          preview: questionText, // Use original text
        },
      }));
      return;
    }

    // Build prompt with tag instructions
    const tagInstructions = selectedTags
      .map((tagId) => {
        const tag = modificationTags.tags[tagId];
        return `- ${tag.name}: ${tag.description}`;
      })
      .join('\n');

    const prompt = `Modify the following question according to these tags:
${tagInstructions}

Original Question:
${questionText}

Return ONLY the modified question text, nothing else.`;

    try {
      const response = await fetch('http://localhost:8000/api/claude/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          use_conversation: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const result = await response.json();
      const modifiedText = result.response;

      setModifications((prev) => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          preview: modifiedText,
        },
      }));
    } catch (error) {
      console.error('Error calling Claude:', error);
      alert('Error generating preview. Please try again.');
    }
  };

  const handleLock = (questionId) => {
    setModifications((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        isLocked: !prev[questionId].isLocked,
      },
    }));
  };

  const handleContinueToResult = () => {
    // Prepare final modifications
    const lockedModifications = Object.entries(modifications).reduce(
      (acc, [questionId, mod]) => {
        if (mod.isLocked && mod.preview) {
          acc[questionId] = mod.preview;
        }
        return acc;
      },
      {}
    );

    setProcessedFile({
      originalQuestions: questions,
      modifications: lockedModifications,
    });

    navigate('/result');
  };

  return (
    <div className="modifications-page">
      <div className="modifications-page-container">
        <div className="modifications-card">
          <div className="modifications-card-header">
            <h1 className="modifications-card-title">Modify Questions</h1>
            <p className="modifications-card-subtitle">
              Select tags to customize questions for your students
            </p>
          </div>

          <div className="modifications-card-body">
            {questions &&
              questions.map((group, groupIdx) => (
                <div key={groupIdx} className="question-group">
                  {group.precursor && group.precursor !== null && (
                    <div className="precursor-section">
                      <p className="precursor-label">Context/Precursor:</p>
                      <p className="precursor-text">{group.precursor}</p>
                    </div>
                  )}

                  <div className="questions-list">
                    {group.questions?.map((question, qIdx) => {
                      const questionId = `${groupIdx}-${qIdx}`;
                      const mod = modifications[questionId];

                      return (
                        <QuestionModifier
                          key={questionId}
                          questionId={questionId}
                          questionNumber={
                            Object.keys(modifications)
                              .slice(0, Object.keys(modifications).indexOf(questionId))
                              .filter(
                                (id) => modifications[id]
                              ).length + 1
                          }
                          originalQuestion={question}
                          selectedTags={mod?.selectedTags || []}
                          isLocked={mod?.isLocked || false}
                          preview={mod?.preview || null}
                          onTagSelect={handleTagSelect}
                          onApplyTags={handleApplyTags}
                          onLock={handleLock}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>

          <div className="modifications-card-footer">
            <button
              className="continue-button"
              onClick={handleContinueToResult}
            >
              Continue to Download →
            </button>
          </div>
        </div>
      </div>

      {showWarning && (
        <div className="warning-modal">
          <div className="warning-content">
            <h3>⚠️ Warning</h3>
            <p>
              If you navigate away or refresh this page, all your modifications
              will be lost. Make sure you've locked in all your changes before
              proceeding.
            </p>
            <div className="warning-actions">
              <button onClick={() => setShowWarning(false)}>Got it</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModificationsPage;