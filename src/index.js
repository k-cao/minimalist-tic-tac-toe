import React, { Component } from "react";
import ReactDOM from 'react-dom/client';
import './index.css';

const indexOfAll = (arr, val) => arr.reduce((acc, el, i) => (el === val ? [...acc, i] : acc), []);

const AIModes = {
    Easy: "Easy",
    Medium: "Medium",
    Hard: "Hard",
    Impossible: "Impossible",
}

const AIModeGuessChance = {
    Medium: 0.15,
    Hard: 0.03,
}

const Player = {
    AI: "O",
    User: "X",
}

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

function score(outcome, depth) {
    if (outcome === Player.AI) return 10 - depth;
    if (outcome && outcome !== "Draw") return depth - 10;

    return 0;
}

function minmax(squares, player, mode, useDepth, depth = 0) {
    const outcome = calculateWinner(squares)
    if (outcome) {
        if (useDepth) return { choice: null, curScore: score(outcome, depth) };
        return { choice: null, curScore: score(outcome, 0) };
    }

    depth += 1

    let scores = [], moves = [];
    const nullIndices = indexOfAll(squares, null);
    for (let i = 0; i < nullIndices.length; i++) {
        const index = nullIndices[i];
        const nextGameState = squares.slice();
        nextGameState[index] = player;

        const { curScore } = minmax(nextGameState, player === 'X' ? 'O' : 'X', mode, useDepth, depth);
        scores.push(curScore);
        moves.push(index);
    }

    let choice, curScore, doGuess = false;

    if (mode in AIModeGuessChance) {
        const guessChance = AIModeGuessChance[mode];
        doGuess = Math.random() < (guessChance + 0.01 * depth);
    }

    if (doGuess) {
        const guessIndex = Math.floor(Math.random() * scores.length);
        choice = moves[guessIndex];
        curScore = scores[guessIndex];
    } else {
        if (player === Player.AI) {
            const maxScoreIndex = scores.indexOf(Math.max(...scores));
            choice = moves[maxScoreIndex];
            curScore = scores[maxScoreIndex];
        } else {
            const minScoreIndex = scores.indexOf(Math.min(...scores));
            choice = moves[minScoreIndex];
            curScore = scores[minScoreIndex];
        }
    }

    return { choice, curScore };
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
            mode: AIModes.Easy,
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNum + 1);
        const current = history[history.length - 1];

        const copySquares = current.squares.slice();
        if (calculateWinner(copySquares) || copySquares[i]) return;

        copySquares[i] = this.state.xIsNext ? 'X' : 'O';
        const nextPlayer = !this.state.xIsNext ? 'X' : 'O';

        if (this.state.mode === AIModes.Easy) {
            const nullIndices = indexOfAll(copySquares, null);
            const randomNullIndex = nullIndices[Math.floor(Math.random() * nullIndices.length)];

            copySquares[randomNullIndex] = nextPlayer;
        } else if (this.state.mode === AIModes.Medium || this.state.mode === AIModes.Hard) {
            const { choice } = minmax(copySquares, nextPlayer, this.state.mode, false)
            copySquares[choice] = nextPlayer;
        } else if (this.state.mode === AIModes.Impossible) {
            const { choice } = minmax(copySquares, nextPlayer, this.state.mode, true, 0)
            copySquares[choice] = nextPlayer;
        }

        this.setState({
            history: history.concat([{ squares: copySquares }]),
            xIsNext: (this.state.mode === "2 Players") ? !this.state.xIsNext : this.state.xIsNext,
            stepNum: history.length
        });
    }

    jumpTo(step) {
        this.setState({
            xIsNext: (this.state.mode === "2 Players") ? (step % 2) === 0 : true,
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

    restartGame() {
        this.setState({
            history: [{ squares: Array(9).fill(null) }],
            xIsNext: true,
            stepNum: 0,
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNum];

        const winner = calculateWinner(current.squares);
        let status, restart = false;
        if (winner === "Draw") {
            status = winner;
            restart = true;
        } else if (winner) {
            status = 'Winner: ' + winner;
            restart = true;
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        const moves = history.map((_, stepNum) => {
            const desc = stepNum ? 'Step ' + stepNum : 'Game Start';
            return (
                <li key={stepNum}>
                    <button className="gameBtn" onClick={() => this.jumpTo(stepNum)}>{desc}</button>
                </li>
            )
        });

        return (
            <div>
                <header>
                    <div onChange={(event) => this.onModeChange(event)}>
                        <input type="radio" value={AIModes.Easy} name="mode" defaultChecked /> Easy
                        <input type="radio" value={AIModes.Medium} name="mode" /> Medium
                        <input type="radio" value={AIModes.Hard} name="mode" /> Hard
                        <input type="radio" value={AIModes.Impossible} name="mode" /> Impossible
                        <input type="radio" value="2 Players" name="mode" /> 2 Players
                    </div>
                </header>
                <main>
                    <div className="game">
                        <div>
                            {status}
                            {restart && 
                                <div>
                                    <button className="gameBtn" onClick={() => this.restartGame()}>RESTART</button>
                                </div>}
                        </div>
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
