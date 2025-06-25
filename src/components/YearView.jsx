// src/components/YearView.jsx
import React, { useState } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import './yearview.css';

const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function YearView({ today, onSelectMonth }) {
  const [year, setYear] = useState(dayjs().year());
  const navigate = useNavigate();

  const months = Array.from({ length: 12 }, (_, i) =>
    dayjs().year(year).month(i).startOf('month')
  );

  const handlePrev = () => setYear((prev) => prev - 1);
  const handleNext = () => setYear((prev) => prev + 1);
  const handleYearChange = (e) => setYear(Number(e.target.value));

  const handleViewChange = (e) => {
    const selected = e.target.value.toLowerCase();
    if (selected === 'month') {
      navigate('/month');
    }
    else if (selected === 'week') {
      navigate('/week');
    }
    else {
      alert(`View "${selected}" not implemented.`);
    }
  };

  return (
    <div className="year-view-container">
      {/* Header */}
      <div className="year-header">
        <div className="year-nav">
          <button onClick={handlePrev}>◀</button>
          <h2>{year}</h2>
          <button onClick={handleNext}>▶</button>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <select value={year} onChange={handleYearChange}>
            {Array.from({ length: 20 }, (_, i) => {
              const y = dayjs().year() - 10 + i;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>

          <select defaultValue="year" onChange={handleViewChange}>
            <option value="year">Year</option>
            <option value="month">Month</option>
            <option value="week">Week</option>
          
          </select>
        </div>
      </div>

      {/* Months Grid */}
      <div className="months-grid">
        {months.map((month, idx) => {
          const startDay = month.day();
          const daysInMonth = month.daysInMonth();
          const daysArray = [];

          for (let i = 0; i < startDay; i++) {
            daysArray.push('');
          }
          for (let d = 1; d <= daysInMonth; d++) {
            daysArray.push(d);
          }

          return (
            <div
              key={idx}
              className={`month-box ${today &&
                today.year() === year &&
                today.month() === idx
                ? 'highlight-month'
                : ''
              }`}
              
            >
              <h4>{month.format('MMMM')}</h4>
              <div className="weekdays">
                {weekdays.map((day) => (
                  <span key={day} className="weekday">{day}</span>
                ))}
              </div>
              <div className="days-grid">
                {daysArray.map((d, i) => {
                  const isToday = d &&
                    today &&
                    today.date() === d &&
                    today.month() === month.month() &&
                    today.year() === year;

                  return (
                    <span key={i} className={`day ${isToday ? 'today-dot' : ''}`}>
                      {d}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
