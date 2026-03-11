import { useMemo, useState } from 'react';

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const pad = (value) => String(value).padStart(2, '0');

const toDateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const parseDateKey = (key) => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const addMonths = (date, delta) => new Date(date.getFullYear(), date.getMonth() + delta, 1);

const buildCalendarDays = (monthDate) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const offset = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const dayDate = new Date(year, month, index - offset + 1);
    return {
      date: dayDate,
      key: toDateKey(dayDate),
      day: dayDate.getDate(),
      isOutside: dayDate.getMonth() !== month,
    };
  });
};

const formatMonthLabel = (date) =>
  date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

const formatLongDate = (key) =>
  parseDateKey(key).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export default function CalendarView({ items, onEdit, onDelete, onSelectDate }) {
  const todayKey = toDateKey(new Date());
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => todayKey);

  const eventsByDate = useMemo(() => {
    const map = new Map();
    items.forEach((item) => {
      if (!map.has(item.eventDate)) {
        map.set(item.eventDate, []);
      }
      map.get(item.eventDate).push(item);
    });
    return map;
  }, [items]);

  const usersByDate = useMemo(() => {
    const map = new Map();
    eventsByDate.forEach((events, key) => {
      map.set(key, Array.from(new Set(events.map((event) => event.fullName))));
    });
    return map;
  }, [eventsByDate]);

  const days = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);

  const selectedEvents = selectedDate ? eventsByDate.get(selectedDate) || [] : [];
  const selectedUsers = selectedDate ? usersByDate.get(selectedDate) || [] : [];

  const handleSelect = (day) => {
    if (day.isOutside) {
      setCurrentMonth(startOfMonth(day.date));
    }
    setSelectedDate(day.key);
    if (onSelectDate) {
      onSelectDate(day.key);
    }
  };

  const handleToday = () => {
    const today = new Date();
    const todayKey = toDateKey(today);
    setCurrentMonth(startOfMonth(today));
    setSelectedDate(todayKey);
    if (onSelectDate) {
      onSelectDate(todayKey);
    }
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <div>
          <h3>Календарь</h3>
          <p>Выберите дату, чтобы увидеть всех пользователей и события.</p>
        </div>
        <div className="calendar-controls">
          <button className="ghost" type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}>
            Пред.
          </button>
          <div className="calendar-month">{formatMonthLabel(currentMonth)}</div>
          <button className="ghost" type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            След.
          </button>
          <button className="ghost" type="button" onClick={handleToday}>
            Сегодня
          </button>
        </div>
      </div>

      <div className="calendar-layout">
        <div className="calendar-grid">
          {weekDays.map((day) => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}

          {days.map((day) => {
            const users = usersByDate.get(day.key) || [];
            const events = eventsByDate.get(day.key) || [];
            const isSelected = selectedDate === day.key;
            const isToday = day.key === todayKey;
            return (
              <button
                key={day.key}
                type="button"
                className={`calendar-day${day.isOutside ? ' is-outside' : ''}${isSelected ? ' is-selected' : ''}${isToday ? ' is-today' : ''}`}
                onClick={() => handleSelect(day)}
              >
                <div className="calendar-day-header">
                  <span>{day.day}</span>
                  {events.length ? <span className="calendar-count">{events.length}</span> : null}
                </div>
                <div className="calendar-users">
                  {users.slice(0, 3).map((user) => (
                    <span key={user} className="calendar-chip">
                      {user}
                    </span>
                  ))}
                  {users.length > 3 ? (
                    <span className="calendar-more">+{users.length - 3}</span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        <div className="calendar-details">
          <div className="calendar-details-header">
            <h3>{selectedDate ? formatLongDate(selectedDate) : 'Выберите дату'}</h3>
            <p>Пользователи и события, запланированные на выбранную дату.</p>
          </div>

          {selectedUsers.length ? (
            <div className="calendar-users-list">
              {selectedUsers.map((user) => (
                <span key={user} className="calendar-chip">
                  {user}
                </span>
              ))}
            </div>
          ) : (
            <div className="empty-state">На выбранную дату нет пользователей.</div>
          )}

          {selectedEvents.length ? (
            <div className="calendar-events">
              {selectedEvents.map((event) => (
                <div key={event.id} className="calendar-event">
                  <div>
                    <p className="calendar-event-title">{event.title}</p>
                    <p className="calendar-event-meta">
                      {event.fullName} · {event.distance} км · план {event.plannedFinishTime}
                    </p>
                  </div>
                  <div className="calendar-event-actions">
                    <button className="ghost" onClick={() => onEdit(event)}>
                      Редактировать
                    </button>
                    <button className="danger" onClick={() => onDelete(event)}>
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
