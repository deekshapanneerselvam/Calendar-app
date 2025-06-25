import React, { useState } from 'react';
import dayjs from 'dayjs';
import './weekview.css';
import Modal from 'react-modal';

const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

Modal.setAppElement('#root');

export default function WeekView({ today, events, onAddEventClick }) {
  const [weekStart, setWeekStart] = useState(today.startOf('week'));
  const [modalOpen, setModalOpen] = useState(false);
  const [eventDetailOpen, setEventDetailOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', time: '', duration: '' });
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const days = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));

  const getEventsForSlot = (day, hour) => {
    return events.filter(
      (event) =>
        dayjs(event.date).isSame(day, 'day') &&
        event.time.startsWith(hour.toString().padStart(2, '0'))
    );
  };

  const handleSlotClick = (day, hour) => {
    setSelectedDateTime(day.hour(hour).minute(0));
    setFormData({
      title: '',
      time: hour.toString().padStart(2, '0') + ':00',
      duration: '',
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleAddEvent = () => {
    if (!formData.title || !formData.time || !formData.duration) return;

    // Check for conflicts
    const conflict = events.some(
      (event) =>
        event.date === selectedDateTime.format('YYYY-MM-DD') &&
        event.time === formData.time
    );

    if (conflict) {
      setErrorMsg('⚠️ An event already exists at this time.');
      return;
    }

    const newEvent = {
      id: Date.now(),
      title: formData.title,
      date: selectedDateTime.format('YYYY-MM-DD'),
      time: formData.time,
      duration: formData.duration,
    };

    onAddEventClick(newEvent);
    setModalOpen(false);
    setErrorMsg('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleViewChange = (e) => {
    const view = e.target.value;
    window.location.href = `/${view}`;
  };

  return (
    <div className="week-view-container">
      {/* Header */}
      <div className="week-header">
        <div className="week-nav">
          <button onClick={() => setWeekStart(weekStart.subtract(1, 'week'))}>◀</button>
          <h2>
            Week of {weekStart.format('MMM D')} - {weekStart.add(6, 'day').format('MMM D, YYYY')}
          </h2>
          <button onClick={() => setWeekStart(weekStart.add(1, 'week'))}>▶</button>
        </div>
        <select onChange={handleViewChange} defaultValue="week">
          <option value="month">Month</option>
          <option value="week">Week</option>
          <option value="year">Year</option>
          
        </select>
      </div>

      {/* Grid */}
      <div className="week-grid">
        <div className="time-col"></div>
        {days.map((day) => (
          <div key={day} className="day-header">
            <div className={`day-title ${day.isSame(today, 'day') ? 'highlight' : ''}`}>
              {day.format('ddd, MMM D')}
            </div>
          </div>
        ))}

        {hours.map((hour, rowIdx) => (
          <React.Fragment key={rowIdx}>
            <div className="time-label">{hour}</div>
            {days.map((day, colIdx) => (
              <div
                key={colIdx}
                className="slot-cell"
                onClick={() => handleSlotClick(day, rowIdx)}
              >
                {getEventsForSlot(day, rowIdx).map((event) => (
                  <div
                    key={event.id}
                    className="slot-event"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvent(event);
                      setEventDetailOpen(true);
                    }}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Add Event Modal */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        className="modal"
        overlayClassName="overlay"
      >
        <h3>Add Event on {selectedDateTime?.format('ddd, MMM D, HH:mm')}</h3>
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

      {/* View Event Detail Modal */}
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
