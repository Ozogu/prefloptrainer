// rangeselector.js
import React, { useState } from 'react';
import './RangeSelector.css';
import { parseCornerRange } from './rangeutils';
import UploadRangesModal from './UploadRangesModal';

const expandRanges = (range) => {
  const newRange = { ...range };
  const parsedRaiseRange = parseCornerRange(range.raise);
  const parsedCallRange = parseCornerRange(range.call);
  const combinedRange = [...parsedRaiseRange, ...parsedCallRange];
  newRange.corner = [...new Set(combinedRange)];

  return newRange;
};

const CollapsibleGroup = ({ groupName, hasEnabledRanges, children }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded((prev) => !prev);

  return (
    <div
      className={`collapsible-group ${isExpanded ? 'expanded' : ''} ${
        hasEnabledRanges ? 'enabled-ranges' : ''
      }`}
    >
      <div className="group-header" onClick={toggleExpand}>
        {groupName}
      </div>
      {isExpanded && <div className="group-content">{children}</div>}
    </div>
  );
};

const RenderSelectAll = ({ onClick, allSelected }) => (
  <div className={`range-item ${allSelected ? 'clicked' : ''}`} onClick={onClick}>
    <li>
      <span>Select All</span>
    </li>
  </div>
);

const RangeItem = ({ name, range, setHoveredRange, setIsSelected, isSelected }) => {
  const handleMouseEnter = () => setHoveredRange(expandRanges(range));
  const handleMouseLeave = () => setHoveredRange(null);
  const handleClick = () => setIsSelected(!isSelected);

  return (
    <div
      className={`range-item ${isSelected ? 'clicked' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <li>
        <span>{name}</span>
      </li>
    </div>
  );
};

const RenderRanges = ({ ranges, selectedRanges, setIsSelected, setHoveredRange }) => {
  const allSelected =
    selectedRanges.length > 0 && selectedRanges.every((item) => item?.selected);

  const handleSelectAllClick = () => {
    ranges.forEach((_, index) => {
      setIsSelected(index, !allSelected);
    });
  };

  return (
    <ul>
      <RenderSelectAll onClick={handleSelectAllClick} allSelected={allSelected} />
      {ranges.map((range, index) => (
        <RangeItem
          key={range.name}
          name={range.name}
          range={range}
          isSelected={selectedRanges[index]?.selected || false}
          setIsSelected={(isSelected) => setIsSelected(index, isSelected)}
          setHoveredRange={setHoveredRange}
        />
      ))}
    </ul>
  );
};

const RenderGroups = ({ groups, selectedRanges, setIsSelected, setHoveredRange }) => (
  <div>
    {groups.map((group) => {
      const groupName = Object.keys(group)[0];
      const groupContent = group[groupName];
      const hasEnabledRanges =
        selectedRanges[groupName]?.some((range) => range?.selected) || false;

      return (
        <CollapsibleGroup
          key={groupName}
          groupName={groupName}
          hasEnabledRanges={hasEnabledRanges}
        >
          <RenderRanges
            ranges={groupContent}
            selectedRanges={selectedRanges[groupName] || []}
            setIsSelected={(index, isSelected) =>
              setIsSelected(groupName, index, isSelected, expandRanges(groupContent[index]))
            }
            setHoveredRange={setHoveredRange}
          />
        </CollapsibleGroup>
      );
    })}
  </div>
);

const RangeSelector = ({
  setHoveredRange,
  selectedRanges,
  setIsSelected,
  savedRanges,
  setSavedRanges,
}) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleUploadRanges = (uploadedRanges) => {
    setSavedRanges(uploadedRanges);
    setIsUploadModalOpen(false);
  };

  return (
    <div className="range-selector">
      <div className="range-item" onClick={() => setIsUploadModalOpen(true)}>
        <span>Upload Ranges</span>
      </div>
      <UploadRangesModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onRangesSubmit={handleUploadRanges}
      />
      <RenderGroups
        groups={savedRanges}
        selectedRanges={selectedRanges}
        setIsSelected={setIsSelected}
        setHoveredRange={setHoveredRange}
      />
    </div>
  );
};

export default RangeSelector;
