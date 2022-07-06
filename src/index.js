import React, { Component } from "react";
import ReactDOM from 'react-dom/client';
import './index.css';

const indexOfAll = (arr, val) => arr.reduce((acc, el, i) => (el === val ? [...acc, i] : acc), []);

function Square(props) {
    return (
        <button className="square" onClick={props.onClick}>
            {props.value}
        </button>
    );
}

function calculateWinner(squares) {
    const winningLines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ]

    for (let i = 0; i < winningLines.length; i++) {
        const [a, b, c] = winningLines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a]
        }
    }

    if (squares.some((elem) => elem === null)) {
        return null;
    }

    return "Draw";
}

class Board extends Component {
    renderSquare(i) {
        return <Square value={this.props.squares[i]} onClick={() => this.props.onClick(i)} />;
    }

    render() {
        return (
            <div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

class Game extends Component {
    constructor(props) {
        super(props);

        this.state = {
            history: [{ squares: Array(9).fill(null) }],
            xIsNext: true,
            stepNum: 0,
            mode: '2 Players'
        }
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNum + 1);
        const current = history[history.length - 1];

        const copySquares = current.squares.slice();
        if (calculateWinner(copySquares) || copySquares[i]) return;

        copySquares[i] = this.state.xIsNext ? 'X' : 'O';
        let xIsNextCur = !this.state.xIsNext;

        if (this.state.mode === "AI") {
            const nullIndices = indexOfAll(copySquares, null);
            const randomNullIndex = nullIndices[Math.floor(Math.random() * nullIndices.length)];

            copySquares[randomNullIndex] = xIsNextCur ? 'X' : 'O';
            xIsNextCur = !xIsNextCur;
        }

        this.setState({
            history: history.concat([{ squares: copySquares }]),
            xIsNext: xIsNextCur,
            stepNum: history.length
        });
    }

    jumpTo(step) {
        this.setState({
            xIsNext: (this.state.mode === "AI") ? true : (step % 2) === 0,
            stepNum: step
        });
    }

    onModeChange(event) {
        this.setState({
            history: [{ squares: Array(9).fill(null) }],
            xIsNext: true,
            stepNum: 0,
            mode: event.target.value
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNum];

        const winner = calculateWinner(current.squares);
        let status;
        if (winner === "Draw") {
            status = winner;
        } else if (winner) {
            status = 'Winner: ' + winner;
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        const moves = history.map((_, stepNum) => {
            const desc = stepNum ? 'Step #' + stepNum : 'Game Start';
            return (
                <li key={stepNum}>
                    <button className="stepBtn" onClick={() => this.jumpTo(stepNum)}>{desc}</button>
                </li>
            )
        });

        return (
            <div>
                <header>
                    <div onChange={(event) => this.onModeChange(event)}>
                        <input type="radio" value="2 Players" name="mode" defaultChecked /> 2 Players
                        <input type="radio" value="AI" name="mode" /> AI
                        <input type="radio" value="Medium" name="mode" /> Medium
                        <input type="radio" value="Impossible" name="mode" /> Impossible
                    </div>
                </header>
                <main>
                    <div className="game">
                        <div>{status}</div>
                        <div className="game-board">
                            <Board squares={current.squares} onClick={(i) => this.handleClick(i)} />
                        </div>
                    </div>
                </main>
                <footer>
                    {moves}
                </footer>
            </div>
        );
    }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);
