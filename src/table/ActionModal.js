import React from 'react';
import './ActionModal.css';

/**
 * Component to display a player's action history in a compact horizontal format
 * @param {Object} props - Component properties
 * @param {Array} props.actions - Array of action strings
 * @param {String} props.position - Player position (e.g., 'BTN', 'BB')
 * @param {String} props.playerType - Type of player (e.g., 'fish', 'reg')
 */
const ActionModal = ({ actions, position, playerType }) => {
  // Ensure actions is an array
  const actionsList = Array.isArray(actions) ? actions : [];

  if (actionsList.length === 0) {
    return null;
  }

  return (
    <div className={`action-modal ${playerType || 'default'}`}>
      <div className="action-modal-content">
        <div className="actions-horizontal">
          {actionsList.map((action, index) => (
            <span key={index} className="action-item">
              {index > 0 ? ' → ' : ''}{action}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActionModal;