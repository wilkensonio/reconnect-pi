import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const Calendar = ({ selectedDate, onSelectDate }) => {
  return (
    <DatePicker
      selected={selectedDate}
      onChange={onSelectDate}
      showTimeSelect
      dateFormat="MMMM d, yyyy h:mm aa"
    />
  );
};

export default Calendar;
