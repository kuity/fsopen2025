import NotificationContext from '../context/NotificationContext'
import { useContext, useEffect } from 'react'

const Notification = () => {
  const style = {
    border: 'solid',
    padding: 10,
    borderWidth: 1,
    marginBottom: 5,
  }

  const { notification, notificationDispatch } = useContext(NotificationContext)

  useEffect(() => {
    if (notification.length > 0) {
      const timer = setTimeout(() => {
        notificationDispatch({ type: 'CLEAR' })
      }, 5000)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [notification, notificationDispatch])

  return <div style={style}>{notification}</div>
}

export default Notification
