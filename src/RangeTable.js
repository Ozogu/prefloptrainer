import React from 'react';
import { cards, handRangeType } from './rangeutils.js';
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

    return (
      <div className='range-table-container'>
        <RenderTable range={range} isBold={isBold} />
          <RenderHighlightButton onClick={this.toggleBold} isBold={isBold} />
      </div>
    );
  }
}

export default RangeTable;