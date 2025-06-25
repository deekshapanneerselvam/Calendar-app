import React, { useState } from 'react';
import './Sidebar.css';
import Modal from 'react-modal';
import dayjs from 'dayjs';

Modal.setAppElement('#root');

export default function Sidebar({ events, today, onAddEventClick }) {
  const todayStr = today.format('YYYY-MM-DD');

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: todayStr,
    time: '',
    duration: '',
  });

  const handleOpenModal = () => {
    setFormData({
      title: '',
      date: todayStr,
      time: '',
      duration: '',
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.date || !formData.time || !formData.duration) return;

    const newEvent = {
      id: Date.now(),
      title: formData.title,
      date: formData.date,
      time: formData.time,
      duration: formData.duration,
    };

    onAddEventClick(newEvent); // 👈 pass to parent
    setModalOpen(false);
  };

  // Analytics and Smart Summary
  const todayEvents = events.filter(e => e.date === todayStr);
  const nextEvent = [...todayEvents]
    .filter(e => e.time >= today.format('HH:mm'))
    .sort((a, b) => a.time.localeCompare(b.time))[0];

  const countsByDay = {};
  events.forEach((e) => {
    const day = new Date(e.date).toLocaleString('en-US', { weekday: 'long' });
    countsByDay[day] = (countsByDay[day] || 0) + 1;
  });
  const busiestDay = Object.entries(countsByDay).sort((a, b) => b[1] - a[1])[0];

  const avgDuration =
    events.length > 0
      ? (
          events.reduce((sum, e) => {
            const d = parseFloat(e.duration.replace(/[^\d.]/g, '')) || 0;
            return sum + d;
          }, 0) / events.length
        ).toFixed(1)
      : 0;

  return (
    <div className="sidebar">
      {/* ➕ Add Event Button */}
      <button className="create-button" onClick={handleOpenModal}>
        + Add Event
      </button>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={handleCloseModal}
        className="modal"
        overlayClassName="overlay"
      >
        <h3>Add Event</h3>
        <input
          name="title"
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={handleInputChange}
        />
        <input
          name="date"
          type="date"
          value={formData.date}
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
          <button onClick={handleSubmit}>Add</button>
          <button onClick={handleCloseModal}>Cancel</button>
        </div>
      </Modal>

      {/* Smart Summary */}
      <div className="sidebar-section">
        <h4>Today</h4>
        <p>{today.format('dddd, MMMM D')}</p>
        <p>Events: {todayEvents.length}</p>
        {nextEvent ? (
          <p>
            Next: <b>{nextEvent.title}</b> at {nextEvent.time}
          </p>
        ) : (
          <p>No more events today</p>
        )}
      </div>

      {/* Analytics */}
      <div className="sidebar-section">
        <h4>Analytics</h4>
        <p>Total Events: {events.length}</p>
        {busiestDay && <p>Busiest: {busiestDay[0]} ({busiestDay[1]} events)</p>}
        <p>Avg Duration: {avgDuration}h</p>
      </div>
    </div>
  );
}
