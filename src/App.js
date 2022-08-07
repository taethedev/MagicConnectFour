
import './App.css';
import React, { useState, useEffect } from 'react';
import io from "socket.io-client";
import MainMenu from './Components/MainMenu';
import GameBoard from './Components/GameBoard';
const SERVER = process.env.REACT_APP_SOCKET_SERVER;
const socket = io(SERVER);

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);

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


    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  const joinRoom = (room) => {
    console.log(`Joining Room: '${room}'`)
    socket.emit('join-room', room, (cb) => {
      let { msg, isHost } = cb;
      if (msg === 'success') {
        if (isHost) {
          setData({ ...data, isHost: true, roomNumber: room });
        } else {
          setData({...data, roomNumber: room});
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
      <div className='App__container'>
        <h1 style={{color: 'lightcoral'}}>Magic Connect Four</h1>
        <div className='top-status'>
          {isConnected && <span>Connected</span> }
          {!isConnected && <span>Disconnected</span> }
          {data.roomNumber && <span>Player: {data.isHost ? '1' : '2'}</span> }
          {data.roomNumber && <span>Room: {data.roomNumber}</span> }
        </div>
        { !data.roomNumber && <MainMenu joinRoom={joinRoom} isConnected={isConnected} isRoomFull={data.roomFull} resetRoomFull={resetRoomFull} /> }
        { data.roomNumber && isConnected && <GameBoard socket={socket} isHost={data.isHost} roomNumber={data.roomNumber} /> }
      </div>
    </div>
  );
}

export default App;
