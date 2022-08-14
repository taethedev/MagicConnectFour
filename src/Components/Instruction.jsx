import React, { useState } from 'react';

export default function Instruction(props) {
    const { setIsInstruction } = props;

    function handleUnderstand() {
        setIsInstruction(false);
        window.sessionStorage.setItem('understand', 'true');
    }

    return (
        <div className='GameBlock'>
            <div>
                <div>
                    <h1 className='Main_header' style={{textDecoration: 'underline'}}>Instruction</h1>
                    <p style={{fontSize: '2em', color: 'var(--main-p1)'}}>This is multiplayer only. </p>
                    <p style={{fontSize: '2em', color: 'var(--main-p1)'}}>Please open a <a href="/" target={'_blank'}>new tab</a> to use as a second player.</p>
                </div>
                <div>
                    <button onClick={()=> handleUnderstand()} className="button-53" style={{margin:'auto', marginBottom: '2em'}}>I UNDERSTAND</button>
                </div>
            </div>
        </div>
    )
}
