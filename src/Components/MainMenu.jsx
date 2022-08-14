import React, { useState } from 'react';
import Loading from './Loading';
import './mainMenu.css';
import blackLogo from '../assets/images/logo_black.png'
import whiteLogo from '../assets/images/logo_white.png'

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
                    <div>
                        <span className='Main__small-logo' style={{backgroundColor: '#FF6B81'}}></span>
                        <span className='Main__small-logo' style={{backgroundColor: '#3DD1E7'}}></span>
                        <span className='Main__small-logo' style={{backgroundColor: '#FF6B81'}}></span>
                        <span className='Main__small-logo' style={{backgroundColor: '#3DD1E7'}}></span>
                    </div>
                    <h1 className='Main_header'>Welcome to Magic Connect 4</h1>
                </div>
                <div className='Main__form-container'>
                    <input className='form__input' autoFocus type="text" value={roomName} onChange={handleRoomName} placeholder='Private Room Name' />
                    {data.roomNameMaxError && <p style={{color: 'red'}}>Room name is too long.</p> }
                    {isRoomFull && <p style={{color: 'red'}}>Room is full.</p> }
                    {/* <button className='btn' onClick={handleJoinRoom}>Join</button> */}
                    <button className="btn button-53" role="button" onClick={handleJoinRoom}>Join</button>
                </div>
                {data.isSent && !isConnected && !data.connectionFailed && <Loading /> }
                {data.connectionFailed && <h1>Server is currently down. Please try again later.</h1>}
            </div>
        </div>
    )
}
