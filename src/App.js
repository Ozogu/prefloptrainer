import React, { useState, useEffect, useMemo, useRef } from 'react';
import './App.css';
import Table from './table/Table';
import RangeTable from './RangeTable';
import RangeSelector from './RangeSelector';
import GameButtons from './GameButtons';
import Score from './Score';
import ActionHistoryPanel from './ActionHistoryPanel';
import defaultRanges from './headsup.json';

function App() {
  const RenderCoffee = () => {
    const handleClick = () => {
      window.open('https://www.buymeacoffee.com/ozogu', '_blank', 'noopener,noreferrer');
    };

    return (
      <button onClick={handleClick} className="bmc-custom-button">
        <span role="img" aria-label="Coffee">
        🔷
        </span>{' '}
        Fund my punt
      </button>
    );
  };

  const clearLocalStorage = () => {
    localStorage.clear();
    setSelectedRanges({});
    setSavedRanges(defaultRanges);
  };

  const RenderClearLocalStorage = () => (
    <div className="button-container">
      <div className="button center" onClick={clearLocalStorage}>
        <span>Clear Local Storage</span>
      </div>
    </div>
  );

  const getRandomRange = (selectedRanges) => {
    let ranges = [];
    for (const group in selectedRanges) {
      for (const idx in selectedRanges[group]) {
        if (selectedRanges[group][idx] && selectedRanges[group][idx].selected) {
          ranges.push(selectedRanges[group][idx].range);
        }
      }
    }

    if (ranges.length === 0) {
      return null;
    }

    // Select a random range from the selected ranges
    let randomRange = null;
    while (!randomRange) {
      const randomRangeIndex = Math.floor(Math.random() * ranges.length);
      randomRange = ranges[randomRangeIndex];
    }

    return randomRange;
  };

  const getRandomHand = (range) => {
    if (!range || !range.corner) {
      return null;
    }

    range = range.corner;

    let randomHand = null;
    while (!randomHand) {
      const randomHandIndex = Math.floor(Math.random() * range.length);
      randomHand = range[randomHandIndex];
    }

    let suit = 'o';
    if (randomHand.length == 3 && randomHand[2] === 's') {
      suit = 's';
    }

    randomHand = randomHand.replace(/\s+/g, '');
    const suits = [ 'c', 'd', 'h', 's' ];
    const randomSuit1 = suits[Math.floor(Math.random() * suits.length)];

    let retval;
    if (suit == 'o') {
      let randomSuit2;
      do {
        randomSuit2 = suits[Math.floor(Math.random() * suits.length)];
      } while (randomSuit2 === randomSuit1);

      retval = [`${randomHand[0]}${randomSuit1}`, `${randomHand[1]}${randomSuit2}`];
    } else {
      retval = [`${randomHand[0]}${randomSuit1}`, `${randomHand[1]}${randomSuit1}`];
    }

    return retval;
  };

  const onAction = (range, hand, action, correctAction) => {
    if (!range || !hand) {
      return;
    }

    setScore((prevScore) => ({
      correct: prevScore.correct + (correctAction === action ? 1 : 0),
      incorrect: prevScore.incorrect + (correctAction === action ? 0 : 1),
    }));

    addActionToHistory(range, hand, action, correctAction);
  }

  const addActionToHistory = (range, holeCards, action, correctAction) => {
    setHistory(prevHistory => [
      ...prevHistory,
      { range: range, holeCards, action, correctAction }
    ]);
  };


  const [history, setHistory] = useState([]);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [hoveredRange, setHoveredRange] = useState(null);
  const [selectedRanges, setSelectedRanges] = useState(() => {
    // Load initial state from local storage
    const savedRanges = localStorage.getItem('selectedRanges');
    return savedRanges ? JSON.parse(savedRanges) : {};
  });

  // Save state to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedRanges', JSON.stringify(selectedRanges));
  }, [selectedRanges]);

  // State to manage saved ranges
  const [savedRanges, setSavedRanges] = useState(() => {
    const saved = localStorage.getItem('savedRanges');
    return saved ? JSON.parse(saved) : defaultRanges; // Use defaultRanges if nothing is saved
  });

  // Save savedRanges to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('savedRanges', JSON.stringify(savedRanges));
  }, [savedRanges]);

  const setIsSelected = (groupName, index, isSelected, range) => {
    setSelectedRanges(prevState => {
      const newGroupSelections = [...(prevState[groupName] || [])];
      newGroupSelections[index] = { "selected": isSelected, "range": range, };
      return { ...prevState, [groupName]: newGroupSelections };
    });
  };

  // Memoize the result of getRandomHand based on selectedRanges
  const memoizedRandomRange = useMemo(() => getRandomRange(selectedRanges), [selectedRanges, score]);
  const memoizedRandomHand = useMemo(() => getRandomHand(memoizedRandomRange), [selectedRanges, score]);


  return (
    <div className="app-container">
      <RangeSelector
        setHoveredRange={setHoveredRange}
        selectedRanges={selectedRanges}
        setIsSelected={setIsSelected}
        savedRanges={savedRanges}
        setSavedRanges={setSavedRanges}
      />
      <ActionHistoryPanel history={history} onHover={setHoveredRange} />
      <div className="main-content">
        <RenderCoffee />
        <Table
          hand={memoizedRandomHand}
          hero={memoizedRandomRange?.hero ?? null}
          villains={memoizedRandomRange?.villains ?? null}
        />
        <Score score={score} />
        <GameButtons hand={memoizedRandomHand} range={memoizedRandomRange} onAction={onAction} />
        <RangeTable range={hoveredRange} />
        <RenderClearLocalStorage />
      </div>
    </div>
  );
}

export default App;