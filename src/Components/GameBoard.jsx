import React, { useEffect, useState } from 'react'
import ConnectFour from './ConnectFour';
import './gameBoard.css'
import one from '../assets/images/one.png'
import two from '../assets/images/two.png'

export default function GameBoard(props) {
  const { socket, isHost, roomNumber } = props;

  const [data, setData] = useState({
    isFirst: false,
    isTurnChosen: false,
    isGameReady: false,
  })
  const [playerTurn, setPlayerTurn] = useState('')

  useEffect(()=> {
      // Pre-Game
    socket.on('set-turn', (turn) => {
      // console.log('setting turn')
      let myTurn = turn === 'first' ? true: false;
      setData({...data, isFirst: myTurn, isTurnChosen: true, isGameReady: true});
      setPlayerTurn(turn === 'first' ? '2' : '1')
    })
    socket.on('game-ready', () => {
      // console.log("ready")
      setData({...data, isGameReady: true });
    })
    return () => {
      socket.off('set-turn');
      socket.off('game-ready');
    };
  },[])


  function handleSetPlayerTurn(turn) {
    // console.log('Setting player turn to: ' + turn)
    setPlayerTurn(turn);
  }

  function chooseTurn (turn) {
    if (turn === 'first') {
      setData({...data, isFirst: true, isTurnChosen: true });
      setPlayerTurn('1');
      // console.log('chose 1')
    }
    else {
      setData({...data, isFirst: false, isTurnChosen: true });
      setPlayerTurn('2')
      // console.log('chose 2')
    }

    socket.emit('turn-chosen', turn);
  }
  function isMyTurn () {
    let myTurn = false;
    // console.log(playerTurn);
    if (isHost && playerTurn == 1) {
      myTurn = true;
    } else if (!isHost && playerTurn == 2) {
      myTurn = true;
    }
    return myTurn;
  }

  const TurnCards = () => {
    return (
      <>
        <div className='Game__turn-card-container'>
          <div className='turn-card' onClick={ ()=> chooseTurn('first') }>
            <img src={one} alt='one'></img>
            <a hidden href="https://www.flaticon.com/free-icons/number" title="number icons">Number icons created by Freepik - Flaticon</a>
          </div>
          <div className='turn-card' onClick={ ()=> chooseTurn('second') }>
            <img src={two} alt='two'></img>
            <a hidden href="https://www.flaticon.com/free-icons/two" title="two icons">Two icons created by Freepik - Flaticon</a>
          </div>
        </div>
      </>
    )
  }

  const Header = () => {
    return (
      <div>
        <h2 style={{marginBottom: '0', marginTop: '1em', color: 'var(--main-color2)'}}>Go First? or Second?</h2>
      </div>
    )
  }
  
  const WaitingHost = () => {
    return (
      <div style={{ margin: '15% 0', color: 'var(--main-color2)' }}>
        <h1>Waiting for Host to Make a Choice...</h1>
      </div>
    )
  }
  const WaitingPlayer = () => {
    return (
      <div style={{ margin: '15% 0', color: 'var(--main-color2)' }}>
        <h1>Waiting For Your Archenemy...</h1>
        <h2><a style={{color: 'var(--main-color3)', textDecoration: 'underline', cursor:'pointer'}} onClick={()=> sendInvite()}>Send Invitation</a></h2>
        <h2>or</h2>
        <h2><a style={{color: 'var(--main-color3)', textDecoration: 'underline', cursor:'pointer'}} href={`/?room=`+roomNumber} target={'_blank'}>Play by Myself</a></h2>
      </div>
    )
  }

  const sendInvite = () => {
    if (!navigator.share) return;

    navigator.share({
      url: `/?room=${roomNumber}`,
      title: "Invitation: Play Connect 4",
      text: "Come and play some Connect Four with me!"
    })
  }

  return (
    <div className='GameBlock'>
      { isHost && !data.isTurnChosen && data.isGameReady &&
      <div className='Game__transition'>
        <Header />
        <TurnCards />
      </div>
      }
      { !data.isGameReady && isHost && <WaitingPlayer /> }
      { !data.isTurnChosen && !isHost && <WaitingHost /> }
      { data.isGameReady && data.isTurnChosen && 
      <div className='Game__transition' style={{ display:'flex', flexDirection: 'column', alignItems:'center', color:'var(--main-color2)' }}>
        <h1>{isMyTurn() ? 'My Turn!' : 'Opponents Turn'}</h1>

        <ConnectFour isHost={isHost} playerTurn={playerTurn} setPlayerTurn={handleSetPlayerTurn} isFirst={data.isFirst} socket={socket} roomNumber={roomNumber} isMyTurn={isMyTurn} />

      </div> }
    </div>
  )
}


