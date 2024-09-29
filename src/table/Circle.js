import React from 'react';
import './Circle.css';

class Circle extends React.Component {
  render() {
    const { klass, text } = this.props;
    const style = {
      borderRadius: '50%',
      boxSizing: 'border-box',
    };

    return <div className={klass} style={style}>
      <div className='text' >{text}</div>
    </div>;
  }
}

export default Circle;
