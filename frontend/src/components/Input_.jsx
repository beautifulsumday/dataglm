import React from 'react';
import Upload_ from './Upload_';

import "./Input_.less"
import {UpSquareOutlined, PauseOutlined} from '@ant-design/icons';

export default function Input_(props) {
    const {
        text,
        placeholder,
        onChage,
        onKeyPress,
        sendMessage,
        stopLoading,
        loading,
        setFileURL,
    } = props;

    return (
        <>
            <div className='input-container'>
                <Upload_ setURL={setFileURL}/>
                <input
                    className='input-text'
                    type="text"
                    placeholder={placeholder}
                    value={text}
                    onChange={onChage}
                    onKeyPress={loading ? null : onKeyPress}
                />

                {loading ? <PauseOutlined 
                    className='input-button'
                    onClick={stopLoading}
                    style={{opacity: 0.2}}
                /> : <UpSquareOutlined  
                    className='input-button'
                    onClick={sendMessage}
                />}
                
            </div>
            
        </>
    )
}