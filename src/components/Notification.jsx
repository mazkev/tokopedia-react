export default function Notification({ items }) {
  return (
    <div className="notification-container">
      {items.map((item) => (
        <div key={item.id} className="notification-toast">
          <div className="notification-icon">✅</div>
          <div className="notification-message">{item.message}</div>
        </div>
      ))}
    </div>
  );
}
