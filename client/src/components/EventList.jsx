export default function EventList({ items, onEdit, onDelete }) {
  if (!items.length) {
    return (
      <div className="empty-state">
        <h3>Пока нет событий</h3>
        <p>Добавьте первое событие, и оно появится в календаре.</p>
      </div>
    );
  }

  return (
    <div className="event-list">
      {items.map((item) => (
        <article className="event-card" key={item.id}>
          <div className="event-main">
            <div>
              <p className="event-title">{item.title}</p>
              <p className="event-meta">
                {item.eventDate} · {item.distance} км · план {item.plannedFinishTime}
              </p>
            </div>
            <div className="event-user">{item.fullName}</div>
          </div>
          <div className="event-actions">
            <button className="ghost" onClick={() => onEdit(item)}>
              Редактировать
            </button>
            <button className="danger" onClick={() => onDelete(item)}>
              Удалить
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
