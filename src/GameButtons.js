import React, { useState, useRef, useEffect } from 'react';
import './GameButtons.css';
import { isHandInRange, parseRange } from './rangeutils';

const RenderButton = ({ name, onClick, feedback, hotkey, className }) => {
  return (
    <div className={`button ${className || name.toLowerCase()}`} onClick={() => onClick(name)}>
      <span>{name} {hotkey ? `(${hotkey})` : ''}</span>
      {feedback && (
        <div className={`feedback ${feedback.type}`} key={feedback.id}>
          {feedback.type}
        </div>
      )}
    </div>
  );
};

const handToShortForm = (hand) => {
  let retval = "";

  if (!hand || hand.length !== 2) {
    return retval;
  }

  // pocket pair
  if (hand[0][0] === hand[1][0]) {
    retval = hand[0][0] + hand[1][0];
  } else if (hand[0][1] === hand[1][1]) {
    retval = hand[0][0] + hand[1][0] + 's';
  } else {
    retval = hand[0][0] + hand[1][0] + 'o';
  }

  return retval;
};

const determineCorrectAction = (hand, range) => {
  // If we have a correct action in the range, use that
  if (range && range.correct) {
    // Return the correct action as-is, preserving the exact format from the range data
    return range.correct;
  }

  // Otherwise use the traditional raise/call/fold logic
  hand = handToShortForm(hand);
  if (range !== null && range.raise) {
    const r = parseRange(range.raise);
    if (isHandInRange(r, hand)) {
      return 'Raise';
    }
  }

  if (range !== null && range.call) {
    const r = parseRange(range.call);
    if (isHandInRange(r, hand)) {
      return 'Call';
    }
  }

  return 'Fold';
};

// Helper function to get button style class based on index
const getButtonClass = (option, index) => {
  // Always use standard classes for call and fold
  if (option.toLowerCase() === 'call') return 'call';
  if (option.toLowerCase() === 'fold') return 'fold';

  // For betting options, use bet1, bet2, bet3, etc. based on index
  return `bet${index + 1}`;
};

const GameButtons = ({ hand, range, onAction, randomNumber }) => {
  const [feedback, setFeedback] = useState({});
  const feedbackIdRef = useRef(0);
  const timeoutRef = useRef(null);
  const handRef = useRef(hand);
  const rangeRef = useRef(range);
  const rngRef = useRef(randomNumber);

  // Update the refs whenever the hand or range props change
  useEffect(() => {
    handRef.current = hand;
  }, [hand]);

  useEffect(() => {
    rangeRef.current = range;
  }, [range]);

  useEffect(() => {
    rngRef.current = randomNumber;
  }, [randomNumber]);

  const onClick = (action) => {
    // Make sure we have valid references before proceeding
    if (!handRef.current || !rangeRef.current || !rngRef.current) {
      return;
    }

    // Get a random number between 1 and 100 for frequency-based decisions
    const correctAction = determineCorrectAction(handRef.current, rangeRef.current);
    let isCorrect = action === correctAction;
    if (isCorrect && range.frequency) {
      isCorrect = rngRef.current <= range.frequency;
    }

    feedbackIdRef.current += 1;
    const newFeedback = {
      [action]: { type: isCorrect ? 'correct' : 'incorrect', id: feedbackIdRef.current },
    };
    setFeedback(newFeedback);

    // Pass the original action and correctAction to maintain exact format
    onAction(rangeRef.current, handRef.current, action, correctAction);

    // Clear any existing timeout and set a new one
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setFeedback({});
      timeoutRef.current = null;
    }, 2000);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      // If we have custom options, use different key bindings
      if (range && range.options && range.options.length > 0) {
        const numKey = parseInt(event.key);
        if (!isNaN(numKey) && numKey > 0 && numKey <= range.options.length) {
          onClick(range.options[numKey - 1]);
        }
      } else {
        // Default key bindings
        if (event.key === '1') {
          onClick('Raise');
        } else if (event.key === '2') {
          onClick('Call');
        } else if (event.key === '3') {
          onClick('Fold');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [range]);

  // Check if the range has custom options
  const hasCustomOptions = range && range.options && range.options.length > 0;

  return (
    <div className="container">
      {hasCustomOptions ? (
        // Render custom buttons based on range.options
        range.options.map((option, index) => (
          <RenderButton
            key={option}
            name={option.charAt(0).toUpperCase() + option.slice(1)}
            onClick={() => onClick(option)}
            feedback={feedback[option]}
            hotkey={`${index + 1}`}
            className={getButtonClass(option, index)}
          />
        ))
      ) : (
        // Render default buttons
        <>
          <RenderButton name="Raise" onClick={() => onClick('Raise')} feedback={feedback['Raise']} hotkey="1" />
          <RenderButton name="Call" onClick={() => onClick('Call')} feedback={feedback['Call']} hotkey="2" />
          <RenderButton name="Fold" onClick={() => onClick('Fold')} feedback={feedback['Fold']} hotkey="3" />
        </>
      )}
    </div>
  );
};

export default GameButtons;