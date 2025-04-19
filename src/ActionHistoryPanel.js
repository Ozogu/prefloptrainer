import React, { useState, useEffect, useRef } from 'react';
import './ActionHistoryPanel.css';
import Card from './table/Card';

// Component to render the hole cards
const HoleCards = ({ holeCards }) => (
  <div className="hole-cards">
    {holeCards.map((card, idx) => (
      <Card key={idx} card={card} />
    ))}
  </div>
);

// Component to render each action item
const ActionItem = ({ action, onHover }) => {
  const [showNote, setShowNote] = useState(false);
  const [notePosition, setNotePosition] = useState('top');
  const itemRef = useRef(null);

  const handleMouseEnter = () => {
    onHover(action.range);
    setShowNote(true);

    // Calculate if there's enough space above
    if (itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      // If space above is less than 100px, show below
      if (spaceAbove < 100) {
        setNotePosition('bottom');
      } else {
        setNotePosition('top');
      }
    }
  };

  return (
    <li
      ref={itemRef}
      className={`item-container ${
        action.action === action.correctAction ? 'correct' : 'incorrect'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => {
        onHover(null);
        setShowNote(false);
      }}
    >
      <HoleCards holeCards={action.holeCards} />
      <div className="text-container">
        <span>{action.range.name}</span>
        <span>Action: {action.action}</span>
        <span>Correct: {action.correctAction}</span>
      </div>
      {showNote && (
        <div className={`note-container ${notePosition}`}>
          {action.range.frequency ? (
            <div className="frequency-info">RNG: {action.range.rng}/{action.range.frequency}</div>
          ) : null}
          {action.range.note && <div>{action.range.note}</div>}
        </div>
      )}
    </li>
  );
};

// Main component
const ActionHistoryPanel = ({ history, onHover }) => {
  const [showLastRange, setShowLastRange] = useState(true);
  const [hoveredRange, setHoveredRange] = useState(null);

  // Effect to handle showing the last range or hovered range
  useEffect(() => {
    if (hoveredRange) {
      // Show the hovered range
      onHover(hoveredRange);
    } else if (showLastRange && history.length > 0) {
      // Show the last action's range if toggle is on
      onHover(history[history.length - 1].range);
    } else {
      // Clear the range display
      onHover(null);
    }
  }, [hoveredRange, showLastRange, history, onHover]);

  // Toggle button handler
  const handleToggle = () => {
    setShowLastRange((prev) => !prev);
  };

  return (
    <div className="action-history-panel">
      <div className={`toggle-button ${showLastRange ? 'active' : ''} button`}
        onClick={handleToggle}>
        {showLastRange ? 'Hide Last Range' : 'Show Last Range'}
      </div>
      <ul>
        {history
          .slice()
          .reverse()
          .map((action, index) => (
            <ActionItem
              key={index}
              action={action}
              onHover={(range) => setHoveredRange(range)}
            />
          ))}
      </ul>
    </div>
  );
};

export default ActionHistoryPanel;
