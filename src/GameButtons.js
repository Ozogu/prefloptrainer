import React, { useState, useRef, useEffect } from 'react';
import './GameButtons.css';
import { isHandInRange, parseRange } from './rangeutils';

const RenderButton = ({ name, onClick, feedback, hotkey, className, buttonIndex }) => {
  // Check if this is a ghost button
  const isGhost = name.toLowerCase().includes('ghost');

  // Only apply onClick handler if this is not a ghost button
  const handleClick = isGhost ? undefined : () => onClick(name, buttonIndex);

  return (
    <div className={`button ${className || name.toLowerCase()}`} onClick={handleClick}>
      <span>{name} {!isGhost && hotkey ? `(${hotkey})` : ''}</span>
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
      return 'raise';
    }
  }

  if (range !== null && range.call) {
    const r = parseRange(range.call);
    if (isHandInRange(r, hand)) {
      return 'call';
    }
  }

  return 'fold';
};

/**
 * Determines if an action is correct based on a frequency table
 * @param {string} action - The user's selected action
 * @param {Array} options - Array of possible actions
 * @param {Array} correctFrequencies - Array of frequency percentages for each action
 * @param {number} randomValue - Random number between 0 and 1
 * @returns {boolean} - Whether the action is correct based on frequency
 */
const isCorrectBasedOnFrequency = (action, options, correctFrequencies, randomValue) => {
  // Find the index of the action in the options array
  const actionIndex = options.findIndex(
    opt => opt.toLowerCase() === action.toLowerCase()
  );

  // If action isn't in options or frequencies array isn't long enough, it's incorrect
  if (actionIndex === -1 || actionIndex >= correctFrequencies.length) {
    return false;
  }

  // Get the frequency for this action
  const frequency = correctFrequencies[actionIndex];

  // If frequency is 0, action is never correct
  if (frequency <= 0) {
    return false;
  }

  // Generate a random number between 0 and 100
  const rng = randomValue;

  // Calculate cumulative probabilities
  let cumulativeProb = 0;
  for (let i = 0; i <= actionIndex; i++) {
    cumulativeProb += correctFrequencies[i];
  }

  const lowerBound = cumulativeProb - correctFrequencies[actionIndex];
  const upperBound = cumulativeProb;

  // The action is correct if random number falls within the range
  return rng > lowerBound && rng <= upperBound;
};

// Helper function to get button style class based on index
const getButtonClass = (option, index) => {
  let baseClass = '';

  // Always use standard classes for call and fold
  if (option.toLowerCase() === 'call') baseClass = 'call';
  else if (option.toLowerCase() === 'fold') baseClass = 'fold';
  // For betting options, use bet1, bet2, bet3, etc. based on index
  else baseClass = `bet${index + 1}`;

  // Add 'ghost' class if the option name contains 'ghost'
  if (option.toLowerCase().includes('ghost')) {
    return `${baseClass} ghost`;
  }

  return baseClass;
};

const GameButtons = ({ hand, range, onAction, randomNumber }) => {
  const [feedback, setFeedback] = useState({});
  const feedbackIdRef = useRef(0);
  const timeoutRef = useRef(null);
  const handRef = useRef(hand);
  const rangeRef = useRef(range);
  const rngRef = useRef(randomNumber);

  // Define default options if range.options is not available
  const options = (range && range.options) ? range.options : ["fold", "call", "raise", "ghost1"];

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

  const onClick = (action, buttonIndex) => {
    // Make sure we have valid references before proceeding
    if (!handRef.current || !rangeRef.current || !rngRef.current) {
      return;
    }

    action = action.toLowerCase();

    // Get the correct action which could be a string or frequency array
    const correctAction = determineCorrectAction(handRef.current, rangeRef.current);
    let isCorrect = false;

    if (Array.isArray(correctAction)) {
      // Handle frequency table format
      isCorrect = isCorrectBasedOnFrequency(
        action,
        rangeRef.current.options,
        correctAction,
        rngRef.current
      );
    } else {
      // Traditional single-action comparison
      isCorrect = action === correctAction;
    }

    feedbackIdRef.current += 1;
    // Use only the buttonIndex as the key for feedback
    const newFeedback = {
      [buttonIndex]: {
        type: isCorrect ? 'correct' : 'incorrect',
        id: feedbackIdRef.current
      },
    };
    setFeedback(newFeedback);

    // Pass the original action and correctAction to maintain exact format
    onAction(rangeRef.current, handRef.current, action, correctAction, buttonIndex);

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
      // Map keys to actions based on the specified requirements
      if (options && options.length > 0) {
        // Filter out ghost options before mapping keys
        const nonGhostOptions = options.filter(opt => !opt.toLowerCase().includes('ghost'));

        // Find fold/check, call and betting options
        const foldIndex = nonGhostOptions.findIndex(opt =>
          opt.toLowerCase() === 'fold' || opt.toLowerCase() === 'check');
        const callIndex = nonGhostOptions.findIndex(opt =>
          opt.toLowerCase() === 'call');

        // Get betting options (anything that's not fold/check or call)
        const bettingOptions = nonGhostOptions.filter((opt, idx) =>
          idx !== foldIndex && idx !== callIndex);

        // Betting keys in order: 1, 6, 5, 4, 9, 8, 7
        const bettingKeys = ['1', '6', '5', '4', '9', '8', '7'];

        // Handle fold/check with key 3
        if (event.key === '3' && foldIndex !== -1) {
          // Find the original index in the full options array
          const originalIndex = options.indexOf(nonGhostOptions[foldIndex]);
          if (originalIndex !== -1) {
            onClick(options[originalIndex], originalIndex);
          }
        }
        // Handle call with key 2
        else if (event.key === '2' && callIndex !== -1) {
          // Find the original index in the full options array
          const originalIndex = options.indexOf(nonGhostOptions[callIndex]);
          if (originalIndex !== -1) {
            onClick(options[originalIndex], originalIndex);
          }
        }
        // Handle betting options with their respective keys
        else {
          const keyIndex = bettingKeys.indexOf(event.key);
          if (keyIndex !== -1 && keyIndex < bettingOptions.length) {
            // Find the original index of the betting option
            const originalIndex = options.indexOf(bettingOptions[keyIndex]);
            if (originalIndex !== -1) {
              onClick(options[originalIndex], originalIndex);
            }
          }
        }
      } else {
        // Default key bindings for standard Raise/Call/Fold
        if (event.key === '1') {
          onClick('raise', 0);
        } else if (event.key === '2') {
          onClick('call', 1);
        } else if (event.key === '3') {
          onClick('fold', 2);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [options]);

  // Helper function to determine the hotkey for a given option
  const getHotkey = (option, index) => {
    if (option.toLowerCase() === 'fold' || option.toLowerCase() === 'check') {
      return '3';
    } else if (option.toLowerCase() === 'call') {
      return '2';
    } else {
      // Betting options get assigned keys in this order
      const bettingKeys = ['1', '6', '5', '4', '9', '8', '7'];

      // Find the index among betting options
      const bettingOptions = options.filter(opt =>
        opt.toLowerCase() !== 'fold' &&
        opt.toLowerCase() !== 'check' &&
        opt.toLowerCase() !== 'call');

      const bettingIndex = bettingOptions.indexOf(option);

      return bettingIndex >= 0 && bettingIndex < bettingKeys.length ? bettingKeys[bettingIndex] : '';
    }
  };

  return (
    <div className="container">
        {options.slice().reverse().map((option, index) => {
          const buttonIndex = options.length - 1 - index;
          const isGhost = option.toLowerCase().includes('ghost');
          return (
            <RenderButton
              key={option}
              name={option.charAt(0).toUpperCase() + option.slice(1)}
              onClick={isGhost ? undefined : onClick}
              feedback={feedback[buttonIndex]}
              hotkey={isGhost ? '' : getHotkey(option, index)}
              className={getButtonClass(option, index)}
              buttonIndex={buttonIndex}
            />
          );
        })}
    </div>
  );
};

export default GameButtons;