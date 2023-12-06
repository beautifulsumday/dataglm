import React, { useState, useRef, useEffect } from 'react';


import ChatServer from '@/services/chat-server';
import Message from './Message';
import Input_ from './Input_';

import "./Chat.less"


// MessageList 组件用于显示消息列表
const MessageList = ({ messages }) => {
  return (
    <div className="message-list">
      {messages.map((msg, index) => (
        <Message key={index} text={msg.text} isUser={msg.isUser} />
      ))}
    </div>
  );
};

// Chat 组件是聊天应用的主容器
const Chat = () => {
    const [input, setInput] = useState(''); // 输入框的文本状态
    const [messages, setMessages] = useState([]); // 保存消息记录的状态
    const [lastMessage, setLastMessage] = useState(''); // 最后一条消息
    const [lastMessageRole, setLastMessageRole] = useState('bot'); // 最后一条消息的角色
    const [fileURL, setFileURL] = useState(''); // 上传文件的URL

    const [loading, setLoading] = useState(false); // gpt模型正在运行
    const messageAreaRef = useRef(null); // 消息区域的引用

    // 每次浏览器刷新就清空cookie
    useEffect(() => {
        ChatServer.clearCookie();
    }, []);
  

  // 处理发送消息
  const sendMessage = () => {
    if (input.trim()) {
        setInput('');
        const querydata = {query: input.trim()}

        if (input.trim()=="clear") {
            setMessages([])
            setLoading(true)
            ChatServer.query(querydata, setLastMessage).then(() => {setLoading(false)});
            setLastMessage('')
        }else{
            const newMessage = { text: input, isUser: true };
            setMessages([...messages, { text: lastMessage, isUser: false }, newMessage]);
            setLastMessage('loading...')
            setLoading(true)
            setLastMessageRole('bot')
            ChatServer.query(querydata, setLastMessage).then(() => {setLoading(false)});

        }
    };
};

  // 处理输入框文本变化
  const handleInputChange = (e) => {
      setInput(e.target.value);
  };

  // 处理输入框按下Enter键发送消息
  const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
          sendMessage();
      }
  };

  const stopLoading = () => {
      ChatServer.stop();
  }

  useEffect(() => {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
  }, [lastMessage]);

  useEffect(() => {
      if (fileURL.length > 0){
          setMessages([...messages, { text: lastMessage, isUser: lastMessageRole==='user'}]);
          setLastMessage(`${fileURL} 文件已上传成功`)
          setLastMessageRole('user')
      }
  }, [fileURL]);

  const welcomeDiv = loading ? <div className='message-clear'> 后台正在清除聊天记录......</div> : 
      <div className='message-welcome'>欢迎使用DataGLM App</div>


  return (
    <div className="chat-app">
        <div style={{textAlign: "center"}}>
              <h1>DataGLM App</h1>
        </div>

        <div className='message-area' ref={messageAreaRef}>
            {
                messages.length === 0 ? welcomeDiv
                 : <>
                    <MessageList messages={messages} />
                    <Message text={lastMessage} isUser={lastMessageRole==='user'} />
                </>
            }
            
        </div>
      
        <div className="input-area">
          <Input_ 
              text={input}
              placeholder="请输入  (注: 输入clear清空聊天记录，开启新的对话)"
              onChage={handleInputChange}
              onKeyPress={handleKeyPress}
              sendMessage={sendMessage}
              stopLoading={stopLoading}
              loading={loading}
              setFileURL={setFileURL}
          />
        </div>
    </div>
  );
};

export default Chat;
