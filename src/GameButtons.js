import React, { useState, useRef, useEffect } from 'react';
import './GameButtons.css';
import { isHandInRange, parseRange } from './rangeutils';

const RenderButton = ({ name, onClick, feedback, hotkey }) => {
  return (
    <div className={`button ${name.toLowerCase()}`} onClick={() => onClick(name)}>
      <span>{name} ({hotkey})</span>
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
}

const determineCorrectAction = (hand, range) => {
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

const GameButtons = ({ hand, range, onAction }) => {
  const [feedback, setFeedback] = useState({});
  const feedbackIdRef = useRef(0);
  const timeoutRef = useRef(null);
  const handRef = useRef(hand);
  const rangeRef = useRef(range);

  // Update the refs whenever the hand or range props change
  useEffect(() => {
    handRef.current = hand;
  }, [hand]);

  useEffect(() => {
    rangeRef.current = range;
  }, [range]);

  const onClick = (action) => {
    const correctAction = determineCorrectAction(handRef.current, rangeRef.current);
    const isCorrect = action === correctAction;
    feedbackIdRef.current += 1;
    const newFeedback = {
      [action]: { type: isCorrect ? 'correct' : 'incorrect', id: feedbackIdRef.current },
    };
    setFeedback(newFeedback);

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
      if (event.key === '1') {
        onClick('Raise');
      } else if (event.key === '2') {
        onClick('Call');
      } else if (event.key === '3') {
        onClick('Fold');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  return (
    <div className="container">
      <RenderButton name="Raise" onClick={() => onClick('Raise')} feedback={feedback['Raise']} hotkey="1" />
      <RenderButton name="Call" onClick={() => onClick('Call')} feedback={feedback['Call']} hotkey="2" />
      <RenderButton name="Fold" onClick={() => onClick('Fold')} feedback={feedback['Fold']} hotkey="3" />
    </div>
  );
};

export default GameButtons;