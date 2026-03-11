import { useEffect, useRef, useState } from 'react';

const emptyForm = {
  fullName: '',
  eventDate: '',
  title: '',
  distance: '',
  plannedFinishTime: '',
};

export default function EventForm({ initial, onSubmit, onCancel, isEditing, focusToken }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [localError, setLocalError] = useState('');
  const nameInputRef = useRef(null);

  useEffect(() => {
    setForm(initial || emptyForm);
    setLocalError('');
  }, [initial]);

  useEffect(() => {
    if (!focusToken) return;
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [focusToken]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setLocalError('');

    const fullName = form.fullName.trim();
    const eventDate = form.eventDate.trim();
    const title = form.title.trim();
    const plannedFinishTime = form.plannedFinishTime.trim();
    const distance = Number(form.distance);

    if (!fullName || !eventDate || !title || !plannedFinishTime) {
      setLocalError('Пожалуйста, заполните все поля.');
      return;
    }

    if (!Number.isFinite(distance) || distance < 0) {
      setLocalError('Дистанция должна быть числом больше или равным нулю.');
      return;
    }

    onSubmit({
      fullName,
      eventDate,
      title,
      distance,
      plannedFinishTime,
    });
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <div className="grid">
        <label>
          <span>ФамилияИмя</span>
          <input
            ref={nameInputRef}
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={updateField}
            placeholder="Иванов Иван"
            autoComplete="off"
            required
          />
        </label>
        <label>
          <span>Дата события</span>
          <input
            type="date"
            name="eventDate"
            value={form.eventDate}
            onChange={updateField}
            required
          />
        </label>
        <label>
          <span>Название</span>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={updateField}
            placeholder="Полумарафон"
            autoComplete="off"
            required
          />
        </label>
        <label>
          <span>Дистанция (км)</span>
          <input
            type="number"
            name="distance"
            value={form.distance}
            onChange={updateField}
            min="0"
            step="0.01"
            placeholder="21.1"
            required
          />
        </label>
        <label>
          <span>Планируемое время финиша</span>
          <input
            type="time"
            name="plannedFinishTime"
            value={form.plannedFinishTime}
            onChange={updateField}
            step="1"
            required
          />
        </label>
      </div>

      <div className="form-actions">
        <button className="primary" type="submit">
          {isEditing ? 'Сохранить изменения' : 'Добавить событие'}
        </button>
        {isEditing ? (
          <button className="ghost" type="button" onClick={onCancel}>
            Отменить
          </button>
        ) : null}
      </div>

      {localError ? <div className="notice error">{localError}</div> : null}
    </form>
  );
}
