
import './App.css';
import React, { useState, useEffect } from 'react';
import io from "socket.io-client";
const SERVER = process.env.REACT_APP_SOCKET_SERVER;
const socket = io(SERVER);
function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastPong, setLastPong] = useState(null);
  const [text, setText] = useState('');
  const [receivedText, setReceivedText] = useState([]);
  const datas = [];

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('pong', () => {
      setLastPong(new Date().toISOString());
    });
    socket.on('received-msg', (data) => {
      datas.push(data)
      console.log(datas)
      setReceivedText([data])
    });
    socket.on('connected', (data) => {
      console.log(data)
    })

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('pong');
    };
  }, []);

  const sendPing = () => {
    socket.emit('ping');
  }
  const sendMsg = () => {
    socket.emit('sending-msg', text);
    setText('')
  }
  function handleChange(e) {
    setText(e.target.value);
  }


  return (
    <div>
      <p>Connected: { '' + isConnected }</p>
      <p>Last pong: { lastPong || '-' }</p>
      {receivedText.map((item => {
        return (
        <h1>{item}</h1>
        )
      }))}
      
      <input type="text" value={text} onChange={handleChange}></input>
      <button onClick={ sendMsg }>Send Msg</button>
  </div>
  );
}

export default App;
