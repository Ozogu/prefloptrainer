import React from 'react';
import { cards, handRangeType, rangeCombos } from './rangeutils.js';
import './RangeTable.css';

const RenderCell = ({ cell, range, isBold }) => {
  const rangeType = handRangeType(range, cell);
  const className = `${rangeType} ${isBold ? 'bold' : ''}`;

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