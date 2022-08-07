import React, { useState } from 'react';
import Loading from './Loading';
import './mainMenu.css';

export default function MainMenu(props) {
    const { joinRoom, isConnected, isRoomFull, resetRoomFull } = props;
    const [roomName, setRoomName] = useState('')
    const [data, setData] = useState({
        isSent: false,
        roomNameMaxError: false,
        connectionFailed: false
    })
    // onChange Handlers
    const handleRoomName = (e) => {
        setRoomName(e.target.value);
        setData({ ...data, roomNameMaxError: false });
        resetRoomFull();
    }
    
    // Sent to parent to join room
    const handleJoinRoom = (e) => {
        let newName = roomName.trim();
        if (newName.length > 20) { // Check room name length
            setData({ ...data, roomNameMaxError: true })
        } 
        else if (newName) { // Check for blank room name
            if (!data.isSent) joinRoom(roomName);
            setData({ ...data, isSent: true });

            if (!isConnected) { // Wait for server
                setTimeout(()=>{
                    if (!isConnected) setData({ ...data, connectionFailed: true })
                }, 60000)
            }
        }
    }

    return (
        <div className='GameBlock'>
            <div>
                <div>
                    <h1>MainMenu</h1>
                </div>
                <div className='Main__form-container'>
                    <input type="text" value={roomName} onChange={handleRoomName} placeholder='Private Room Name' />
                    {data.roomNameMaxError && <p style={{color: 'red'}}>Room name is too long.</p> }
                    {isRoomFull && <p style={{color: 'red'}}>Room is full.</p> }
                    <button className='btn' onClick={handleJoinRoom}>Join</button>
                </div>
                {data.isSent && !isConnected && !data.connectionFailed && <Loading /> }
                {data.connectionFailed && <h1>Server is currently down. Please try again later.</h1>}
            </div>
        </div>
    )
}
