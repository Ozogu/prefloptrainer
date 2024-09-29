import React from 'react';
import './Card.css';

class Card extends React.Component {
  render() {
    const { card } = this.props;
    if (card === null) {
      return null;
    }

    const value = card[0];
    const suit = card[1];
    const symbol_map = {
      'h': '♥',
      'd': '♦',
      'c': '♣',
      's': '♠'
    };

    return <div className={`card ${suit}`}>
      <div className={`suit s-${suit}`}>{symbol_map[suit]}</div>
      <div className='value'>{value}  </div>
    </div>;
  }
}

export default Card;
