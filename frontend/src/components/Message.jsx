import React from 'react';
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import rehypeRaw from 'rehype-raw'; 
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {duotoneLight} from 'react-syntax-highlighter/dist/esm/styles/prism';

import {LoadingOutlined, SmileOutlined, UserOutlined} from '@ant-design/icons';

import "./Message.less";

const MarkDownComponents = {
    code({ node, inline, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '');
        return !inline && match ? (
            <SyntaxHighlighter
            children={String(children).replace(/\n$/, '')}
            style={duotoneLight} // theme
            language={match[1].toLowerCase()}
            PreTag="section" // parent tag
            {...props}
            />
        ) : (
            <code className={className} {...props}>
            {children}
            </code>
        );
    },
    img({ src, alt, ...h}) {
        src = src.substring(1)
        return <img src={src} alt={alt} />;
    }
  
  };


export default function Message(props) {
    const {
        text, 
        isUser
    } = props;

    return text.length === 0 ? null : (
        <>
            <div className="message-container">
                <div className="message-avatar">
                    {isUser ? 
                        <UserOutlined style={{ fontSize: '20px', color: '#08c' }}/> : 
                        <SmileOutlined style={{ fontSize: '18px', color: 'green' }}/>} 
                </div>
                <div className="message-right">
                    <div className="message-name">{isUser ? '我' : 'DataGLM'}</div>
                    <div className="message-content">
                        <ReactMarkdown
                            children={text}
                            rehypePlugins={[rehypeRaw]}
                            remarkPlugins={[gfm]}
                            components={MarkDownComponents}
                        />
                        {text==="loading..." ? <LoadingOutlined /> : null}
                    </div>
                </div>
                
            </div>
        </>
    )
}