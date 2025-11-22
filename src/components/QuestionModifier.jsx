import React, { useState } from 'react';
import modificationTags from '../data/modificationTags.json';
import TagChip from './TagChip';
import './QuestionModifier.css';

const QuestionModifier = ({
  questionId,
  questionNumber,
  originalQuestion,
  selectedTags,
  isLocked,
  preview,
  onTagSelect,
  onApplyTags,
  onLock,
}) => {
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyClick = async () => {
    setIsApplying(true);
    await onApplyTags(questionId, originalQuestion);
    setIsApplying(false);
  };

  const getConflictingTags = (tagId) => {
    const tag = modificationTags.tags[tagId];
    return tag?.conflicts || [];
  };

  const isTagDisabled = (tagId) => {
    const conflicts = getConflictingTags(tagId);
    return selectedTags.some((selectedId) =>
      conflicts.includes(selectedId)
    );
  };

  const allTags = Object.values(modificationTags.tags);

  return (
    <div className={`question-modifier ${isLocked ? 'locked' : ''}`}>
      <div className="question-header">
        <h4 className="question-number">Question {questionNumber}</h4>
        <button
          className={`lock-button ${isLocked ? 'locked' : ''}`}
          onClick={() => onLock(questionId)}
          title={isLocked ? 'Unlock to make changes' : 'Lock in changes'}
        >
          {isLocked ? '🔒' : '🔓'}
        </button>
      </div>

      <div className="original-question">
        <p className="label">Original Question:</p>
        <p className="text">{originalQuestion}</p>
      </div>

      {!isLocked && (
        <>
          <div className="tags-section">
            <p className="tags-label">Select Tags:</p>
            <div className="tags-grid">
              {allTags.map((tag) => (
                <TagChip
                  key={tag.id}
                  tag={tag}
                  isSelected={selectedTags.includes(tag.id)}
                  isDisabled={isTagDisabled(tag.id)}
                  onSelect={(isSelected) =>
                    onTagSelect(questionId, tag.id, isSelected)
                  }
                />
              ))}
            </div>
          </div>

          <div className="apply-section">
            <button
              className="apply-button"
              onClick={handleApplyClick}
              disabled={isApplying || selectedTags.length === 0}
            >
              {isApplying ? 'Generating preview...' : 'Preview Modifications'}
            </button>
          </div>
        </>
      )}

      {preview !== null && (
        <div className="preview-section">
          <p className="label">Modified Question:</p>
          <p className="text modified">{preview}</p>

          {!isLocked && (
            <button
              className="lock-in-button"
              onClick={() => onLock(questionId)}
            >
              ✓ Lock in Changes
            </button>
          )}
        </div>
      )}

      {isLocked && preview !== null && (
        <div className="preview-section locked-preview">
          <p className="label">✓ Locked Modification:</p>
          <p className="text modified">{preview}</p>
        </div>
      )}

      {isLocked && !preview && (
        <div className="no-modification">
          <p className="label">✓ Using Original (No Modifications)</p>
        </div>
      )}
    </div>
  );
};

export default QuestionModifier;