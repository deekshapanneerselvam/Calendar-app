import { useState } from 'react';
import dayjs from 'dayjs';
import './calendar.css';
import Modal from 'react-modal';
import initialEvents from '../data/events.json';
import { useNavigate } from 'react-router-dom';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
Modal.setAppElement('#root');

export default function Calendar() {
  const today = dayjs();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(today.startOf('month'));
  const [events, setEvents] = useState(initialEvents);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    time: '',
    duration: '',
  });
  const [errorMsg, setErrorMsg] = useState('');

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDetailOpen, setEventDetailOpen] = useState(false);

  const daysInMonth = currentMonth.daysInMonth();
  const startDay = currentMonth.day();
  const daysArray = [];

  for (let i = 0; i < startDay; i++) daysArray.push(null);
  for (let i = 1; i <= daysInMonth; i++) daysArray.push(dayjs(currentMonth).date(i));
  const remainder = daysArray.length % 7;
  if (remainder !== 0) for (let i = 0; i < 7 - remainder; i++) daysArray.push(null);

  const isToday = (date) => date && date.isSame(today, 'day');

  const handlePrev = () => setCurrentMonth(currentMonth.subtract(1, 'month'));
  const handleNext = () => setCurrentMonth(currentMonth.add(1, 'month'));
  const handleToday = () => setCurrentMonth(today.startOf('month'));

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events
      .filter((event) => date.isSame(dayjs(event.date), 'day'))
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const handleCellClick = (date) => {
    if (!date) return;
    setSelectedDate(date);
    setFormData({ title: '', time: '', duration: '' });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEvent = () => {
    if (!formData.title || !formData.time || !formData.duration) return;

    // Check for time conflict
    const conflict = events.some((e) =>
      e.date === selectedDate.format('YYYY-MM-DD') && e.time === formData.time
    );

    if (conflict) {
      setErrorMsg('⚠️ An event already exists at this time.');
      return;
    }

    const newEvent = {
      id: Date.now(),
      title: formData.title,
      date: selectedDate.format('YYYY-MM-DD'),
      time: formData.time,
      duration: formData.duration,
    };
    setEvents([...events, newEvent]);
    setModalOpen(false);
    setErrorMsg('');
  };

  return (
    <div className="calendar-container">
      {/* Header */}
      <div className="calendar-header">
        <div className="calendar-nav">
          <button onClick={handleToday}>Today</button>
          <button onClick={handlePrev}>◀</button>
          <button onClick={handleNext}>▶</button>
        </div>
        <h2>{currentMonth.format('MMMM YYYY')}</h2>
        <select
          defaultValue="month"
          onChange={(e) => {
            const view = e.target.value;
            if (view === 'year') navigate('/year');
            else if (view === 'week') navigate('/week');
          }}
        >
          <option value="month">Month</option>
          <option value="week">Week</option>
          <option value="year">Year</option>
        </select>
      </div>

      {/* Weekdays */}
      <div className="calendar-weekdays">
        {weekdays.map((day) => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {daysArray.map((date, index) => {
          const eventsForDay = getEventsForDate(date);
          const visibleEvents = eventsForDay.slice(0, 2);
          const extraCount = eventsForDay.length - visibleEvents.length;

          return (
            <div
              key={index}
              className="calendar-cell"
              onClick={() => handleCellClick(date)}
            >
              {date && (
                <>
                  <div className={`date-circle ${isToday(date) ? 'today' : ''}`}>
                    {date.date()}
                  </div>
                  <div className="events-list">
                    {visibleEvents.map((event, i) => (
                      <div
                        key={event.id}
                        className={`event-tag event-${i % 5}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                          setEventDetailOpen(true);
                        }}
                      >
                        {event.time} - {event.title}
                      </div>
                    ))}
                    {extraCount > 0 && (
                      <div className="more-events">+{extraCount} more</div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Event Modal */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        className="modal"
        overlayClassName="overlay"
      >
        <h3>Add Event for {selectedDate?.format('MMM D, YYYY')}</h3>
        {errorMsg && <p style={{ color: 'red', fontSize: '13px' }}>{errorMsg}</p>}
        <input
          name="title"
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={handleInputChange}
        />
        <input
          name="time"
          type="time"
          value={formData.time}
          onChange={handleInputChange}
        />
        <input
          name="duration"
          type="text"
          placeholder="Duration (e.g. 1h)"
          value={formData.duration}
          onChange={handleInputChange}
        />
        <div style={{ marginTop: '10px' }}>
          <button onClick={handleAddEvent}>Add</button>
          <button onClick={() => setModalOpen(false)}>Cancel</button>
        </div>
      </Modal>

      {/* Event Detail Modal */}
      <Modal
        isOpen={eventDetailOpen}
        onRequestClose={() => setEventDetailOpen(false)}
        className="modal"
        overlayClassName="overlay"
      >
        <h3>Event Details</h3>
        {selectedEvent && (
          <div>
            <p><strong>Title:</strong> {selectedEvent.title}</p>
            <p><strong>Date:</strong> {dayjs(selectedEvent.date).format('MMMM D, YYYY')}</p>
            <p><strong>Time:</strong> {selectedEvent.time}</p>
            <p><strong>Duration:</strong> {selectedEvent.duration}</p>
          </div>
        )}
        <div style={{ marginTop: '10px' }}>
          <button onClick={() => setEventDetailOpen(false)}>Close</button>
        </div>
      </Modal>
    </div>
  );
}
