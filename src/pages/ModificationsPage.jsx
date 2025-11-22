import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import modificationTags from '../data/modificationTags.json';
import QuestionModifier from '../components/QuestionModifier';
import './ModificationsPage.css';

const ModificationsPage = ({ uploadedFile, questions, setProcessedFile }) => {
  const navigate = useNavigate();
  const [modifications, setModifications] = useState({});

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
      // Initialize precursor if it exists
      if (group.precursor && group.precursor !== null) {
        const precursorId = `precursor-${groupIdx}`;
        initialModifications[precursorId] = {
          selectedTags: [],
          isLocked: false,
          preview: null,
        };
      }

      // Initialize questions
      group.questions?.forEach((_, qIdx) => {
        const questionId = `question-${groupIdx}-${qIdx}`;
        initialModifications[questionId] = {
          selectedTags: [],
          isLocked: false,
          preview: null,
        };
      });
    });
    setModifications(initialModifications);
  }, [questions]);

  const handleTagSelect = (itemId, tagId, isSelected) => {
    setModifications((prev) => {
      const current = prev[itemId];
      const newTags = isSelected
        ? [...current.selectedTags, tagId]
        : current.selectedTags.filter((t) => t !== tagId);

      return {
        ...prev,
        [itemId]: {
          ...current,
          selectedTags: newTags,
          preview: null,
        },
      };
    });
  };

  const handleApplyTags = async (itemId, itemText, itemType) => {
    const { selectedTags } = modifications[itemId];

    if (selectedTags.length === 0) {
      setModifications((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          preview: itemText,
        },
      }));
      return;
    }

    // Build tag instructions with full context
    const tagInstructions = selectedTags
      .map((tagId) => {
        const tag = modificationTags.tags[tagId];
        return `- ${tag.name}: ${tag.description}\n  Purpose: ${tag.purpose}`;
      })
      .join('\n');

    const contentType = itemType === 'precursor' ? 'precursor' : 'question';
    const preserveNote = itemType === 'precursor' 
      ? 'Keep all critical information intact. Preserve the core meaning and context.'
      : 'Preserve the core meaning and educational value.';

    const prompt = `Modify the following ${contentType} according to these tags:

${tagInstructions}

Original ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}:
${itemText}

Important: ${preserveNote}
Return ONLY the modified text, nothing else.`;

    try {
      const response = await fetch('http://localhost:8000/api/claude/modify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          original_text: itemText,
          selected_tags: selectedTags,
          is_precursor: itemType === 'precursor',
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const result = await response.json();
      const modifiedText = result.response;

      setModifications((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          preview: modifiedText,
        },
      }));
    } catch (error) {
      console.error('Error calling Claude:', error);
      alert('Error generating preview. Please try again.');
    }
  };

  const handleLock = (itemId) => {
    setModifications((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        isLocked: !prev[itemId].isLocked,
      },
    }));
  };

  const handleContinueToResult = () => {
    const lockedModifications = Object.entries(modifications).reduce(
      (acc, [itemId, mod]) => {
        if (mod.isLocked && mod.preview) {
          acc[itemId] = mod.preview;
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
              Select tags to customize questions and context for your students
            </p>
          </div>

          <div className="modifications-card-body">
            {questions &&
              questions.map((group, groupIdx) => (
                <div key={groupIdx} className="question-group">
                  {group.precursor && group.precursor !== null && (
                    <QuestionModifier
                      questionId={`precursor-${groupIdx}`}
                      itemNumber={groupIdx + 1}
                      originalText={group.precursor}
                      selectedTags={modifications[`precursor-${groupIdx}`]?.selectedTags || []}
                      isLocked={modifications[`precursor-${groupIdx}`]?.isLocked || false}
                      preview={modifications[`precursor-${groupIdx}`]?.preview || null}
                      onTagSelect={handleTagSelect}
                      onApplyTags={handleApplyTags}
                      onLock={handleLock}
                      itemType="precursor"
                    />
                  )}

                  <div className="questions-list">
                    {group.questions?.map((question, qIdx) => {
                      const questionId = `question-${groupIdx}-${qIdx}`;
                      const mod = modifications[questionId];
                      const questionNumber = qIdx + 1;

                      return (
                        <QuestionModifier
                          key={questionId}
                          questionId={questionId}
                          itemNumber={questionNumber}
                          originalText={question}
                          selectedTags={mod?.selectedTags || []}
                          isLocked={mod?.isLocked || false}
                          preview={mod?.preview || null}
                          onTagSelect={handleTagSelect}
                          onApplyTags={handleApplyTags}
                          onLock={handleLock}
                          itemType="question"
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
    </div>
  );
};

export default ModificationsPage;