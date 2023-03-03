import React from "react";
import { Stack } from "react-bootstrap";
import useFetchRecipient from "../../hooks/useFetchRecipient";
import avatar from "../../assets/undraw_avatar.svg";
import { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import { unreadNotificationsFun } from "../../utils/unreadNotification";
import useFetchLatestMessage from "../../hooks/useFetchLatestMessage";
import moment from "moment";

export default function UserChat({ chat, user }) {
  const { recipientUser } = useFetchRecipient(chat, user);
  const { onlineUsers, notification, markThisUserNotificationAsRead } =
    useContext(ChatContext);

  const unreadNotification = unreadNotificationsFun(notification);

  const thisUserNotification = unreadNotification?.filter(
    (n) => n.senderId === recipientUser?._id
  );

  const { latestMessage } = useFetchLatestMessage(chat);

  const TrueCateMessage = (text) => {
    let shortText = text?.substring(0, 20);

    if (text?.length > 20) {
      shortText = shortText + "...";
    }

    return shortText;
  };

  return (
    <Stack
      direction="horizontal"
      gap={3}
      className="user-card align-items-center p-2 justify-content-between"
      role="button"
      onClick={() => {
        if (thisUserNotification?.length !== 0) {
          markThisUserNotificationAsRead(thisUserNotification, notification);
        }
      }}
    >
      <div className="d-flex">
        <div className="me-2">
          <img src={avatar} height="35px" alt="avatar" />
        </div>
        <div className="text-content">
          <div className="name">{recipientUser?.name}</div>
          <div className="text">{TrueCateMessage(latestMessage?.text)}</div>
        </div>
      </div>
      <div className="d-flex flex-column align-items-end">
        <div className="date">
          {moment(latestMessage?.createdAt).calendar()}
        </div>
        <div
          className={
            thisUserNotification?.length > 0 ? "this-user-notifications" : ""
          }
        >
          {thisUserNotification?.length > 0 ? thisUserNotification?.length : ""}
        </div>
        <span
          className={
            onlineUsers.some((user) => user.userId === recipientUser?._id)
              ? "user-online"
              : " "
          }
        ></span>
      </div>
    </Stack>
  );
}
