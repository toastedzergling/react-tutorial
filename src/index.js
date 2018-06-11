import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function Square(props) {
  return (
    <button className="square" onClick={props.onClick} style={props.isWinner ? {backgroundColor: 'yellow'} : {}}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i, isWinner) {
    return (<Square
      onClick={() => this.props.onClick(i)}
      key={i}
      value={this.props.squares[i]}
      isWinner={isWinner}
    />);
  }


  render() {
    let board = [];
    // The instructions explicitly called for _two_ loops
    // otherwise you could just do a chunked map
    // I like for loops, I don't understand the hate
    for(let rows=0; rows < 3; rows++ ){
      let row = [];
      for(let cols=0; cols < 3; cols++){
        const cellNum = rows*3 + cols
        let cell = this.renderSquare(cellNum, this.props.winningLine.includes(cellNum) )
        row.push(cell)
      }
      board.push(<div key={rows} className="board-row">{ row }</div>);
    }
    return <div>{ board }</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        moveLoc: null
      }],
      currPlayer: 'X',
      currMove: 0,
      sortAsc: true
    }
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.currMove+1)
    const current = history[this.state.currMove].squares;
    if (calculateWinner(current) || current[i]) {
      return;
    }
    const squares = current.slice();
    squares[i] = this.state.currPlayer;
    this.setState({
      history: history.concat([{
        squares,
        moveLoc: i
      }]),
      currPlayer: this.state.currPlayer === 'X' ? 'O' : 'X',
      currMove: this.state.currMove + 1
    });
  }

  jumpTo(moveIdx) {
    const currPlayer = moveIdx % 2 === 0 ? 'X' : 'O';
    this.setState({
      currMove: moveIdx,
      currPlayer
    })
  }

  render() {
    const currBoard = this.state.history[this.state.currMove].squares
    const {winner, winningLine} = calculateWinner(currBoard) || { winningLine:[] }

    const moves = this.state.history.map((step, move) => {
      const desc = move !== 0 ?
        'Go to move #' + move :
        'Go to game start';
      const moveLoc = step.moveLoc;
      const moveLocX = moveLoc % 3;  
      const moveLocY = Math.floor(moveLoc / 3);
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
          <span style={ this.state.currMove === move ? {fontWeight: 'bold'} : {}}>{ moveLoc !== null ? `Mov Loc: ${moveLocX}, ${moveLocY}` : ''}</span>
        </li>
      );
    });

    if (!this.state.sortAsc) {
      moves.reverse()
    }

    let status
    if (winner) {
      status = `The winner is ${winner}`
    } else if(this.state.currMove === 9) {
      status = 'The game is a draw'
    } else {
      status = `Next player: ${this.state.currPlayer}`;
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={currBoard} 
            onClick={i => this.handleClick(i)}
            winningLine={winningLine}
          />
        </div>
        <div className="game-info">
          <div>{ status }</div>
          <div>Curr move: { this.state.currMove }</div>
          <div>Sort Asc: <input checked={this.state.sortAsc} type='checkbox' onChange={() => this.setState(prevState => { return {sortAsc: !prevState.sortAsc} })} /></div>
          <ul>{ moves }</ul>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        winningLine: lines[i]
      };
    }
  }
  return null;
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
