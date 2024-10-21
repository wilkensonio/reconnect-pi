import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { apiService } from '../services/api';
import '../styles/Calendar.css';

const Calendar = ({ selectedDate, onSelectDate }) => {
  const [availableTimes, setAvailableTimes] = useState([]);

  useEffect(() => {
    const fetchAvailabilities = async () => {
      try {
        const availabilities = await apiService.getAvailabilities();
        const times = availabilities.map(a => ({
          day: a.day,
          start_time: a.start_time,
          end_time: a.end_time
        }));
        setAvailableTimes(times);
        console.log('Fetched availabilities:', availabilities);
      } catch (error) {
        console.error('Error fetching availabilities:', error);
      }
    };
    fetchAvailabilities();
  }, []);

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

  const handleDayClick = (date) => {
    const parentElement = document.querySelector('.schedule-card');
    if (!isDateAvailable(date)) {
      parentElement.classList.add('transparent-card');
    } else {
      parentElement.classList.remove('transparent-card');
    }
  };

  return (
    <DatePicker
      selected={selectedDate}
      onChange={(date) => {
        onSelectDate(date);
        handleDayClick(date);
      }}
      showTimeSelect
      inline
      timeFormat="HH:mm"
      timeIntervals={15}
      dateFormat="MMMM d, yyyy h:mm aa"
      calendarClassName="custom-calendar"
      dayClassName={date => isDateAvailable(date) ? "available-date" : "unavailable-date"}
      timeClassName={time => isTimeAvailable(time) ? "available-time" : "unavailable-time"}
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
  );
};

export default Calendar;