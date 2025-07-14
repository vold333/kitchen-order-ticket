import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card, CardContent, Button, TextField, Checkbox, FormControlLabel, Paper, Grid } from "@mui/material";
import { FaRegCalendarAlt } from "react-icons/fa";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import api from "../../../services/api";

const localizer = momentLocalizer(moment);

const CalendarAdmin = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openingTime, setOpeningTime] = useState("");
  const [closingTime, setClosingTime] = useState("");
  const [isHoliday, setIsHoliday] = useState(false);
  const [defaultOpening, setDefaultOpening] = useState("10:00");
  const [defaultClosing, setDefaultClosing] = useState("22:00");
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchDefaultTimings();
    fetchSchedules();
  }, []);

  const fetchDefaultTimings = async () => {
    try {
      const response = await api.get("/res-settings/");
      setDefaultOpening(response.data.opening_time);
      setDefaultClosing(response.data.closing_time);
      setOpeningTime(response.data.opening_time);
      setClosingTime(response.data.closing_time);
    } catch (error) {
      console.error("Error fetching default timings", error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await api.get("/res-schedule/all");
      const formattedEvents = response.data.map((schedule) => ({
        title: schedule.is_holiday ? "Holiday" : `Open: ${schedule.opening_time} - Close: ${schedule.closing_time}`,
        start: new Date(schedule.date),
        end: new Date(schedule.date),
        allDay: true,
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching schedules", error);
    }
  };

  const handleSetDefaultTimings = async () => {
    try {
      await api.post("/res-settings/set", {
        opening_time: defaultOpening,
        closing_time: defaultClosing,
      });
      toast.success("Default timings updated!");
    } catch (error) {
      toast.error("Failed to update default timings");
    }
  };

  const handleSetSchedule = async () => {
    try {
      await api.post("/res-schedule/set", {
        date: selectedDate.toISOString().split("T")[0],
        opening_time: isHoliday ? null : openingTime + ":00",
        closing_time: isHoliday ? null : closingTime + ":00",
        is_holiday: isHoliday,
      });
      toast.success("Schedule updated!");
      fetchSchedules();
    } catch (error) {
      toast.error("Failed to update schedule");
    }
  };

  return (
    <div className="p-3 bg-gray-200 h-full">
      <h1 className="text-2xl font-bold mb-4 text-center text-secondary">Restaurant Calendar</h1>

      {/* Default Timings & Special Schedule Side-by-Side */}
      <Grid container spacing={4}>
        {/* Default Timings Section */}
        <Grid item xs={12} sm={6}>
          <Paper elevation={4} sx={{borderRadius: "20px"}} className="p-4 shadow-md bg-white">
            <h2 className="text-xl font-semibold mb-4">Set Default Timings</h2>
            <div className="flex flex-row space-x-4 mb-4">
              <TextField
                type="time"
                label="Opening Time"
                value={defaultOpening}
                onChange={(e) => setDefaultOpening(e.target.value)}
                fullWidth
              />
              <TextField
                type="time"
                label="Closing Time"
                value={defaultClosing}
                onChange={(e) => setDefaultClosing(e.target.value)}
                fullWidth
              />             
            </div>
            <div className="flex justify-center">
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleSetDefaultTimings}
                    sx={{ 
                        backgroundColor: '#dbeafe', 
                        fontWeight: 'bold',
                        borderRadius: '10px',    
                        color: '#172554',         
                        textTransform: 'none'
                    }}
                >
                    Save
                </Button>
            </div>
          </Paper>
        </Grid>

        {/* Special Schedule Section */}
        <Grid item xs={12} sm={6}>
          <Paper elevation={4} sx={{borderRadius: "20px"}} className="p-4 shadow-md bg-white">
            <h2 className="text-xl font-semibold mb-4">Set Special Schedule / Holiday</h2>
            <div className="flex items-center space-x-2 mb-4">
             <FaRegCalendarAlt fontSize="large" />
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                className="border rounded p-2 w-2/3"
              />            
            
                <FormControlLabel
                control={<Checkbox checked={isHoliday} onChange={(e) => setIsHoliday(e.target.checked)} />}
                label="Mark as Holiday"
                />
            </div>
            {!isHoliday && (
              <div className="flex flex-row space-x-4 mt-4 mb-4">
                <TextField
                  type="time"
                  label="Opening Time"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  fullWidth
                />
                <TextField
                  type="time"
                  label="Closing Time"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  fullWidth
                />
              </div>
            )}
            <div className="flex justify-center">
                <Button variant="contained" color="secondary" className="mt-4" onClick={handleSetSchedule}
                    sx={{ 
                        backgroundColor: '#dbeafe', 
                        fontWeight: 'bold',
                        borderRadius: '10px',    
                        color: '#172554',         
                        textTransform: 'none'
                    }}
                >
                    Save Schedule
                </Button>
            </div>
          </Paper>
        </Grid>
      </Grid>

      {/* Restaurant Schedule Calendar */}
      <Paper elevation={4} sx={{borderRadius: "20px"}} className="p-4 shadow-md bg-white mt-6">
        <h2 className="text-xl font-semibold mb-4">Restaurant Schedule</h2>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 450 }}
          popup
        />
      </Paper>
      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />
    </div>
  );
};

export default CalendarAdmin;