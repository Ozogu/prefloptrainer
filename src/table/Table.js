import React from 'react';
import './Table.css';
import Circle from './Circle.js';
import Card from './Card.js';
import Board from './Board.js';
import Pot from './Pot.js';
import ActionModal from './ActionModal.js';

/** Helper function to rotate positions so that hero is at bottom-right */
const rotatePositions = (positions, heroPosition, offset = 0) => {
  const heroIndex = positions.indexOf(heroPosition) + offset;
  return positions.slice(heroIndex).concat(positions.slice(0, heroIndex));
};

/** Helper function to get bets, including defaults for SB and BB */
const getBets = (hero, villains) => {
  const bets = {};

  if (!hero) {
    return bets;
  }

  // Add hero's bet
  const heroPosition = Object.keys(hero)[0];
  bets[heroPosition] = hero[heroPosition];

  // Add villains' bets
  villains.forEach((villain) => {
    const pos = Object.keys(villain)[0];
    bets[pos] = villain[pos];
  });

  // Set default bets for SB and BB if not provided
  if (!bets['SB']) {
    bets['SB'] = 0.5;
  }
  if (!bets['BB']) {
    bets['BB'] = 1;
  }
  if (!bets['STR']) {
    bets['STR'] = 2;
  }

  // Remove bets with value -1
  Object.keys(bets).forEach((key) => {
    if (bets[key] === -1) {
      delete bets[key];
    }
  });

  return bets;
};

/** Helper function to build players with position, bet, and CSS class */
const buildPlayers = (positions, bets, positionClasses, playerTypes, actionsMap) => {
  return positions.map((position, index) => ({
    position,
    bet: bets[position] || 0,
    className: `player ${positionClasses[index]}`,
    outlineClass: playerTypes[position] || "default",
    actions: actionsMap[position] || null
  }));
};

/** Helper function to get player types */
const getPlayerTypes = (villains) => {
  if (!villains) {
    return {};
  }
  return villains.reduce((acc, villain) => {
    const position = Object.keys(villain)[0];
    const type = villain.type || "unknown";
    acc[position] = type;
    return acc;
  }, {});
};

/** Helper function to extract actions for all players */
const getActionsMap = (hero, villains) => {
  const actionsMap = {};

  // Add hero's actions if they exist
  if (hero && hero.actions) {
    const position = Object.keys(hero)[0];
    actionsMap[position] = hero.actions;
  }

  // Add villains' actions if they exist
  if (villains && Array.isArray(villains)) {
    villains.forEach(villain => {
      if (villain) {
        const position = Object.keys(villain)[0];
        if (villain.actions && Array.isArray(villain.actions)) {
          actionsMap[position] = villain.actions;
        }
      }
    });
  }

  return actionsMap;
};

/** Player component to render each player with their bet and actions */
const Player = ({ player, index, cardsToDisplay, range, randomNumber }) => (
  <div className={player.className}>
    <Circle klass={`table-circle ${player.outlineClass}`} text={player.position} />
    {player.bet > 0 && (
      <>
        <div className="bet-circle"></div>
        <div className="bet-text">{player.bet}</div>
      </>
    )}
    {player.actions && (
      <ActionModal
        actions={player.actions}
        position={player.position}
        playerType={player.outlineClass}
      />
    )}

    {index === 0 ? (
        <div>
        {/* Render Hero's hand */}
        <div className="card-container">
        <Card card={cardsToDisplay?.[0] ?? null} />
        <Card card={cardsToDisplay?.[1] ?? null} />

        {/* Display only random number if frequency is defined */}
        {range && range.correct && Array.isArray(range.correct) && (
            <div className="frequency-indicator">
            <span className="random-number">RNG: {randomNumber}</span>
            </div>
        )}
        </div>
        </div>
    ) :
    (
        <div></div>
    )}
  </div>
);

class Table extends React.Component {
  render() {
    const { range, hand, hero, villains, playerCount, randomNumber } = this.props;

    let positions = [];
    let positionClasses = [];
    let heroOffset = 0;

    if (playerCount == 6) {
      // All table positions in order
      positions = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];

      // Corresponding CSS classes for positioning
      positionClasses = [
        'bottom-right',
        'bottom-left',
        'left-side',
        'top-left',
        'top-right',
        'right-side',
      ];
    } else if (playerCount == 8) {
      positions = ['UTG', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB', 'STR'];
      positionClasses = [
        'big-bottom-right',
        'big-bottom-mid',
        'big-bottom-left',
        'left-side',
        'big-top-left',
        'big-top-mid',
        'big-top-right',
        'right-side',
      ];
      heroOffset = -1; // Adjust offset for 8-max tables
    }

    // Get hero's position and rotate positions array
    const heroPosition = (hero && typeof hero === 'object' && Object.keys(hero).length > 0) ? Object.keys(hero)[0] : "UTG";
    const rotatedPositions = rotatePositions(positions, heroPosition, heroOffset);

    // Get bets including defaults
    const bets = getBets(hero, villains);
    const playerTypes = getPlayerTypes(villains);

    // Get actions for all players
    const actionsMap = getActionsMap(hero, villains);

    // Build players data
    const players = buildPlayers(rotatedPositions, bets, positionClasses, playerTypes, actionsMap);

    // Get board cards from range if available
    const boardCards = range && range.board ? range.board : null;

    // Use hand from range if specified
    const cardsToDisplay = (range && range.hand) ? this.convertHandToCards(range.hand) : hand;

    return (
      <div className="container">
        <div className="table">
          {/* Render board cards using the Board component */}
          <Board cards={boardCards} />

          {/* Render pot */}
          <Pot amount={range?.pot} />

          {/* Render players */}
          {players.map((player, index) => (
            <Player
              key={player.position}
              player={player}
              index={index + heroOffset} // Adjust index for hero offset
              cardsToDisplay={cardsToDisplay}
              range={range}
              randomNumber={randomNumber}
            />
          ))}
        </div>
      </div>
    );
  }

  /**
   * Convert a hand notation (e.g., 'AQs', 'T9o', 'KK') or explicit card notation (e.g., 'AdQd') to actual cards
   * @param {string} hand - Hand notation like 'AQs', 'T9o', 'KK' or explicit cards like 'AdQd'
   * @returns {Array} Array of two cards [cardA, cardB]
   */
  convertHandToCards(handNotation) {
    if (!handNotation || typeof handNotation !== 'string') {
      return null;
    }

    // Case 1: Explicit card notation (e.g., "AdQd")
    if (handNotation.length === 4) {
      const card1 = handNotation.substring(0, 2); // First card (e.g., "Ad")
      const card2 = handNotation.substring(2, 4); // Second card (e.g., "Qd")
      return [card1, card2];
    }

    // Case 2: Standard poker notation
    // Extract rank and suitedness
    let rank1, rank2, suited;
    if (handNotation.length === 2) {
      // Pocket pair
      rank1 = rank2 = handNotation[0];
      suited = true;
    } else if (handNotation.length === 3) {
      rank1 = handNotation[0];
      rank2 = handNotation[1];
      suited = handNotation[2] === 's';
    } else {
      return null;
    }

    // Translate to actual cards
    const suits = ['s', 'h', 'd', 'c'];
    const suit1 = suits[0]; // Always use spades for the first card

    // For second card, use same suit for suited hands, different suit for offsuit
    const suit2 = suited ? suit1 : suits[1];

    return [`${rank1}${suit1}`, `${rank2}${suit2}`];
  }
}

export default Table;
