import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, Calendar, Clock, AlertCircle, Building2, Users } from 'lucide-react';

const STANDARD_SLOTS = [
  "09:00 AM - 11:00 AM",
  "11:30 AM - 01:30 PM",
  "02:00 PM - 04:00 PM",
  "04:30 PM - 06:30 PM"
];

export default function MultiBookingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { venues, department } = location.state || {};

  // Use state to prevent rendering if navigated directly without state
  useEffect(() => {
    if (!venues || venues.length === 0) {
      toast.error('No venues selected for multi-booking.');
      navigate('/venues');
    }
  }, [venues, navigate]);

  // Booking Form State
  const [bookingDate, setBookingDate] = useState('');
  const [bookingPurpose, setBookingPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(false);

  // Slot State (disabled slots because AT LEAST ONE selected venue is booked)
  const [disabledSlots, setDisabledSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [requirements, setRequirements] = useState('');

  // Custom Time State
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  useEffect(() => {
    if (bookingDate && venues?.length > 0) {
      fetchOverallBookedSlots();
      setSelectedSlots([]);
      setIsCustomTime(false);
    } else {
      setDisabledSlots([]);
    }
  }, [bookingDate]);

  const fetchOverallBookedSlots = async () => {
    try {
      setFetchingSlots(true);

      // Fetch booked slots for all selected venues in parallel
      const promises = venues.map(v =>
        api.get(`/booking/venue/${v._id}/booked-slots?date=${bookingDate}`)
      );

      const results = await Promise.all(promises);

      // Combine all booked slots. If a slot is booked for ANY venue, we disable it for the whole group.
      let allBookedSlots = new Set();
      results.forEach(res => {
        if (res.data.bookedSlots) {
          res.data.bookedSlots.forEach(slot => allBookedSlots.add(slot));
        }
      });

      setDisabledSlots(Array.from(allBookedSlots));
    } catch (error) {
      console.error("Failed to fetch slots relative to chosen venues.");
      toast.error("Could not verify availability for some venues.");
    } finally {
      setFetchingSlots(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [h, m] = timeString.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour.toString().padStart(2, '0')}:${m} ${ampm}`;
  };

  const handleBookMultiple = async (e) => {
    e.preventDefault();

    if (!bookingDate) return toast.error('Please select a date');
    if (!bookingPurpose) return toast.error('Please provide a purpose');

    let finalTimeSlots = [];

    if (isCustomTime) {
      if (!customFrom || !customTo) {
        return toast.error('Please provide both start and end times for custom slot');
      }
      finalTimeSlots = [`Custom: ${formatTime(customFrom)} - ${formatTime(customTo)}`];
    } else {
      if (selectedSlots.length === 0) {
        return toast.error('Please select at least one time slot');
      }
      finalTimeSlots = selectedSlots;
    }

    setIsSubmitting(true);
    try {
      // Send array of venue IDs
      const venueIds = venues.map(v => v._id);

      await api.post('/booking/create', {
        venues: venueIds,
        date: bookingDate,
        timeSlots: finalTimeSlots,
        purpose: bookingPurpose,
        requirements: requirements
      });

      toast.success('Multi-booking successful! Your requests are pending approval.');
      navigate('/my-bookings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!venues || venues.length === 0) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">

      <div className="w-full max-w-6xl flex flex-col lg:flex-row rounded-3xl overflow-hidden shadow-2xl">

        {/* LEFT PANEL */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white relative">

          {/* Glow */}
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-400/20 blur-3xl rounded-full"></div>

          <div className="relative z-10">
            <button
              onClick={() => navigate('/venues')}
              className="flex items-center text-blue-200 hover:text-white mb-6"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Back
            </button>

            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Group Booking
            </h1>

            <p className="text-blue-200 text-sm mb-6">
              {venues.length} venues selected {department ? `in ${department.name}` : ''}
            </p>

            {/* SELECTED VENUES */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {venues.map(v => (
                <div key={v._id} className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-md">
                  <img src={v.image} className="w-12 h-12 rounded-lg object-cover" />

                  <div className="text-sm">
                    <h3 className="font-semibold">{v.name}</h3>
                    <p className="text-blue-200 text-xs">
                      Cap: {v.capacity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* INFO */}
            <div className="mt-6 text-xs bg-blue-800/50 p-3 rounded-lg">
              All venues must be available at the same time.
            </div>
          </div>

        </div>

        {/* RIGHT PANEL */}
        <div className="w-full lg:w-1/2 bg-white/70 backdrop-blur-xl p-6 sm:p-8 lg:p-10 flex items-center">

          <div className="w-full">

            <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-2">
              Secure Group Slot
            </h2>

            <p className="text-slate-500 mb-6 text-sm">
              Choose date & time for all venues
            </p>

            <form onSubmit={handleBookMultiple} className="space-y-6">

              {/* DATE */}
              <div>
                <label className="text-sm text-slate-600">Date</label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={e => setBookingDate(e.target.value)}
                  className="w-full border-b-2 border-blue-200 focus:border-blue-500 outline-none py-2 bg-transparent"
                />
              </div>

              {/* SLOT */}
              <div className={`${!bookingDate ? 'opacity-40 pointer-events-none' : ''}`}>
                <label className="text-sm text-slate-600">Time Slots</label>

                {fetchingSlots ? (
                  <div className="py-6 flex flex-col items-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <p className="text-sm text-slate-500 mt-2">Checking availability...</p>
                  </div>
                ) : isCustomTime ? (

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <input
                      type="time"
                      value={customFrom}
                      onChange={e => setCustomFrom(e.target.value)}
                      className="border-b-2 border-blue-200 focus:border-blue-500 py-2 outline-none"
                    />
                    <input
                      type="time"
                      value={customTo}
                      onChange={e => setCustomTo(e.target.value)}
                      className="border-b-2 border-blue-200 focus:border-blue-500 py-2 outline-none"
                    />
                  </div>

                ) : (

                  <div className="flex flex-wrap gap-2 mt-3">
                    {STANDARD_SLOTS.map((slot, i) => {
                      const isDisabled = disabledSlots.includes(slot);
                      const isSelected = selectedSlots.includes(slot);

                      return (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => {
                            if (isDisabled) return;
                            if (isSelected) {
                              setSelectedSlots(selectedSlots.filter(s => s !== slot));
                            } else {
                              setSelectedSlots([...selectedSlots, slot]);
                            }
                          }}
                          className={`px-3 py-2 rounded-full text-xs sm:text-sm transition-all
                        ${isDisabled
                              ? 'bg-slate-200 text-slate-400'
                              : isSelected
                                ? 'bg-blue-900 text-white scale-105'
                                : 'bg-blue-100 text-blue-800 hover:scale-105'
                            }`}
                          style={{ transitionDelay: `${i * 40}ms` }}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>

                )}
              </div>

              {/* PURPOSE */}
              <div>
                <label className="text-sm text-slate-600">Purpose</label>
                <textarea
                  value={bookingPurpose}
                  onChange={e => setBookingPurpose(e.target.value)}
                  className="w-full border-b-2 border-blue-200 focus:border-blue-500 outline-none py-2 bg-transparent"
                  rows="2"
                />
              </div>

              {/* REQUIREMENTS */}
              <div>
                <label className="text-sm text-slate-600">Requirements</label>
                <textarea
                  value={requirements}
                  onChange={e => setRequirements(e.target.value)}
                  className="w-full border-b-2 border-blue-200 focus:border-blue-500 outline-none py-2 bg-transparent"
                  rows="2"
                />
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-900 to-blue-700 text-white font-semibold hover:scale-105 transition-all"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Confirm Group Booking"
                )}
              </button>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
