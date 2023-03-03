import React, {useContext, useEffect, useState} from 'react'
import { ChatContext } from '../context/ChatContext';
import { baseUrl, getRequest } from '../utils/services';

function useFetchLatestMessage(chat) {

    const {newMessage, notification } = useContext(ChatContext)
    const [latestMessage, setLatestMessage] = useState(null);

    useEffect(() => {
        const getMessages = async () => {

            const response = await getRequest(`${baseUrl}/messages/${chat?._id}`);

            if(response.error){
                return console.log("error getting message ", error)
            }
            
            const LastMessage = response[response?.length - 1 ]
            setLatestMessage(LastMessage);
        }

        getMessages();
    },[newMessage, notification])
    
  return {latestMessage}
}

export default useFetchLatestMessage