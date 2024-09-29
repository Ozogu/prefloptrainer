import React from 'react';
import './Table.css';
import Circle from './Circle.js';
import Card from './Card.js';

/** Helper function to rotate positions so that hero is at bottom-right */
const rotatePositions = (positions, heroPosition) => {
  const heroIndex = positions.indexOf(heroPosition);
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

  return bets;
};

/** Helper function to build players with position, bet, and CSS class */
const buildPlayers = (positions, bets, positionClasses) => {
  return positions.map((position, index) => ({
    position,
    bet: bets[position] || 0,
    className: `player ${positionClasses[index]}`,
  }));
};

/** Player component to render each player with their bet */
const Player = ({ player }) => (
  <div className={player.className}>
    <Circle klass="table-circle" text={player.position} />
    {player.bet > 0 && (
      <>
        <div className="bet-circle"></div>
        <div className="bet-text">{player.bet}</div>
      </>
    )}
  </div>
);

class Table extends React.Component {
  render() {
    const { hand, hero, villains } = this.props;

    // All table positions in order
    const positions = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];

    // Corresponding CSS classes for positioning
    const positionClasses = [
      'bottom-right',
      'bottom-left',
      'left-side',
      'top-left',
      'top-right',
      'right-side',
    ];

    // Get hero's position and rotate positions array
    const heroPosition = (hero && typeof hero === 'object' && Object.keys(hero).length > 0) ? Object.keys(hero)[0] : "UTG";
    const rotatedPositions = rotatePositions(positions, heroPosition);

    // Get bets including defaults
    const bets = getBets(hero, villains);

    // Build players data
    const players = buildPlayers(rotatedPositions, bets, positionClasses);

    return (
      <div className="container">
        <div className="table">
          {/* Render Hero's hand */}
          <div className="card-container">
            <Card card={hand?.[0] ?? null} />
            <Card card={hand?.[1] ?? null} />
          </div>

          {/* Render players */}
          {players.map((player) => (
            <Player key={player.position} player={player} />
          ))}
        </div>
      </div>
    );
  }
}

export default Table;
