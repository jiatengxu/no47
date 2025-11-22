import React, { useState } from 'react';
import modificationTags from '../data/modificationTags.json';
import TagChip from './TagChip';
import './QuestionModifier.css';

const QuestionModifier = ({
  questionId,
  itemNumber,
  originalText,
  selectedTags,
  isLocked,
  preview,
  onTagSelect,
  onApplyTags,
  onLock,
  itemType = 'question',
}) => {
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyClick = async () => {
    setIsApplying(true);
    await onApplyTags(questionId, originalText, itemType);
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

  const itemLabel = itemType === 'precursor' ? 'Context/Precursor' : 'Question';
  const lockButtonTitle = isLocked ? 'Unlock to make changes' : 'Lock in changes';

  return (
    <div className={`question-modifier ${isLocked ? 'locked' : ''}`}>
      <div className="question-header">
        <h4 className="question-number">{itemLabel} {itemNumber}</h4>
        <button
          className={`lock-button ${isLocked ? 'locked' : ''}`}
          onClick={() => onLock(questionId)}
          title={lockButtonTitle}
        >
          {isLocked ? '🔒' : '🔓'}
        </button>
      </div>

      <div className="original-question">
        <p className="label">Original {itemLabel}:</p>
        <p className="text">{originalText}</p>
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
        <div className={`preview-section ${isLocked ? 'locked' : ''}`}>
          <p className="label">Modified {itemLabel}:</p>
          <p className="text modified">{preview}</p>

          {isLocked && selectedTags.length > 0 && (
            <div className="locked-tags">
              <p className="locked-tags-label">Applied Tags:</p>
              <div className="locked-tags-list">
                {selectedTags.map((tagId) => {
                  const tag = modificationTags.tags[tagId];
                  const category = modificationTags.categories[tag.category];
                  return (
                    <span
                      key={tagId}
                      className="locked-tag"
                      style={{
                        borderColor: category.color,
                        color: category.color,
                        backgroundColor: 'transparent',
                      }}
                    >
                      {tag.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

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

      {isLocked && !preview && (
        <div className="no-modification">
          <p className="label">✓ Using Original (No Modifications)</p>
        </div>
      )}
    </div>
  );
};

export default QuestionModifier;