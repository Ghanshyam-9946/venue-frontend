import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, Calendar, Clock, AlertCircle, Building2, Users } from 'lucide-react';

const STANDARD_SLOTS = [
  "09:35 AM - 10:35 AM",
  "10:35 AM - 11:35 AM",
  "11:35 AM - 12:35 PM",
  "12:35 PM - 01:35 PM",
  "02:10 PM - 03:10 PM",
  "03:10 PM - 04:10 PM"
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
  const [selectedRequirements, setSelectedRequirements] = useState([]);
  const [otherRequirements, setOtherRequirements] = useState('');

  // Custom Time State
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [priorityMode, setPriorityMode] = useState(false);

  useEffect(() => {
    if (bookingDate && venues?.length > 0) {
      fetchOverallBookedSlots();
      setSelectedSlots([]);
      setIsCustomTime(false);
      setPriorityMode(false);
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

    const finalRequirements = [
      ...selectedRequirements,
      (otherRequirements.trim() ? `Other: ${otherRequirements.trim()}` : '')
    ].filter(Boolean).join(", ");

    setIsSubmitting(true);
    try {
      // Send array of venue IDs
      const venueIds = venues.map(v => v._id);

      await api.post('/booking/create', {
        venues: venueIds,
        date: bookingDate,
        timeSlots: finalTimeSlots,
        purpose: bookingPurpose,
        requirements: finalRequirements
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
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-slate-600">Time Slots</label>
                  <label className="flex items-center cursor-pointer text-sm text-blue-900 font-medium bg-blue-50 px-2 py-1 rounded shadow-sm hover:bg-blue-100 transition">
                    <input 
                      type="checkbox" 
                      className="mr-2 cursor-pointer w-4 h-4 accent-blue-600"
                      checked={isCustomTime}
                      onChange={(e) => setIsCustomTime(e.target.checked)}
                    />
                    Custom Time
                  </label>
                </div>

                {fetchingSlots ? (
                  <div className="py-6 flex flex-col items-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <p className="text-sm text-slate-500 mt-2">Checking availability...</p>
                  </div>
                ) : (
                  <>
                    {/* Priority Mode Toggle */}
                    {disabledSlots.length > 0 && (
                      <div className="mb-4 animate-in slide-in-from-top-2">
                        <button
                          type="button"
                          onClick={() => setPriorityMode(!priorityMode)}
                          className={`w-full flex items-center justify-between p-3 rounded-2xl border-2 transition-all duration-300
                            ${priorityMode 
                              ? 'border-orange-200 bg-orange-50 text-orange-800 shadow-inner' 
                              : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                        >
                          <div className="flex items-center gap-2">
                            <AlertCircle className={`w-4 h-4 ${priorityMode ? 'text-orange-600 animate-pulse' : 'text-slate-400'}`} />
                            <span className="text-xs font-bold uppercase tracking-wider text-left">
                              {priorityMode ? 'Priority Mode Active' : 'Some slots booked? Request Revoke'}
                            </span>
                          </div>
                          <div className={`w-10 h-6 rounded-full relative transition-colors ${priorityMode ? 'bg-orange-600' : 'bg-slate-300'} shrink-0 ml-2`}>
                             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${priorityMode ? 'left-5' : 'left-1'}`}></div>
                          </div>
                        </button>
                        {priorityMode && (
                          <p className="text-[10px] text-orange-600 mt-2 font-medium italic animate-pulse">
                            * You can now request to revoke existing bookings for admin review.
                          </p>
                        )}
                      </div>
                    )}

                    {isCustomTime ? (

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Start Time</label>
                      <input
                        type="time"
                        value={customFrom}
                        onChange={e => setCustomFrom(e.target.value)}
                        className="w-full border-b-2 border-blue-200 focus:border-blue-500 py-2 outline-none bg-transparent font-medium text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">End Time</label>
                      <input
                        type="time"
                        value={customTo}
                        onChange={e => setCustomTo(e.target.value)}
                        className="w-full border-b-2 border-blue-200 focus:border-blue-500 py-2 outline-none bg-transparent font-medium text-slate-700"
                      />
                    </div>
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
                            if (isDisabled && !priorityMode) return;
                            if (isDisabled && priorityMode) {
                              const confirmPriority = window.confirm(
                                `One or more selected venues are already booked for "${slot}". Do you want to send a Priority Request to the Admin? \n\nIf approved, the conflicting bookings will be revoked.`
                              );
                              if (!confirmPriority) return;
                              toast.loading('Selection will be processed as a priority request.', { duration: 2000 });
                            }
                            if (isSelected) {
                              setSelectedSlots(selectedSlots.filter(s => s !== slot));
                            } else {
                              setSelectedSlots([...selectedSlots, slot]);
                            }
                          }}
                          className={`px-3 py-2 rounded-full text-xs sm:text-sm transition-all
                        ${isDisabled && !priorityMode
                              ? 'bg-slate-200 text-slate-400 border border-slate-300 opacity-40 cursor-not-allowed grayscale'
                              : isSelected
                                ? (isDisabled ? 'bg-orange-600 text-white shadow-lg ring-2 ring-orange-300' : 'bg-blue-900 text-white scale-105')
                                : (isDisabled ? 'bg-orange-50 text-orange-600 border border-orange-200 opacity-80' : 'bg-blue-100 text-blue-800 hover:scale-105')
                            }`}
                          style={{ transitionDelay: `${i * 40}ms` }}
                        >
                          {slot} {isDisabled && ' (Booked)'}
                        </button>
                      );
                    })}
                  </div>
                </>
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
                <label className="text-sm text-slate-600 mb-2 block">Requirements</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                  {[
                    "Microphone", "Projector", "Sound System",
                    "Whiteboard / Smart Board", "WiFi", "Air Conditioning",
                    "Podium", "Extension Boards", "Recording Setup"
                  ].map(req => (
                    <label key={req} className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRequirements.includes(req)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRequirements([...selectedRequirements, req]);
                          } else {
                            setSelectedRequirements(selectedRequirements.filter(r => r !== req));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 accent-blue-600"
                      />
                      <span className="truncate" title={req}>{req}</span>
                    </label>
                  ))}
                </div>
                
                <label className="text-xs text-slate-500 block mb-1">Other Requirements</label>
                <input
                  type="text"
                  value={otherRequirements}
                  onChange={e => setOtherRequirements(e.target.value)}
                  placeholder="Type any other requirements..."
                  className="w-full border-b-2 border-blue-200 focus:border-blue-500 outline-none py-2 bg-transparent"
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
