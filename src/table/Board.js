import React from 'react';
import Card from './Card';
import './Board.css';

class Board extends React.Component {
  render() {
    const { cards } = this.props;

    if (!cards || cards.length === 0) {
      return null;
    }

    return (
      <div className="board-container">
        {cards.map((card, index) => (
          <Card key={index} card={card} />
        ))}
      </div>
    );
  }
}

export default Board;