import React, { useState } from 'react';

export default function Instruction(props) {
    const { setIsInstruction } = props;

    function handleUnderstand() {
        setIsInstruction(false);
        window.sessionStorage.setItem('understand', 'true');
    }

    const sendInvite = () => {
        if (!navigator.share) return;
    
        navigator.share({
          url: `/`,
          title: "Invitation: Play Connect 4",
          text: "Come and play some Connect Four with me!"
        })
      }

    return (
        <div className='GameBlock'>
            <div>
                <div>
                    <h1 className='Main_header' style={{textDecoration: 'underline'}}>Instruction</h1>
                    <p style={{fontSize: '2em', color: 'black', padding: '0 1em'}}>This is multiplayer only. </p>
                    <p style={{fontSize: '2em', color: 'black', padding: '0 1em'}}>Please open a <a href="/" target={'_blank'}>new tab</a> to use as a second player or <a href='#' onClick={()=> sendInvite()}>invite a friend!</a></p>
                    <p style={{fontSize: '2em', color: 'black', padding: '0 1em'}}>And try not to refresh the page.</p>
                </div>
                <div>
                    <button onClick={()=> handleUnderstand()} className="button-53" 
                    style={{margin:'auto', marginBottom: '2em'}}>I UNDERSTAND</button>
                </div>
            </div>
        </div>
    )
}
