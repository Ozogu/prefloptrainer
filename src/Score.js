import React from 'react';
import './Score.css';

class Score extends React.Component {
    render() {
        const { score } = this.props;
        return (
        <div className='score'>
            <h1 className='correct'>Correct: {score.correct}</h1>
            <h1 className='incorrect'>Incorrect: {score.incorrect}</h1>
        </div>
        );
    }
}

export default Score;