import React, { useState, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { apiService } from '../services/api';
import { useAppContext } from '../context/AppContext';
import '../styles/Calendar.css';

const Calendar = ({ selectedDate, onSelectDate, facultyId }) => {
  const [availableTimes, setAvailableTimes] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [studentAppointments, setStudentAppointments] = useState([]); // New state for student appointments
  const [selectedTime, setSelectedTime] = useState(null);
  const [showDurationSelect, setShowDurationSelect] = useState(false);
  const [timeRange, setTimeRange] = useState({
    minTime: new Date(),
    maxTime: new Date()
  });

  const { user } = useAppContext();

  const fetchAvailability = useCallback(async () => {
    if (!facultyId) return;

    try {
      // Get faculty's base availability
      const baseAvailability = await apiService.getAvailabilitiesByUser(facultyId);
      
      // Get faculty's existing appointments
      const facultyAppointments = await apiService.getAppointmentsByUser(facultyId);

      // Get student's existing appointments
      let studentExistingAppointments = [];
      if (user?.student_id) {
        studentExistingAppointments = await apiService.getAppointmentsByUser(user.student_id);
      }

      setAvailableTimes(baseAvailability);
      setAppointments(facultyAppointments);
      setStudentAppointments(studentExistingAppointments);

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
  }, [facultyId, user?.student_id]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const isTimeSlotAvailable = (time) => {
    if (!time) return false;
    
    // Don't show past times
    if (time < new Date()) return false;

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

    // Check if time slot is already booked by faculty
    const hasFacultyConflict = appointments.some(apt => 
      apt.date === dateString && 
      timeString >= apt.start_time && 
      timeString < apt.end_time
    );

    // Check if time slot conflicts with student's existing appointments
    const hasStudentConflict = studentAppointments.some(apt => 
      apt.date === dateString && 
      timeString >= apt.start_time && 
      timeString < apt.end_time
    );

    // Return true only if there are no conflicts
    return !hasFacultyConflict && !hasStudentConflict;
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

    // Check for conflicts with faculty appointments
    const hasFacultyConflict = appointments.some(apt => {
      if (apt.date !== dateString) return false;
      const aptStart = new Date(`${apt.date}T${apt.start_time}`);
      const aptEnd = new Date(`${apt.date}T${apt.end_time}`);
      return (selectedTime < aptEnd && endTime > aptStart);
    });

    // Check for conflicts with student appointments
    const hasStudentConflict = studentAppointments.some(apt => {
      if (apt.date !== dateString) return false;
      const aptStart = new Date(`${apt.date}T${apt.start_time}`);
      const aptEnd = new Date(`${apt.date}T${apt.end_time}`);
      return (selectedTime < aptEnd && endTime > aptStart);
    });

    if (hasFacultyConflict || hasStudentConflict) {
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

  const isDateAvailable = (date) => {
    if (!date) return false;

    // Don't show past dates
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (date < now) return false;

    // Check if faculty is available on this day of the week
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });
    const dayAvailability = availableTimes.filter(slot => slot.day === dayOfWeek);
    if (dayAvailability.length === 0) return false;

    // Check if there are available time slots for the specific date
    const dateString = date.toISOString().split('T')[0];
    
    for (let slot of dayAvailability) {
      const [startHour, startMinute] = slot.start_time.split(':').map(Number);
      const [endHour, endMinute] = slot.end_time.split(':').map(Number);
      const slotStart = new Date(date);
      slotStart.setHours(startHour, startMinute, 0, 0);
      const slotEnd = new Date(date);
      slotEnd.setHours(endHour, endMinute, 0, 0);

      let currentTime = new Date(slotStart);
      while (currentTime < slotEnd) {
        if (isTimeSlotAvailable(currentTime)) {
          return true; // At least one slot is available
        }
        currentTime = new Date(currentTime.getTime() + 15 * 60000);
      }
    }

    return false;
  };

  const isTimeSelected = (timeSlot) => {
    const hours = timeSlot.getHours().toString().padStart(2, '0');
    const minutes = timeSlot.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    return timeString === selectedTime;
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
      />
      
      {showDurationSelect && selectedTime && (
        <div className="duration-select">
          <div className="duration-option" onClick={() => handleDurationSelect(15)}>15 minutes</div>
          <div className="duration-option" onClick={() => handleDurationSelect(30)}>30 minutes</div>
          <div className="duration-option" onClick={() => handleDurationSelect(45)}>45 minutes</div>
        </div>
      )}
    </div>
  );
};

export default Calendar;