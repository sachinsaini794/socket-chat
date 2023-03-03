import React, { createContext, useCallback, useEffect, useState } from "react";
import { baseUrl, postRequest, getRequest } from "../utils/services";
import { io } from "socket.io-client";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children, user }) => {
  const [userChats, setUserChats] = useState(null);
  const [isUserChatLoading, setIsUserChatLoading] = useState(false);
  const [userChatsErr, setUserChatsErr] = useState(null);
  const [potentialChats, setPotentialChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState(null);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [messagesErr, setMessagesErr] = useState(null);
  const [sendTextMessagesErr, setSendTextMessagesErr] = useState(null);
  const [newMessage, setNewMessage] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notification, setNotification] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // console.log("notification ", notification);
  // console.log("currentChat ", currentChat);

  // initial socket
  useEffect(() => {
    const newSocket = io("http://127.0.0.1:3000");
    setSocket(newSocket);

    newSocket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // add online users
  useEffect(() => {
    if (socket === null) return;
    socket.emit("addNewUser", user?._id);
    socket.on("getOnlineUsers", (res) => {
      setOnlineUsers(res);
    });

    return () => {
      socket.off("getOnlineUsers");
    };
  }, [socket]);

  // send message
  useEffect(() => {
    if (socket === null) return;

    const recipientId = currentChat?.members.find((id) => id !== user?._id);

    socket.emit("sendMessage", { ...newMessage, recipientId });
  }, [newMessage]);

  // received message and notification
  useEffect(() => {
    if (socket === null) return;

    socket.on("getMessage", (res) => {
      if (currentChat?._id !== res.chatId) return;

      setMessages((pre) => [...pre, res]);
    });

    socket.on("getNotification", (res) => {
      console.log("currentChat ", currentChat?.members);
      const isChatOpen = currentChat?.members.some((id) => id == res.senderId);

      console.log("isChatOpen ", isChatOpen);

      if (isChatOpen) {
        setNotification((pre) => [{ ...res, isRead: true }, ...pre]);
      } else {
        setNotification((pre) => [res, ...pre]);
      }
    });

    return () => {
      socket.off("getMessage");
      socket.off("getNotification");
    };
  }, [socket, currentChat]);

  // get all users
  useEffect(() => {
    const getUsers = async () => {
      const response = await getRequest(`${baseUrl}/users`);

      if (response.error) {
        return console.log("Error fetching users", response);
      }

      const pChats = response.filter((fit) => {
        let isChatCreated = false;

        if (user?._id === fit?._id) return false;

        if (userChats) {
          isChatCreated = userChats?.some((chat) => {
            return chat.members[0] === fit._id || chat.members[1] === fit._id;
          });
        }

        return !isChatCreated;
      });

      setPotentialChats(pChats);
      setAllUsers(response);
    };

    getUsers();
  }, [userChats]);

  // get all chat from the user id
  useEffect(() => {
    const getUserChats = async () => {
      setIsUserChatLoading(true);
      setUserChatsErr(null);

      if (user?._id) {
        const response = await getRequest(`${baseUrl}/chats/${user?._id}`);
        setIsUserChatLoading(false);

        if (response.error) {
          return setUserChatsErr(response);
        }

        setUserChats(response);
      }
    };

    getUserChats();
  }, [user, notification]);

  // get all messages
  useEffect(() => {
    const getMessages = async () => {
      setIsMessagesLoading(true);
      setMessagesErr(null);
      const response = await getRequest(
        `${baseUrl}/messages/${currentChat?._id}`
      );
      setIsMessagesLoading(false);

      if (response.error) {
        return setMessagesErr(response);
      }

      setMessages(response);
    };

    getMessages();
  }, [currentChat]);

  const updateCurrentChat = useCallback((chat) => {
    setCurrentChat(chat);
  }, []);

  const createChat = useCallback(async (firstId, secondId) => {
    const response = await postRequest(
      `${baseUrl}/chats`,
      JSON.stringify({
        firstId,
        secondId,
      })
    );

    if (response.error) {
      return console.log("Error createChat ", response);
    }

    setUserChats((pre) => [...pre, response]);
  }, []);

  const sendTextMessage = useCallback(
    async (textMessage, sender, currentChatId, setTextMessage) => {
      if (!textMessage) return console.log("You must type something");

      const response = await postRequest(
        `${baseUrl}/messages`,
        JSON.stringify({
          chatId: currentChatId,
          senderId: sender._id,
          text: textMessage,
        })
      );

      if (response.error) {
        console.log(response);
        return setSendTextMessagesErr(response);
      }

      setNewMessage(response);
      setMessages((pre) => [...pre, response]);
      setTextMessage("");
    },
    []
  );

  const markAllNotificationsAndRead = useCallback((notifications) => {
    const mNotifications = notifications.map((n) => {
      return { ...n, isRead: true };
    });

    setNotification(mNotifications);
  }, []);

  const markNotificationsRead = useCallback(
    (n, userChats, user, notifications) => {
      // find chat to open

      const desiredChat = userChats.find((chat) => {
        const chatMembers = [user._id, n.senderId];
        const isDesiredChat = chat?.members.every((member) => {
          return chatMembers.includes(member);
        });

        return isDesiredChat;
      });

      // mark notification read
      const mNotifications = notifications.map((el) => {
        if (n.senderId === el.senderId) {
          return { ...n, isRead: true };
        } else {
          return el;
        }
      });

      updateCurrentChat(desiredChat);
      setNotification(mNotifications);
    },
    []
  );

  const markThisUserNotificationAsRead = useCallback(
    (thisUserNotification, notifications) => {
      // mark notification as read

      const mNotifications = notifications.map((el) => {
        let notification;

        thisUserNotification.forEach((n) => {
          if (n.secondId === el.secondId) {
            notification = { ...n, isRead: true };
          } else {
            notification = el;
          }
        });

        return notification;
      });

      setNotification(mNotifications);
    },
    []
  );

  return (
    <ChatContext.Provider
      value={{
        currentChat,
        messages,
        isMessagesLoading,
        messagesErr,
        userChats,
        isUserChatLoading,
        userChatsErr,
        potentialChats,
        createChat,
        updateCurrentChat,
        sendTextMessage,
        onlineUsers,
        notification,
        allUsers,
        markAllNotificationsAndRead,
        markNotificationsRead,
        markThisUserNotificationAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
