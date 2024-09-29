// uploadrangesmodal.js
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './UploadRangesModal.css';

function UploadRangesModal({ isOpen, onClose, onRangesSubmit }) {
  const [jsonInput, setJsonInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        setJsonInput(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const validateParsedData = (data) => {
    if (!Array.isArray(data)) {
      return false;
    }

    for (const group of data) {
      if (typeof group !== 'object' || group === null) {
        return false;
      }

      const groupNames = Object.keys(group);
      if (groupNames.length !== 1) {
        return false;
      }

      const groupName = groupNames[0];
      const items = group[groupName];

      if (!Array.isArray(items)) {
        return false;
      }

      for (const item of items) {
        if (typeof item !== 'object' || item === null) {
          return false;
        }

        // Validate required properties in each item
        if (typeof item.name !== 'string') {
          return false;
        }

        if (typeof item.raise !== 'string') {
          return false;
        }

        if (typeof item.call !== 'string') {
          return false;
        }

        if (
          typeof item.hero !== 'object' ||
          item.hero === null ||
          Object.keys(item.hero).length === 0
        ) {
          return false;
        }

        if (
          !Array.isArray(item.villains) ||
          item.villains.length === 0 ||
          item.villains.some(
            (villain) => typeof villain !== 'object' || villain === null
          )
        ) {
          return false;
        }
      }
    }

    return true;
  };


  const handleSubmitRanges = () => {
    let parsedData;
    try {
      parsedData = JSON.parse(jsonInput);
    } catch (e) {
      setErrorMessage('Invalid JSON format.');
      return;
    }

    if (!validateParsedData(parsedData)) {
      setErrorMessage('Invalid data structure.');
      return;
    }

    // Pass the parsed data back to the parent component
    onRangesSubmit(parsedData);

    // Close the modal and clear error messages
    onClose();
    setErrorMessage('');
    setJsonInput('');
  };

  if (!isOpen) {
    return null;
  }

  // Create or get the modal root element
  const modalRoot = document.getElementById('modal-root') || (() => {
    const div = document.createElement('div');
    div.id = 'modal-root';
    document.body.appendChild(div);
    return div;
  })();

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={onClose}>
            &times;
          </span>
          <h2>Upload Ranges</h2>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste your JSON here"
          />
          <input type="file" accept=".json" onChange={handleFileUpload} />
          {errorMessage && <p className="error">{errorMessage}</p>}
          <div className="button" onClick={handleSubmitRanges}>
            <span>Submit</span>
          </div>
        </div>
      </div>
    </div>,
    modalRoot
  );
}

export default UploadRangesModal;
