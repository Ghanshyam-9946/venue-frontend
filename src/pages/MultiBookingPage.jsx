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
  const [bookingDates, setBookingDates] = useState([]);
  const [dateInput, setDateInput] = useState('');
  const [bookingPurpose, setBookingPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(false);

  // Slot State (disabled slots because AT LEAST ONE selected venue is booked)
  const [disabledSlots, setDisabledSlots] = useState([]);
  const [pendingSlots, setPendingSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectedRequirements, setSelectedRequirements] = useState([]);
  const [otherRequirements, setOtherRequirements] = useState('');

  // Custom Time State
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [priorityMode, setPriorityMode] = useState(false);
  const [priorityReason, setPriorityReason] = useState('');

  useEffect(() => {
    if (bookingDate && venues?.length > 0) {
      fetchOverallBookedSlots();
      setSelectedSlots([]);
      setIsCustomTime(false);
      setPriorityMode(false);
    } else {
      setDisabledSlots([]);
      setPendingSlots([]);
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
      let allPendingSlots = new Set();
      
      results.forEach(res => {
        if (res.data.bookedSlots) {
          res.data.bookedSlots.forEach(slot => allBookedSlots.add(slot));
        }
        if (res.data.pendingSlots) {
          res.data.pendingSlots.forEach(slot => allPendingSlots.add(slot));
        }
      });
 
      setDisabledSlots(Array.from(allBookedSlots));
      // Remove any slots from pending that are already in booked (booked takes precedence)
      setPendingSlots(Array.from(allPendingSlots).filter(s => !allBookedSlots.has(s)));
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

  const isSlotOverlapping = (start1, end1, start2, end2) => {
    return start1 < end2 && start2 < end1;
  };

  const checkCustomOverlap = () => {
    if (!customFrom || !customTo) return null;
    
    const start = parseTimeToMinutes(formatTime(customFrom));
    const end = parseTimeToMinutes(formatTime(customTo));
    const allOccupiedSlots = [...disabledSlots, ...pendingSlots];

    for (const slot of allOccupiedSlots) {
      if (!slot) continue;
      const cleanSlot = slot.replace("Custom: ", "");
      const [startStr, endStr] = cleanSlot.split(" - ");
      
      const bStart = parseTimeToMinutes(startStr);
      const bEnd = parseTimeToMinutes(endStr);

      if (isSlotOverlapping(start, end, bStart, bEnd)) {
        return slot;
      }
    }
    return null;
  };

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [time, ampm] = timeStr.trim().split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const handleBookMultiple = async (e) => {
    e.preventDefault();

    if (bookingDates.length === 0) return toast.error('Please select at least one date');
    if (!bookingPurpose) return toast.error('Please provide a purpose');

    const finalRequirements = [
      ...selectedRequirements,
      (otherRequirements.trim() ? `Other: ${otherRequirements.trim()}` : '')
    ].filter(Boolean).join(", ");

    let finalTimeSlots = [];
    let isAnyConflict = false;

    if (isCustomTime) {
      if (!customFrom || !customTo) {
        return toast.error('Please provide both start and end times for custom slot');
      }
      const overlapSlot = checkCustomOverlap();
      if (overlapSlot) {
        if (!priorityMode) {
          return toast.error(`Your custom time overlaps with an existing booking in one of the venues: ${overlapSlot}. Enable Priority Mode to request it.`);
        }
        if (!priorityReason.trim()) {
           return toast.error("Justification is required for priority requests");
        }
        isAnyConflict = true;
      }
      finalTimeSlots = [`Custom: ${formatTime(customFrom)} - ${formatTime(customTo)}`];
    } else {
      if (selectedSlots.length === 0) {
        return toast.error('Please select at least one time slot');
      }
      isAnyConflict = selectedSlots.some(s => disabledSlots.includes(s));
      if (isAnyConflict) {
        if (!priorityMode) {
          return toast.error("One or more selected slots are already booked. Enable Priority Mode to request them.");
        }
        if (!priorityReason.trim()) {
          return toast.error("Justification is required for priority requests");
        }
      }
      finalTimeSlots = selectedSlots;
    }

    setIsSubmitting(true);
    try {
      const venueIds = venues.map(v => v._id);
      await api.post('/booking/create', {
        venues: venueIds,
        date: bookingDates, // Send array
        timeSlots: finalTimeSlots,
        purpose: bookingPurpose,
        requirements: finalRequirements,
        priorityReason: (isAnyConflict && priorityMode) ? priorityReason : ""
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

              {/* DATE SELECTION */}
              <div>
                <label className="text-sm text-slate-600 font-bold mb-2 block">Booking Dates</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={dateInput}
                    onChange={e => setDateInput(e.target.value)}
                    className="flex-1 border-b-2 border-blue-200 focus:border-blue-500 outline-none py-2 bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!dateInput) return;
                      if (bookingDates.includes(dateInput)) return toast.error('Date already added');
                      setBookingDates([...bookingDates, dateInput].sort());
                      setDateInput('');
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition"
                  >
                    Add Date
                  </button>
                </div>

                {/* Selected Dates Tags */}
                <div className="flex flex-wrap gap-2 min-h-[40px]">
                  {bookingDates.length === 0 ? (
                    <p className="text-xs text-slate-400 italic mt-1">No dates selected yet</p>
                  ) : (
                    bookingDates.map(date => (
                      <div key={date} className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full text-xs font-bold text-blue-700 animate-in zoom-in-95">
                        <Calendar className="w-3.5 h-3.5" />
                        {date}
                        <button
                          type="button"
                          onClick={() => setBookingDates(bookingDates.filter(d => d !== date))}
                          className="hover:text-red-500 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* SLOT */}
              <div className={`${bookingDates.length === 0 ? 'opacity-40 pointer-events-none' : ''}`}>
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
                          <div className="mt-4 p-4 rounded-2xl bg-orange-50 border-2 border-orange-200 animate-in slide-in-from-top-4 duration-500 shadow-inner text-left">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="w-5 h-5 text-orange-600 animate-pulse" />
                              <label className="text-sm font-black text-orange-800 uppercase tracking-tighter">
                                Reason for Priority Request
                              </label>
                            </div>
                            <textarea
                              placeholder="Please explain why this group booking is urgent. This justification will be used to review conflicting bookings in all selected venues."
                              value={priorityReason}
                              onChange={(e) => setPriorityReason(e.target.value)}
                              className="w-full p-3 rounded-xl bg-white border border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm text-slate-700 transition-all placeholder:text-slate-400 min-h-[100px]"
                              required
                            />
                            <p className="text-[10px] text-orange-600 mt-2 font-medium italic">
                              * If approved, conflicting bookings in ANY of the selected venues will be revoked.
                            </p>
                          </div>
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
                      const isBooked = disabledSlots.includes(slot);
                      const isPending = pendingSlots.includes(slot);
                      const isOccupied = isBooked || isPending;
                      const isSelected = selectedSlots.includes(slot);

                      return (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => {
                            if (isOccupied && !priorityMode) return;
                            if (isOccupied && priorityMode) {
                              const reason = window.prompt(
                                `${isBooked ? 'Booked' : 'Pending Approval'}: Slot "${slot}" has existing requests. To request on priority, please provide a justification for HOD/SuperAdmin:`
                              );
                              if (!reason) {
                                toast.error('Justification is required for priority requests');
                                return;
                              }
                              setPriorityReason(reason);
                              toast.success('Priority justification recorded.');
                            }
                            if (isSelected) {
                              setSelectedSlots(selectedSlots.filter(s => s !== slot));
                            } else {
                              setSelectedSlots([...selectedSlots, slot]);
                            }
                          }}
                          className={`px-3 py-2 rounded-full text-xs sm:text-sm transition-all
                        ${isBooked && !priorityMode
                                ? 'bg-slate-200 text-slate-400 border border-slate-300 opacity-40 cursor-not-allowed grayscale'
                                : isPending && !priorityMode
                                  ? 'bg-orange-50 text-orange-400 border border-orange-200 border-dashed opacity-70 cursor-not-allowed'
                                  : isSelected
                                    ? (isOccupied ? 'bg-orange-600 text-white shadow-lg ring-2 ring-orange-300' : 'bg-blue-900 text-white scale-105')
                                    : (isOccupied ? 'bg-orange-50 text-orange-600 border border-orange-200 opacity-80' : 'bg-blue-100 text-blue-800 hover:scale-105')
                            }`}
                          style={{ transitionDelay: `${i * 40}ms` }}
                        >
                          {slot} {isBooked ? ' (Booked)' : (isPending ? ' (Pending)' : '')}
                        </button>
                      );
                    })}
                    </div>
                  )}
                </>
              )}
            </div>

              {/* PURPOSE */}
              <div>
                <label className="text-sm text-slate-600">Purpose <span className="text-red-500 font-bold">*</span></label>
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
                    "Podium", "Extension Boards", "Recording Setup",
                    "Lamp Lighting", "Photographer"
                  ].map(req => (
                    <label key={req} className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer">
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
                        className="w-4 h-4 mt-0.5 shrink-0 accent-blue-600 cursor-pointer rounded"
                      />
                      <span className="leading-tight" title={req}>{req}</span>
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
                disabled={isSubmitting || (priorityMode && (isCustomTime ? false : selectedSlots.some(s => disabledSlots.includes(s))) && !priorityReason.trim())}
                className={`w-full py-3 rounded-xl text-white font-semibold hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg 
                  ${(priorityMode && (isCustomTime ? false : selectedSlots.some(s => disabledSlots.includes(s))) && !priorityReason.trim())
                    ? 'bg-slate-400 cursor-not-allowed grayscale'
                    : 'bg-gradient-to-r from-blue-900 to-blue-700'}`}
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

