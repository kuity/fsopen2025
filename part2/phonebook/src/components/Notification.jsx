const Notification = ({ message, messageClass }) => {
  if (!message) {
    return null;
  }

  return <div className={messageClass}>{message}</div>;
};

export default Notification;
