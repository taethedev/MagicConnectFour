import React, { useState } from 'react'
import ConnectFour from './ConnectFour';
import './gameBoard.css'

export default function GameBoard(props) {
  const { socket, isHost, roomNumber } = props;

  const [data, setData] = useState({
    isFirst: false,
    isTurnChosen: false,
    isGameReady: false,
  })
  const [playerTurn, setPlayerTurn] = useState('')


  // Pre-Game
  socket.on('set-turn', (turn) => {
    console.log('setting turn')
    let myTurn = turn === 'first' ? 'first' : 'second';
    setData({...data, isFirst: myTurn, isTurnChosen: true, isGameReady: true});
    setPlayerTurn(turn === 'first' ? '2' : '1')
  })
  socket.on('game-ready', () => {
    console.log("ready")
    setData({...data, isGameReady: true });
  })
  // Game Data
  // socket.on('receive-text', (text, nextTurn) => {
  //   console.log("text received")
  //   let newArray = [...gameData.text, text];
  //   if (newArray.length >= 6) {
  //     newArray = newArray.slice(1, newArray.length);
  //   }
  //   setGameData({...gameData, turn: nextTurn, text: newArray });
  // })
  function handleSetPlayerTurn(turn) {
    console.log('Setting player turn to: ' + turn)
    setPlayerTurn(turn);
  }

  function chooseTurn (turn) {
    if (turn === 'first') {
      setData({...data, isFirst: true, isTurnChosen: true });
      setPlayerTurn('1');
      console.log('chose 1')
    }
    else {
      setData({...data, isFirst: false, isTurnChosen: true });
      setPlayerTurn('2')
      console.log('chose 2')
    }

    socket.emit('turn-chosen', turn);
  }
  function isMyTurn () {
    let myTurn = false;
    console.log(playerTurn);
    if (isHost && playerTurn == 1) {
      myTurn = true;
    } else if (!isHost && playerTurn == 2) {
      myTurn = true;
    }
    return myTurn;
  }
  // function sendText () {
  //   console.log('sending')
  //   socket.emit('send-message', {player: isHost ? 1 : 2, text: gameData.currentText}, roomNumber, gameData.turn == 1 ? 2 : 1);
  //   setGameData({...gameData, currentText: ''})
  // }
  // const handleTextChange = (e) => {
  //   setGameData({...gameData, currentText: e.target.value})
  // }

  const TurnCards = () => {
    return (
      <>
        <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className='turn-card' onClick={ ()=> chooseTurn('first') }>
            Go<br></br> First
          </div>
          <div className='turn-card' onClick={ ()=> chooseTurn('second') }>
            Go<br></br> Second
          </div>
        </div>
      </>
    )
  }

  const Header = () => {
    return (
      <div>
        <h2 style={{marginBottom: '0', marginTop: '1em'}}>Choices, Choices...</h2>
      </div>
    )
  }
  
  const WaitingHost = () => {
    return (
      <div style={{ marginTop: '15%' }}>
        <h1>Waiting for host to make a choice.</h1>
      </div>
    )
  }
  const WaitingPlayer = () => {
    return (
      <div style={{ marginTop: '15%' }}>
        <h1>Waiting for your archenemy.</h1>
      </div>
    )
  }
  // const listTexts = gameData.text.map((t, idx)=>{
  //   return <div style={{marginBottom: '5px', textAlign: 'left'}} key={idx}><b>Player {t.player}:</b> <span style={{color: 'darkcyan'}}>{t.text}</span></div>
  // })

  return (
    <div className='GameBlock'>
      { isHost && !data.isTurnChosen && data.isGameReady &&<>
        <Header />
        <TurnCards />
      </>
      }
      { !data.isGameReady && isHost && <WaitingPlayer /> }
      { !data.isTurnChosen && !isHost && <WaitingHost /> }
      { data.isGameReady && data.isTurnChosen && <div style={{ display:'flex', flexDirection: 'column', alignItems:'center' }}>
        <h1>{isMyTurn() ? 'My Turn!' : 'Opponents Turn'}</h1>

        <ConnectFour playerTurn={playerTurn} setPlayerTurn={handleSetPlayerTurn} isFirst={data.isFirst} socket={socket} roomNumber={roomNumber} isMyTurn={isMyTurn} />

      </div> }
    </div>
  )
}


