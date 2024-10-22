import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { apiService } from '../services/api';
import '../styles/Calendar.css';

const Calendar = ({ selectedDate, onSelectDate, facultyId }) => {
  const [availableTimes, setAvailableTimes] = useState([]);
  const [timeRange, setTimeRange] = useState({
    minTime: new Date(),
    maxTime: new Date()
  });

  useEffect(() => {
    const fetchAvailabilities = async () => {
      try {
        const availabilities = await apiService.getAvailabilitiesByUser(facultyId);
        const times = availabilities.map(a => ({
          day: a.day,
          start_time: a.start_time,
          end_time: a.end_time
        }));
        setAvailableTimes(times);

        // Find the earliest start time and latest end time
        let earliestStart = '23:59';
        let latestEnd = '00:00';
        
        times.forEach(slot => {
          if (slot.start_time < earliestStart) earliestStart = slot.start_time;
          if (slot.end_time > latestEnd) latestEnd = slot.end_time;
        });

        // Set time range
        const [startHours, startMinutes] = earliestStart.split(':').map(Number);
        const [endHours, endMinutes] = latestEnd.split(':').map(Number);
        
        const minTime = new Date();
        minTime.setHours(startHours, startMinutes);
        
        const maxTime = new Date();
        maxTime.setHours(endHours, endMinutes);

        setTimeRange({ minTime, maxTime });
      } catch (error) {
        console.error('Error fetching availabilities:', error);
      }
    };

    if (facultyId) {
      fetchAvailabilities();
    }
  }, [facultyId]);

  const isDateAvailable = (date) => {
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });
    return availableTimes.some(slot => dayOfWeek === slot.day);
  };

  const isTimeAvailable = (time) => {
    const dayOfWeek = time.toLocaleString('en-US', { weekday: 'long' });
    const selectedTimeString = time.toTimeString().slice(0, 5);
    return availableTimes.some(slot =>
      dayOfWeek === slot.day &&
      selectedTimeString >= slot.start_time &&
      selectedTimeString < slot.end_time
    );
  };

  return (
    <div className="calendar-wrapper">
      <DatePicker
        selected={selectedDate}
        onChange={onSelectDate}
        showTimeSelect
        inline
        timeFormat="HH:mm"
        timeIntervals={15}
        dateFormat="MMMM d, yyyy h:mm aa"
        calendarClassName="custom-calendar"
        dayClassName={date => 
          isDateAvailable(date) ? "available-date" : "unavailable-date react-datepicker__day--disabled"
        }
        timeClassName={time => 
          isTimeAvailable(time) ? "available-time" : "unavailable-time"
        }
        minTime={timeRange.minTime}
        maxTime={timeRange.maxTime}
        filterTime={isTimeAvailable}
        popperPlacement="bottom-start"
        popperModifiers={[
          {
            name: "offset",
            options: {
              offset: [0, 10],
            },
          },
          {
            name: "preventOverflow",
            options: {
              rootBoundary: "viewport",
              tether: false,
              altAxis: true,
            },
          },
        ]}
      />
    </div>
  );
};

export default Calendar;