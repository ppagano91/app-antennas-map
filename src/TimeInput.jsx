import React, { useState } from 'react';

const TimeInput = ({ value, onChange }) => {
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');
  const [seconds, setSeconds] = useState('00');

  const handleHoursChange = (e) => {
    const val = e.target.value;
    if (val >= 0 && val <= 23) {
      setHours(val.padStart(2, '0'));
      updateTime(val.padStart(2, '0'), minutes, seconds);
    }
  };

  const handleMinutesChange = (e) => {
    const val = e.target.value;
    if (val >= 0 && val <= 59) {
      setMinutes(val.padStart(2, '0'));
      updateTime(hours, val.padStart(2, '0'), seconds);
    }
  };

  const handleSecondsChange = (e) => {
    const val = e.target.value;
    if (val >= 0 && val <= 59) {
      setSeconds(val.padStart(2, '0'));
      updateTime(hours, minutes, val.padStart(2, '0'));
    }
  };

  const updateTime = (h, m, s) => {
    const timeString = `${h}:${m}:${s}`;
    onChange(timeString);
  };

  return (
    <div>
      <input
        type="number"
        value={hours}
        onChange={handleHoursChange}
        min="0"
        max="23"
        style={{ width: '50px' }}
      />
      :
      <input
        type="number"
        value={minutes}
        onChange={handleMinutesChange}
        min="0"
        max="59"
        style={{ width: '50px' }}
      />
      :
      <input
        type="number"
        value={seconds}
        onChange={handleSecondsChange}
        min="0"
        max="59"
        style={{ width: '50px' }}
      />
    </div>
  );
};

export default TimeInput;
