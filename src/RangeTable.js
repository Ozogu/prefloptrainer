import React from 'react';
import { cards, handRangeType, rangeCombos } from './rangeutils.js';
import './RangeTable.css';

const RenderCell = ({ cell, range, isBold }) => {
  const rangeType = handRangeType(range, cell);

  // Mixed strategy: render gradient fill proportional to raise/call/fold frequencies
  if (rangeType && typeof rangeType === 'object' && rangeType.type === 'mixed') {
    const { raise, call, fold } = rangeType;
    const raisePct = (raise * 100).toFixed(2);
    const callPct = (call * 100).toFixed(2);
    // Gradient: raise (red) | call (green) | fold (dark/transparent)
    const gradient = `linear-gradient(to right, var(--red) ${raisePct}%, var(--green) ${raisePct}%, var(--green) ${(raise + call) * 100}%, transparent ${(raise + call) * 100}%)`;
    const cornerClass = isBold && range && range.corner && range.corner.includes && range.corner.includes(cell) ? ' bold corner' : '';
    return (
      <td
        className={`mixed${cornerClass}`}
        style={{ background: gradient, color: 'white' }}
        title={`R:${(raise * 100).toFixed(0)}% C:${(call * 100).toFixed(0)}% F:${(fold * 100).toFixed(0)}%`}
      >
        {cell}
      </td>
    );
  }

  const className = `${typeof rangeType === 'string' ? rangeType : 'none'} ${isBold ? 'bold' : ''}`;
  return <td className={className}>{cell}</td>;
}

const RenderRow = ({ row, range, isBold }) => {
  return (
    <tr>
      {row.map((cell, index) => (
        <RenderCell key={index} cell={cell} range={range} isBold={isBold} />
      ))}
    </tr>
  );
};

const RenderTable = ({ range, isBold }) => {
  const rows = [];
  for (let i = 0; i < cards.length; i += 13) {
    rows.push(cards.slice(i, i + 13));
  }

  return (
    <table>
      <tbody>
        {rows.map((row, index) => (
          <RenderRow key={index} row={row} range={range} isBold={isBold} />
        ))}
      </tbody>
    </table>
  );
};

const RenderHighlightButton = ({ onClick, isBold }) => {
  return (
    <div className={`button ${isBold ? "bold" : ""}`} onClick={onClick}>
      <span>
        {isBold ? 'Remove highlight' : 'Highlight query ranges'}
      </span>
    </div>
  );
};

const RenderRangePercentage = ({ name, range }) => {
  const combos = rangeCombos(range);
  const percentage = ((combos / 1326) * 100).toFixed(2);
  return (
    <div className="range-percentage">
      <span>{name}: {percentage}% ({combos})</span>
    </div>
  );
};

class RangeTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isBold: false
    };
  }

  toggleBold = () => {
    this.setState(prevState => ({ isBold: !prevState.isBold }));
  }

  render() {
    const { range } = this.props;
    const { isBold } = this.state;
    console.log(range)

    return (
      <div className='range-table-container'>
          {range ? (
            <>
              <RenderTable range={range} isBold={isBold} />
              <RenderRangePercentage name="Raise" range={range.raise ? range.raise : null} />
              <RenderRangePercentage name="Call" range={range.call ? range.call : null} />
            </>
          ) : (
            <div></div>
          )}
          <RenderHighlightButton onClick={this.toggleBold} isBold={isBold} />
      </div>
    );
  }
}

export default RangeTable;