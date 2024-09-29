import React, { useState, useEffect } from 'react';
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
const ActionItem = ({ action, onHover }) => (
  <li
    className={`item-container ${
      action.action === action.correctAction ? 'correct' : 'incorrect'
    }`}
    onMouseEnter={() => onHover(action.range)}
    onMouseLeave={() => onHover(null)}
  >
    <HoleCards holeCards={action.holeCards} />
    <div className="text-container">
      <span>{action.range.name}</span>
      <span>Action: {action.action}</span>
      <span>Correct: {action.correctAction}</span>
    </div>
  </li>
);

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
