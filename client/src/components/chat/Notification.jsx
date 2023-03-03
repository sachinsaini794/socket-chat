import moment from "moment";
import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { unreadNotificationsFun } from "../../utils/unreadNotification";

function Notification() {
  const {
    notification,
    userChats,
    allUsers,
    markAllNotificationsAndRead,
    markNotificationsRead,
  } = useContext(ChatContext);
  const { user } = useContext(AuthContext);

  const unreadNotification = unreadNotificationsFun(notification);
  const modifyNotification = notification.map((n) => {
    const sender = allUsers.find((user) => user._id === n.senderId);

    return {
      ...n,
      senderName: sender?.name,
    };
  });

  console.log("unreadNotification ", unreadNotification);
  console.log("modifyNotification ", modifyNotification);
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="notifications">
      <div className="notifications-icons" onClick={() => setIsOpen(!isOpen)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="currentColor"
          className="bi bi-chat-left-fill"
          viewBox="0 0 16 16"
        >
          <path d="M2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
        </svg>
        {unreadNotification?.length === 0 ? null : (
          <span className="notification-count">
            <span>{unreadNotification?.length}</span>
          </span>
        )}
      </div>
      {isOpen ? (
        <div className="notifications-box">
          <div className="notifications-header">
            <h3>Notifications</h3>
            <div
              className="mark-as-read"
              onClick={() => {
                markAllNotificationsAndRead(notification);
              }}
            >
              Mark all as read
            </div>
          </div>
          {modifyNotification?.length === 0 ? (
            <span> no notification yet ..</span>
          ) : null}
          {modifyNotification &&
            modifyNotification.map((n, index) => {
              return (
                <div
                  key={index}
                  className={n.isRead ? "notification" : "notification no-read"}
                  onClick={() => {
                    markNotificationsRead(n, userChats, user, notification);
                    setIsOpen(false);
                  }}
                >
                  <span>{`${n.senderName} sent you a new message`}</span>
                  <span className="notification-time">
                    {moment(n.date).calendar()}
                  </span>
                </div>
              );
            })}
        </div>
      ) : null}
    </div>
  );
}

export default Notification;
