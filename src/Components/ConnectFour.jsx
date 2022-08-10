/**
 * Tae Jung
 * Modified component from: https://codesandbox.io/s/connect-four-game-with-react-hix97
 */

import React, { useState, useEffect, useRef } from "react";
import "./connectFour.css";

const boardSettings = {
  rows: 8,
  columns: 10,
  dropAnimationRate: 50,
  flashAnimationRate: 600,
  colors: {
    empty: "#FFFFFF",
    p1: "#4b31ec",
    p2: "lightcoral"
  }
};

const winTypes = {
  vertical: 0,
  horizontal: 1,
  forwardsDiagonal: 2,
  backwardsDiagonal: 3
};

export default function ConnectFour(props) {
  const [board, setBoard] = useState(createBoard());
  const [win, setWin] = useState(null);
  const [flashTimer, setFlashTimer] = useState(null);
  const [dropping, setDropping] = useState(false);
  const [readyCount, setReadyCount] = useState(0);
  const domBoard = useRef(null);

  const {playerTurn, setPlayerTurn, isFirst, socket, roomNumber, isMyTurn} = props;
 

  // Disable buttons if not my turn
    useEffect(()=> {
        const dropButtons = document.querySelectorAll(".drop-button");
        if (!isMyTurn()) {
            dropButtons.forEach((el)=> {
                el.setAttribute('disabled', '')
            })
        }else {
            dropButtons.forEach((el)=> {
                el.removeAttribute('disabled');
            })
        }
    },[isMyTurn()])

    useEffect(() => {
        socket.on('receive-handle-drop', (param, currentPlayer, nextPlayer) => {
            handleDrop(param, currentPlayer);
            setPlayerTurn(nextPlayer);
        })
    
    
        return () => {
          socket.off('receive-handle-drop');
        };
      }, [board]);

    // socket.on('receive-handle-drop', (param, currentPlayer, nextPlayer) => {
    //     handleDrop(param, currentPlayer);
    //     setPlayerTurn(nextPlayer);
    //     console.log("in here")
    // })
    socket.on('restarting-game' ,(winner) => {
        restartGame(winner)
    })

  function getPlayerColor(player) {
    return player == 1 ? boardSettings.colors.p1 : boardSettings.colors.p2;
  }

  function getIndex(row, column) {
    const index = row * boardSettings.columns + column;
    if (index > boardSettings.rows * boardSettings.colums) return null;
    return index;
  }
  function getRowAndColumn(index) {
    if (index > boardSettings.rows * boardSettings.colums) return null;
    const row = Math.floor(index / boardSettings.columns);
    const column = Math.floor(index % boardSettings.columns);
    return {
      row,
      column
    };
  }

  function createBoard() {
    return new Array(boardSettings.rows * boardSettings.columns).fill(
      boardSettings.colors.empty
    );
  }

  function restartGame(winner) {
    setPlayerTurn(winner == 1 ? 2 : 1)
    setWin(null);
    setBoard(createBoard());
  }
  function sendRestartGame() {
    let winner = win.winner === boardSettings.colors.p1 ? 1 : 2
    socket.emit('restart-game', winner, roomNumber);
  }

  function getDomBoardCell(index) {
    if (!domBoard.current) return;
    const board = domBoard.current;
    const blocks = board.querySelectorAll(".board-block");
    return blocks[index];
  }

  function findFirstEmptyRow(column) {
    let { empty } = boardSettings.colors;
    let { rows } = boardSettings;
    for (let i = 0; i < rows; i++) {
      if (board[getIndex(i, column)] !== empty) {
        return i - 1;
      }
    }
    return rows - 1;
  }

  async function handleDrop(column, currentPlayer) {
    if (dropping || win) return;
    const row = findFirstEmptyRow(column);
    let playerColor = getPlayerColor(currentPlayer);
    if (row < 0) return;
    setDropping(true);
    await animateDrop(row, column, playerColor);
    setDropping(false);
    const newBoard = board.slice();
    newBoard[getIndex(row, column)] = playerColor;
    setBoard(newBoard);
  }
  function sendHandleDrop(column) {
    console.log("send-handle-drop")
    socket.emit('send-handle-drop', column, roomNumber, playerTurn);
  }

  async function animateDrop(row, column, color, currentRow) {
    if (currentRow === undefined) {
      currentRow = 0;
    }
    return new Promise(resolve => {
      if (currentRow > row) {
        return resolve();
      }
      if (currentRow > 0) {
        let c = getDomBoardCell(getIndex(currentRow - 1, column));
        let bg = c.style.backgroundColor;
        c.style.backgroundColor = boardSettings.colors.empty;
      }
      let c = getDomBoardCell(getIndex(currentRow, column));
      c.style.backgroundColor = color;
      setTimeout(
        () => resolve(animateDrop(row, column, color, ++currentRow)),
        boardSettings.dropAnimationRate
      );
    });
  }

  /**
   * End game animation.
   */
  useEffect(() => {
    if (!win) {
      return;
    }

    function flashWinningCells(on) {
      const { empty } = boardSettings.colors;
      const { winner } = win;
      for (let o of win.winningCells) {
        let c = getDomBoardCell(getIndex(o.row, o.column));
        c.style.backgroundColor = on ? winner : empty;
      }
      setFlashTimer(
        setTimeout(
          () => flashWinningCells(!on),
          boardSettings.flashAnimationRate
        )
      );
    }

    flashWinningCells(false);
  }, [win, setFlashTimer]);

  /**
   * Clears the end game animation timeout when game is restarted.
   */
  useEffect(() => {
    if (!win) {
      if (flashTimer) clearTimeout(flashTimer);
    }
  }, [win, flashTimer]);

  /**
   * Check for win when the board changes.
   */
  useEffect(() => {
    if (dropping || win) return;

    function isWin() {
      return (
        isForwardsDiagonalWin() ||
        isBackwardsDiagonalWin() ||
        isHorizontalWin() ||
        isVerticalWin() ||
        null
      );
    }

    function createWinState(start, winType) {
      const win = {
        winner: board[start],
        winningCells: []
      };

      let pos = getRowAndColumn(start);

      while (true) {
        let current = board[getIndex(pos.row, pos.column)];
        if (current === win.winner) {
          win.winningCells.push({ ...pos });
          if (winType === winTypes.horizontal) {
            pos.column++;
          } else if (winType === winTypes.vertical) {
            pos.row++;
          } else if (winType === winTypes.backwardsDiagonal) {
            pos.row++;
            pos.column++;
          } else if (winType === winTypes.forwardsDiagonal) {
            pos.row++;
            pos.column--;
          }
        } else {
          return win;
        }
      }
    }
    function isHorizontalWin() {
      const { rows } = boardSettings;
      const { columns } = boardSettings;
      const { empty } = boardSettings.colors;
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column <= columns - 4; column++) {
          let start = getIndex(row, column);
          if (board[start] === empty) continue;
          let counter = 1;
          for (let k = column + 1; k < column + 4; k++) {
            if (board[getIndex(row, k)] === board[start]) {
              counter++;
              if (counter === 4)
                return createWinState(start, winTypes.horizontal);
            }
          }
        }
      }
    }
    function isVerticalWin() {
      const { rows } = boardSettings;
      const { columns } = boardSettings;
      const { empty } = boardSettings.colors;
      for (let column = 0; column < columns; column++) {
        for (let row = 0; row <= rows - 4; row++) {
          let start = getIndex(row, column);
          if (board[start] === empty) continue;
          let counter = 1;
          for (let k = row + 1; k < row + 4; k++) {
            if (board[getIndex(k, column)] === board[start]) {
              counter++;
              if (counter === 4)
                return createWinState(start, winTypes.vertical);
            }
          }
        }
      }
    }
    function isBackwardsDiagonalWin() {
      const { rows } = boardSettings;
      const { columns } = boardSettings;
      const { empty } = boardSettings.colors;
      for (let row = 0; row <= rows - 4; row++) {
        for (let column = 0; column <= columns - 4; column++) {
          let start = getIndex(row, column);
          if (board[start] === empty) continue;
          let counter = 1;
          for (let i = 1; i < 4; i++) {
            if (board[getIndex(row + i, column + i)] === board[start]) {
              counter++;
              if (counter === 4)
                return createWinState(start, winTypes.backwardsDiagonal);
            }
          }
        }
      }
    }
    function isForwardsDiagonalWin() {
      const { rows } = boardSettings;
      const { columns } = boardSettings;
      const { empty } = boardSettings.colors;
      for (let row = 0; row <= rows - 4; row++) {
        for (let column = 3; column <= columns; column++) {
          let start = getIndex(row, column);
          if (board[start] === empty) continue;
          let counter = 1;
          for (let i = 1; i < 4; i++) {
            if (board[getIndex(row + i, column - i)] === board[start]) {
              counter++;
              if (counter === 4)
                return createWinState(start, winTypes.forwardsDiagonal);
            }
          }
        }
      }
    }
    setWin(isWin());
  }, [board, dropping, win]);

  function createDropButtons() {
    const btns = [];
    for (let i = 0; i < boardSettings.columns; i++) {
      btns.push(
        <button
          key={i}
          className="cell drop-button"
          onClick={() => sendHandleDrop(i)}
          style={{
            backgroundColor: getPlayerColor(playerTurn)
          }}
        />
      );
    }
    return btns;
  }

  const cells = board.map((c, i) => (
    <div className="board-block-wrapper">
        <button
            key={"c" + i}
            className="cell board-block"
            style={{
                backgroundColor: c
            }}
        />
    </div>
  ));

  function getGridTemplateColumns() {
    let gridTemplateColumns = "";
    for (let i = 0; i < boardSettings.columns; i++) {
      gridTemplateColumns += "auto ";
    }
    return gridTemplateColumns;
  }

  return (
    <>
      <div
        className={`board ${
            playerTurn == 1 ? "p1-turn" : "p2-turn"
        } `}
        ref={domBoard}
        style={{
          gridTemplateColumns: getGridTemplateColumns()
        }}
      >
        {createDropButtons()}
        {cells}
      </div>
      {win && (
        <>
          <h1 style={{ color: win.winner }}>
            {" "}
            {win.winner === boardSettings.colors.p1
              ? "Player 1"
              : "Player 2"}{" "}
            WON!
          </h1>
          <button onClick={sendRestartGame}>Play Again</button>
          <br />
          <br />
        </>
      )}
    </>
  );
}
