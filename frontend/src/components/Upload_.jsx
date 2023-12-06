import React, { useState} from 'react';
import { Upload, message } from 'antd';
import ChatServer from '@/services/chat-server';

import { LoadingOutlined, CloudUploadOutlined } from '@ant-design/icons';

export default function Upload_(props) {
    const {
        setURL
    } = props;

    const [loading, setLoading] = useState(false);

    const handleUpload = (options) => {
        const { onSuccess, onError, file } = options;
        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        // 发起上传请求
        ChatServer.upload(formData)
        .then(res => {
            setLoading(false);
            onSuccess(res.data, file);
            setURL(file.name)
        })
        .catch(err => {
            setLoading(false);
            onError(err);
        });
    };

    const beforeUpload = (file) => {
        const isLt2M = file.size / 1024 / 1024 < 30;
        if (!isLt2M) {
            message.error('File must smaller than 30MB!');
        return false;
        }
        return true;
    };

    return (
        <Upload
            showUploadList={false}
            beforeUpload={beforeUpload}
            customRequest={handleUpload}
        >

            {loading ? <LoadingOutlined className='input-upload'/> : <CloudUploadOutlined className='input-upload'/>}
        </Upload>
    );
};

