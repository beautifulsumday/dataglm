import { axios } from "./axios";

const ChatServer = {
    query: async (data, setValue) => {
        return await axios({
            url: "http://127.0.0.1:60006/api/stream/run",
            // url: "/api/stream/interpreter",
            method: "post",
            data: data,
            responseType: "stream",
            onDownloadProgress: function (progressEvent) {
                const xhr = progressEvent.target;
                const { responseText } = xhr;
                setValue(responseText);
            },
        })
    },
    stop: async () => {
        return await axios({
            url: "http://127.0.0.1:60006/api/stop",
            method: "get",
        })
    },
    clearCookie: async () => {
        return await axios({
            url: "http://127.0.0.1:60006/api/clear",
            method: "get",
        })
    },
    upload: async (data) => {
        return await  axios({
            url: "http://127.0.0.1:60006/api/upload",
            data: data,
            method: "post",
        })
    }

};
  
  export default ChatServer;
