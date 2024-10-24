// src/components/Calendar.jsx

import React, { useState, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { apiService } from '../services/api';
import '../styles/Calendar.css';

const Calendar = ({ selectedDate, onSelectDate, facultyId, studentId }) => {
  const [availableTimes, setAvailableTimes] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showDurationSelect, setShowDurationSelect] = useState(false);
  const [timeRange, setTimeRange] = useState({
    minTime: new Date(),
    maxTime: new Date()
  });

  const fetchAvailability = useCallback(async () => {
    if (!facultyId || !studentId) return;

    try {
      // Fetch faculty's base availability
      const baseAvailability = await apiService.getAvailabilitiesByUser(facultyId);

      // Fetch faculty's existing appointments
      const facultyAppointments = await apiService.getAppointmentsByUser(facultyId);

      // Fetch student's existing appointments
      const studentAppointments = await apiService.getAppointmentsByUser(studentId);

      // Combine appointments
      const combinedAppointments = [...facultyAppointments, ...studentAppointments];
      setAvailableTimes(baseAvailability);
      setAppointments(combinedAppointments);

      // Set time range based on faculty's availability
      if (baseAvailability.length > 0) {
        let earliestStart = '23:59';
        let latestEnd = '00:00';

        baseAvailability.forEach(slot => {
          if (slot.start_time < earliestStart) earliestStart = slot.start_time;
          if (slot.end_time > latestEnd) latestEnd = slot.end_time;
        });

        const minTime = new Date();
        const maxTime = new Date();

        const [startHours, startMinutes] = earliestStart.split(':').map(Number);
        const [endHours, endMinutes] = latestEnd.split(':').map(Number);

        minTime.setHours(startHours, startMinutes, 0);
        maxTime.setHours(endHours, endMinutes, 0);

        setTimeRange({ minTime, maxTime });
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  }, [facultyId, studentId]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const isTimeSlotAvailable = (time) => {
    if (!time) return false;

    // Don't show past times
    const now = new Date();
    if (time < now) return false;

    const dayOfWeek = time.toLocaleString('en-US', { weekday: 'long' });
    const timeString = time.toTimeString().slice(0, 5);
    const dateString = time.toISOString().split('T')[0];

    // Check if faculty is available on this day/time
    const dayAvailability = availableTimes.find(slot => slot.day === dayOfWeek);
    if (!dayAvailability) return false;

    // Check if time is within faculty's available hours
    if (timeString < dayAvailability.start_time || timeString >= dayAvailability.end_time) {
      return false;
    }

    // Check if time slot is already booked
    const isBooked = appointments.some(apt => 
      apt.date === dateString && 
      timeString >= apt.start_time && 
      timeString < apt.end_time
    );

    if (isBooked) return false;

    return true;
  };

  const isDateAvailable = (date) => {
    if (!date) return false;

    // Don't show past dates
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (date < now) return false;

    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });

    // Check if faculty is available on this day
    const dayAvailability = availableTimes.some(slot => slot.day === dayOfWeek);
    if (!dayAvailability) return false;

    // Check if there is at least one available time slot on this date
    const dateString = date.toISOString().split('T')[0];
    const timesForDay = availableTimes.filter(slot => slot.day === dayOfWeek);

    // Iterate through each available time slot and check if at least one is available
    for (let slot of timesForDay) {
      // Convert slot times to Date objects
      const [startHours, startMinutes] = slot.start_time.split(':').map(Number);
      const [endHours, endMinutes] = slot.end_time.split(':').map(Number);

      const slotStart = new Date(date);
      slotStart.setHours(startHours, startMinutes, 0, 0);

      const slotEnd = new Date(date);
      slotEnd.setHours(endHours, endMinutes, 0, 0);

      // Iterate through each 15-minute interval within the slot
      let currentTime = new Date(slotStart);
      while (currentTime < slotEnd) {
        if (isTimeSlotAvailable(currentTime)) {
          return true; // At least one available slot
        }
        currentTime.setMinutes(currentTime.getMinutes() + 15);
      }
    }

    return false; // No available slots
  };

  const handleTimeSelect = (time, event) => {
    event.preventDefault();
    event.stopPropagation();

    const timeEl = event.target;
    const rect = timeEl.getBoundingClientRect();

    setSelectedTime(time);
    setShowDurationSelect(true);

    // Position duration select next to the time
    const durationSelect = document.querySelector('.duration-select');
    if (durationSelect) {
      durationSelect.style.top = `${rect.top}px`;
      durationSelect.style.left = `${rect.right + 10}px`;
    }
  };

  const handleDurationSelect = (duration) => {
    if (!selectedTime) return;

    const endTime = new Date(selectedTime.getTime() + duration * 60000);
    const startTimeString = selectedTime.toTimeString().slice(0, 5);
    const endTimeString = endTime.toTimeString().slice(0, 5);
    const dateString = selectedTime.toISOString().split('T')[0];

    // Check if duration fits within availability and doesn't conflict
    const dayOfWeek = selectedTime.toLocaleString('en-US', { weekday: 'long' });
    const dayAvailability = availableTimes.find(slot => slot.day === dayOfWeek);

    if (!dayAvailability || endTimeString > dayAvailability.end_time) {
      alert('Selected duration exceeds available time');
      return;
    }

    const hasConflict = appointments.some(apt => {
      if (apt.date !== dateString) return false;
      const aptStart = new Date(`${apt.date}T${apt.start_time}`);
      const aptEnd = new Date(`${apt.date}T${apt.end_time}`);
      return (selectedTime < aptEnd && endTime > aptStart);
    });

    if (hasConflict) {
      alert('Selected duration conflicts with another appointment');
      return;
    }

    onSelectDate({
      date: selectedTime,
      startTime: startTimeString,
      endTime: endTimeString,
      length: duration
    });

    setShowDurationSelect(false);
    setSelectedTime(null);
  };

  return (
    <div className="calendar-wrapper">
      <DatePicker
        selected={selectedDate}
        onChange={date => {
          setShowDurationSelect(false);
          setSelectedTime(null);
          onSelectDate({ date });
        }}
        showTimeSelect
        inline
        timeFormat="HH:mm"
        timeIntervals={15}
        dateFormat="MMMM d, yyyy h:mm aa"
        calendarClassName="custom-calendar"
        dayClassName={date =>
          isDateAvailable(date) ? "available-date" : "unavailable-date"
        }
        timeClassName={time =>
          isTimeSlotAvailable(time) ? "available-time" : "unavailable-time"
        }
        minTime={timeRange.minTime}
        maxTime={timeRange.maxTime}
        minDate={new Date()}
        filterTime={isTimeSlotAvailable}
        onTimeSelect={handleTimeSelect}
      />
      
      {showDurationSelect && selectedTime && (
        <div className="duration-select">
          <div className="duration-option" onClick={() => handleDurationSelect(15)}>15 minutes</div>
          <div className="duration-option" onClick={() => handleDurationSelect(30)}>30 minutes</div>
          <div className="duration-option" onClick={() => handleDurationSelect(45)}>45 minutes</div>
          <div className="duration-option" onClick={() => handleDurationSelect(60)}>60 minutes</div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
