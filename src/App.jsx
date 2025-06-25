import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Calendar from './components/Calendar';
import Sidebar from './components/Sidebar';
import YearView from './components/YearView';
import WeekView from './components/WeekView'; // ✅ Add WeekView import

import initialEvents from './data/events.json';
import dayjs from 'dayjs';

function App() {
  const [events, setEvents] = useState(initialEvents);
  const [modalOpen, setModalOpen] = useState(false);
  const today = dayjs();
  const navigate = useNavigate();

  const handleAddEventClick = () => setModalOpen(true);

  const handleMonthSelectFromYear = () => {
    navigate('/month');
  };

  const handleViewChange = (view) => {
    navigate(`/${view}`);
  };

  return (
    <Routes>
      {/* Redirect root to /month */}
      <Route path="/" element={<Navigate to="/month" replace />} />

      {/* Shared Layout Route */}
      <Route
        path="*"
        element={
          <>
            <style>{sharedStyles}</style>
            <div className="app-wrapper">
              <div className="header">📅 Calendar</div>

              <div className="main-content">
                {/* Sidebar always visible */}
                <div className="sidebar-container">
                  <Sidebar
                    events={events}
                    onAddEventClick={handleAddEventClick}
                    today={today}
                  />
                </div>

                {/* Routed content */}
                <div className="calendar-container">
                  <Routes>
                    <Route
                      path="/month"
                      element={
                        <Calendar
                          events={events}
                          setEvents={setEvents}
                          modalOpen={modalOpen}
                          setModalOpen={setModalOpen}
                          today={today}
                        />
                      }
                    />
                    <Route
                      path="/year"
                      element={
                        <YearView
                          events={events}
                          today={today}
                          onSelectMonth={handleMonthSelectFromYear}
                          onViewChange={handleViewChange} // ✅ View switcher from dropdown
                        />
                      }
                    />
                    <Route
                      path="/week"
                      element={
                        <WeekView
                          today={today}
                          events={events}
                          onAddEventClick={handleAddEventClick}
                        />
                      }
                    />
                  </Routes>
                </div>
              </div>
            </div>
          </>
        }
      />
    </Routes>
  );
}

const sharedStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    height: 100%;
    overflow: hidden;
    font-family: sans-serif;
    background-color: #f0f0f0;
  }

  .app-wrapper {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  .header {
    padding: 16px 24px;
    background-color: white;
    border-bottom: 1px solid #ddd;
    font-size: 20px;
    font-weight: bold;
    color: #1976d2;
  }

  .main-content {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .sidebar-container {
    width: 250px;
    flex-shrink: 0;
  }

  .calendar-container {
    flex: 1;
    overflow: hidden;
    padding: 16px;
  }
`;

export default App;
