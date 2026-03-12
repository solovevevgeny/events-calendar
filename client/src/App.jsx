import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addEvent, deleteEvent, fetchEvents, updateEvent } from './store/eventsSlice.js';
import { fetchTitles } from './store/titlesSlice.js';

import CalendarView from './components/CalendarView.jsx';
import EventForm from './components/EventForm.jsx';
import EventList from './components/EventList.jsx';

const emptyEvent = {
  fullName: '',
  eventDate: '',
  title: '',
  distance: '',
  plannedFinishTime: '',
};

export default function App() {
  const dispatch = useDispatch();
  const { items, error } = useSelector((state) => state.events);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState('');
  const [view, setView] = useState('calendar');
  const [draftDate, setDraftDate] = useState('');
  const [formFocusToken, setFormFocusToken] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchEvents());
    dispatch(fetchTitles());

  }, [dispatch]);

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
        setEditing(null);
        setNotice('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.eventDate === b.eventDate) return b.id - a.id;
      return a.eventDate.localeCompare(b.eventDate);
    });
  }, [items]);

  const newEventInitial = useMemo(() => {
    if (!draftDate) return emptyEvent;
    return { ...emptyEvent, eventDate: draftDate };
  }, [draftDate]);

  const handleSubmit = async (payload) => {
    setNotice('');
    try {
      if (editing) {
        await dispatch(updateEvent({ ...payload, id: editing.id })).unwrap();
        setEditing(null);
        setNotice('Событие обновлено');
      } else {
        await dispatch(addEvent(payload)).unwrap();
        setNotice('Событие добавлено');
      }
    } catch (err) {
      setNotice('');
    }
  };

  const handleEdit = (event) => {
    setEditing(event);
    setNotice('');
    setDraftDate(event.eventDate);
    openModal();
  };

  const handleDelete = async (event) => {
    const ok = window.confirm(`Удалить событие "${event.title}"?`);
    if (!ok) return;
    try {
      await dispatch(deleteEvent(event.id)).unwrap();
      if (editing?.id === event.id) {
        setEditing(null);
      }
    } catch (err) {
      // handled by global error state
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setFormFocusToken((token) => token + 1);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
    setNotice('');
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  };

  const handleSelectDate = (dateKey) => {
    setEditing(null);
    setNotice('');
    setDraftDate(dateKey);
    openModal();
  };

  return (
    <div className="app">
      <header className="hero">
        {/* <div>
          <p className="eyebrow">Общий календарь</p>
          <h1>События, в которых участвует вся команда</h1>
        
        </div> */}
      </header>

      <section className="content">
        <div className="panel list-panel">
          <div className="panel-header panel-header--split">
            <div>
              <h2>Календарь событий</h2>
              {/* <p>События отсортированы по дате. Используйте календарь или список для управления.</p> */}
            </div>
            <div className="panel-tabs">
              <button
                type="button"
                className={`tab-button${view === 'list' ? ' active' : ''}`}
                onClick={() => setView('list')}
              >
                Список
              </button>
              <button
                type="button"
                className={`tab-button${view === 'calendar' ? ' active' : ''}`}
                onClick={() => setView('calendar')}
              >
                Календарь
              </button>
            </div>
          </div>
          {view === 'list' ? (
            <EventList
              items={sortedItems}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <CalendarView
              items={sortedItems}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSelectDate={handleSelectDate}
            />
          )}
        </div>
      </section>

      {isModalOpen ? (
        <div className="modal-overlay" onClick={handleOverlayClick} role="presentation">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2 id="event-modal-title">
                  {editing ? 'Редактировать событие' : 'Новое событие'}
                </h2>
                <p>Заполняйте все поля. Поле "ФамилияИмя" позволяет вести календарь нескольких пользователей.</p>
              </div>
              <button className="ghost" type="button" onClick={closeModal}>
                Закрыть
              </button>
            </div>
            <EventForm
              key={editing?.id || 'new'}
              initial={editing || newEventInitial}
              onSubmit={handleSubmit}
              onCancel={closeModal}
              isEditing={Boolean(editing)}
              focusToken={formFocusToken}
            />
            {notice ? <div className="notice success">{notice}</div> : null}
            {error ? <div className="notice error">{error}</div> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
