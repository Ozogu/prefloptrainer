import React from 'react';
import './Pot.css';

const Pot = ({ amount }) => {
  if (!amount) return null;

  return (
    <div className="pot-container">
      <div className="bet-circle"></div>
      <div className="bet-text">{amount}</div>
    </div>
  );
};

export default Pot;