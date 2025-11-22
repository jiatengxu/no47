import React, { useState, useRef, useEffect } from 'react';
import './TagChip.css';
import modificationTags from '../data/modificationTags.json';

const TagChip = ({ tag, isSelected, isDisabled, onSelect }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const chipRef = useRef(null);
  const category = modificationTags.categories[tag.category];

  useEffect(() => {
    if (showTooltip && chipRef.current) {
      const rect = chipRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.top - 10,
        left: rect.left + rect.width / 2,
      });
    }
  }, [showTooltip]);

  return (
    <div className="tag-chip-wrapper">
      <button
        ref={chipRef}
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
        <div
          className="tooltip"
          style={{
            top: `${tooltipPos.top}px`,
            left: `${tooltipPos.left}px`,
            borderTopColor: category.color,
          }}
        >
          <p className="tooltip-title">{tag.name}</p>
          <p className="tooltip-description">{tag.description}</p>
          <p className="tooltip-purpose">{tag.purpose}</p>
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