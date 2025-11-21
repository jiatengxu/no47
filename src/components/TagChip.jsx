import React, { useState } from 'react';
import './TagChip.css';
import modificationTags from '../data/modificationTags.json';

const TagChip = ({ tag, isSelected, isDisabled, onSelect }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const category = modificationTags.categories[tag.category];

  return (
    <div className="tag-chip-wrapper">
      <button
        className={`tag-chip ${isSelected ? 'selected' : ''} ${
          isDisabled ? 'disabled' : ''
        }`}
        style={{
          backgroundColor: isSelected ? category.color : 'transparent',
          borderColor: category.color,
          color: isSelected ? 'white' : category.color,
        }}
        onClick={() => !isDisabled && onSelect(!isSelected)}
        disabled={isDisabled}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {tag.name}
      </button>

      {showTooltip && (
        <div className="tooltip" style={{ borderTopColor: category.color }}>
          <p className="tooltip-title">{tag.name}</p>
          <p className="tooltip-description">{tag.description}</p>
          <div className="tooltip-example">
            <p className="example-label">Example:</p>
            <p className="example-original">
              <strong>Before:</strong> {tag.example.original}
            </p>
            <p className="example-modified">
              <strong>After:</strong> {tag.example.modified}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagChip;