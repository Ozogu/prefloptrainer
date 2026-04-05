import React, { useState, useEffect, useRef } from 'react';
import './ActionHistoryPanel.css';
import Card from './table/Card';
import { roundMixedFreqs } from './rangeutils';

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

  const zipArrays = (arr1, arr2) => arr1.map((item, index) => `${item}:${arr2[index]}`);

  const handToShortForm = (holeCards) => {
    if (!holeCards || holeCards.length !== 2) return null;
    const [c1, c2] = holeCards;
    if (c1[0] === c2[0]) return c1[0] + c2[0]; // pocket pair
    if (c1[1] === c2[1]) return c1[0] + c2[0] + 's'; // suited
    return c1[0] + c2[0] + 'o'; // offsuit
  };

  const renderFrequencyInfo = () => {
    const { range, holeCards } = action;
    // Legacy correct-array format
    if (range.correct && Array.isArray(range.correct) && range.options) {
      return (
        <>
          <div className="frequency-info">RNG: {range.rng}</div>
          <div>{zipArrays(range.options, range.correct).join(', ')}</div>
        </>
      );
    }
    // New mixed strategy format
    if (range.mixed && Object.keys(range.mixed).length > 0) {
      const shortHand = handToShortForm(holeCards);
      const rawFreqs = shortHand && range.mixed[shortHand];
      const freqs = rawFreqs ? roundMixedFreqs(rawFreqs) : null;
      return (
        <>
          <div className="frequency-info">RNG: {range.rng}</div>
          {freqs && (
            <div>
              Raise: {(freqs[0] * 100).toFixed(0)}%&nbsp;
              Call: {(freqs[1] * 100).toFixed(0)}%&nbsp;
              Fold: {(freqs[2] * 100).toFixed(0)}%
            </div>
          )}
        </>
      );
    }
    return null;
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
          {action.range.note && <div>{action.range.note}</div>}
          {renderFrequencyInfo()}
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
