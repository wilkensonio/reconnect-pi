import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { apiService } from '../services/api';
import '../styles/Calendar.css';

const Calendar = ({ selectedDate, onSelectDate }) => {
  const [availableDates, setAvailableDates] = useState([]);

  useEffect(() => {
    const fetchAvailabilities = async () => {
      try {
        const availabilities = await apiService.getAvailabilities();
        setAvailableDates(availabilities.map(a => new Date(a.day)));
        console.log('Fetched availabilities:', availabilities);
      } catch (error) {
        console.error('Error fetching availabilities:', error);
      }
    };
    fetchAvailabilities();
  }, []);

  const isDateAvailable = (date) => {
    return availableDates.some(availableDate =>
      date.getDate() === availableDate.getDate() &&
      date.getMonth() === availableDate.getMonth() &&
      date.getFullYear() === availableDate.getFullYear()
    );
  };

  return (
    <DatePicker
      selected={selectedDate}
      onChange={onSelectDate}
      showTimeSelect
      inline
      timeFormat="HH:mm"
      timeIntervals={15}
      dateFormat="MMMM d, yyyy h:mm aa"
      calendarClassName="custom-calendar"
      dayClassName={date => isDateAvailable(date) ? "available-date" : "unavailable-date"}
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