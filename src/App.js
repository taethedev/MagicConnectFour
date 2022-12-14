
import './App.css';
import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import io from "socket.io-client";
import MainMenu from './Components/MainMenu';
import GameBoard from './Components/GameBoard';
import Instruction from './Components/Instruction';
import logo from './assets/images/logo_white.png'
const SERVER = process.env.REACT_APP_SOCKET_SERVER || 'http://localhost:8080';
const socket = io(SERVER);

const str = window.location.search;
const urlParam = new URLSearchParams(str);
const room = urlParam.get('room');

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isInstruction, setIsInstruction] = useState(true);
  const [maxPlayer, setMaxplayer] = useState(2);
  const [playerCount, setPlayerCount] = useState(1);

  const [data, setData] = useState({
    name: '',
    roomNumber: '',
    roomFull: false,
    isHost: false,
  })

  useEffect(() => {
    
    socket.on('connect', () => {
      setIsConnected(true);
    });
    
    socket.on('disconnect', () => {
      setIsConnected(false);
    });
    
    socket.on('player-joined', datas => {
      setPlayerCount(datas.playerCount);
      playerNotification('Player Joined')
    })
    
    socket.on('player-left', data => {
      setPlayerCount(data.playerCount);
      playerNotification('Player Left')

      setTimeout(()=> {
        window.location = window.location.origin;
      }, 1500)
    })
    if (window.sessionStorage.getItem('understand') === 'true') setIsInstruction(false);
    if (room) joinRoom(room);
    
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('player-joined');
    };
  }, []);

  socket.on('player-joined', datas => {
    // if (!data.isHost) setData({ ...data, isHost: true});
  })
  
  const playerNotification = (msg) => toast.info(msg, {
    position: "bottom-center",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });

  const joinRoom = (room) => {
    console.log(`Joining Room: '${room}'`)
    socket.emit('join-room', room, (cb) => {
      let { msg, isHost, playerCount } = cb;
      if (msg === 'success') {
        if (isHost) {
          setData({ ...data, isHost: true, roomNumber: room });
          setPlayerCount(playerCount);
        } else {
          setData({...data, roomNumber: room});
          setPlayerCount(playerCount);
        }
      }
      else if (msg === 'full') {
        setData({...data, roomFull: true});
      }
    });
  }
  const resetRoomFull = () => {
    setData({...data, roomFull: false});
  }

  return (
    <div className='App'>
      <ToastContainer />
      <div className='App__container'>
        <div className='App__top'>
          <div className='App__logo'></div>
          <h1 style={{color: 'var(--main-color2)'}}><span style={{color: 'var(--main-p2)'}}>Magic</span> <span style={{color: 'black'}}>Connect</span> <span style={{color: 'var(--main-p1)'}}>Four</span></h1>
          <span>by <a style={{textDecoration: 'none'}} href="https://github.com/taethedev" target="_blank" rel="noreferrer">taeTheDev.</a></span>
          <div className='top-status'>
            {isConnected && <span>Connected</span> }
            {!isConnected && <span>Disconnected</span> }
            {data.roomNumber && <span>Player: {data.isHost ? '1' : '2'}</span> }
            {data.roomNumber && <span>Room({playerCount}/{maxPlayer}): {data.roomNumber}</span> }
          </div>
        </div>
        { isInstruction && !data.roomNumber && <Instruction setIsInstruction={setIsInstruction} /> }
        { !isInstruction && !data.roomNumber && <MainMenu joinRoom={joinRoom} isConnected={isConnected} isRoomFull={data.roomFull} resetRoomFull={resetRoomFull} /> }
        { data.roomNumber && isConnected && <GameBoard socket={socket} isHost={data.isHost} roomNumber={data.roomNumber} /> }
      </div>
    </div>
  );
}

export default App;
