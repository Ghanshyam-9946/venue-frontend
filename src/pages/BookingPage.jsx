import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, Users, MapPin, Calendar, Clock, AlertCircle, XCircle } from 'lucide-react';

const STANDARD_SLOTS = [
  "09:35 AM - 10:35 AM",
  "10:35 AM - 11:35 AM",
  "11:35 AM - 12:35 PM",
  "12:35 PM - 01:35 PM",
  "02:10 PM - 03:10 PM",
  "03:10 PM - 04:10 PM"
];

export default function BookingPage() {
  const { id: venueId } = useParams();
  const navigate = useNavigate();

  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [bookingDates, setBookingDates] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [bookingPurpose, setBookingPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Slot State
  const [bookedSlots, setBookedSlots] = useState([]);
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
    fetchVenueDetails();
  }, [venueId]);

  useEffect(() => {
    if (bookingDates.length > 0) {
      // Fetch slots for the first selected date for preview (since slots vary by date)
      fetchBookedSlots(bookingDates[0]);
      // Reset slots when dates change significantly? Maybe just keep them.
      // For simplicity, we'll fetch slots for the MOST RECENTLY added date.
    } else {
      setBookedSlots([]);
      setPendingSlots([]);
    }
  }, [bookingDates]);

  const fetchVenueDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/venue/${venueId}`);
      setVenue(res.data.venue);
    } catch (error) {
      toast.error('Failed to load venue details');
      navigate('/venues');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookedSlots = async (date) => {
    try {
      const res = await api.get(`/booking/venue/${venueId}/booked-slots?date=${date}`);
      setBookedSlots(res.data.bookedSlots || []);
      setPendingSlots(res.data.pendingSlots || []);
    } catch (error) {
      console.error("Failed to fetch booked slots");
    }
  };

  // Convert "09:35 AM" to minutes from midnight
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [time, ampm] = timeStr.trim().split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const isSlotOverlapping = (start1, end1, start2, end2) => {
    return start1 < end2 && start2 < end1;
  };

  const isSlotStringOverlapping = (slotA, slotB) => {
    if (!slotA || !slotB) return false;
    const cleanA = slotA.replace("Custom: ", "");
    const cleanB = slotB.replace("Custom: ", "");
    const partsA = cleanA.split(" - ");
    const partsB = cleanB.split(" - ");
    if (partsA.length < 2 || partsB.length < 2) return slotA === slotB;
    return isSlotOverlapping(
      parseTimeToMinutes(partsA[0]),
      parseTimeToMinutes(partsA[1]),
      parseTimeToMinutes(partsB[0]),
      parseTimeToMinutes(partsB[1])
    );
  };

  const checkCustomOverlap = () => {
    if (!customFrom || !customTo) return null;
    
    const start = parseTimeToMinutes(formatTime(customFrom));
    const end = parseTimeToMinutes(formatTime(customTo));
    const allRelevantSlots = [...bookedSlots, ...pendingSlots];

    for (const slot of allRelevantSlots) {
      const cleanSlot = slot.replace("Custom: ", "");
      const [sStr, eStr] = cleanSlot.split(" - ");
      const s = parseTimeToMinutes(sStr);
      const e = parseTimeToMinutes(eStr);
      
      if (isSlotOverlapping(start, end, s, e)) {
        return slot;
      }
    }
    return null;
  };

  // Convert "13:00" to "01:00 PM"
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [h, m] = timeString.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour.toString().padStart(2, '0')}:${m} ${ampm}`;
  };

  const handleBookVenue = async (e) => {
    e.preventDefault();

    if (bookingDates.length === 0) return toast.error('Please select at least one date');
    if (!bookingPurpose) return toast.error('Please provide a purpose');

    let finalTimeSlots = [];

    if (isCustomTime) {
      if (!customFrom || !customTo) {
        return toast.error('Please provide both start and end times for custom slot');
      }
      
      const overlapSlot = checkCustomOverlap();
      if (overlapSlot && !priorityMode) {
        return toast.error(`Your custom time overlaps with an existing booking: ${overlapSlot}. Enable Priority Mode to request it.`);
      }
      
      if (overlapSlot && priorityMode && !priorityReason.trim()) {
         return toast.error("Justification is required for priority requests");
      }
      
      finalTimeSlots = [`Custom: ${formatTime(customFrom)} - ${formatTime(customTo)}`];
    } else {
      if (selectedSlots.length === 0) {
        return toast.error('Please select at least one time slot');
      }
      
      const isAnyConflict = selectedSlots.some(s => bookedSlots.includes(s));
      if (isAnyConflict && priorityMode && !priorityReason.trim()) {
        return toast.error("Justification is required for priority requests");
      }
      
      finalTimeSlots = selectedSlots;
    }

    const isAnyConflict = isCustomTime ? !!checkCustomOverlap() : selectedSlots.some(s => bookedSlots.includes(s));

    const finalRequirements = [
      ...selectedRequirements,
      (otherRequirements.trim() ? `Other: ${otherRequirements.trim()}` : '')
    ].filter(Boolean).join(", ");

    setIsSubmitting(true);
    try {
      await api.post('/booking/create', {
        venue: venueId,
        date: bookingDates, // Send array
        timeSlots: finalTimeSlots,
        purpose: bookingPurpose,
        requirements: finalRequirements,
        priorityReason: isAnyConflict ? priorityReason : ""
      });
      toast.success('Booking request submitted successfully!');
      navigate('/my-bookings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center flex-col items-center h-[70vh]">
        <Loader2 className="w-12 h-12 text-brand-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Loading venue experience...</p>
      </div>
    );
  }

  if (!venue) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">

      {/* MAIN CONTAINER */}
      <div className="w-full max-w-6xl flex flex-col lg:flex-row rounded-3xl overflow-hidden shadow-2xl">

        {/* LEFT */}
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

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              {venue.name}
            </h1>

            <div className="space-y-2 text-blue-100 text-sm sm:text-base">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                {venue.location}
              </div>

              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                {venue.capacity} capacity
              </div>
            </div>

            <p className="mt-4 text-blue-200 text-sm text-justify">
              {venue.description}
            </p>
          </div>

          {/* Image */}
          <div className="z-10 transform hover:scale-105 transition duration-500">
            <img
              src={venue.image}
              className="w-full h-56 sm:h-64 lg:h-72 object-cover rounded-2xl shadow-lg"
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-full lg:w-1/2 bg-white/70 backdrop-blur-xl p-6 sm:p-8 lg:p-10 flex items-center">

          <div className="w-full">

            <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-1">
              Book Your Slot
            </h2>

            <p className="text-sm text-slate-500 mb-6">
              Complete your booking
            </p>

            <form onSubmit={handleBookVenue} className="space-y-6">

              {/* DATE SELECTION (POPUP CALENDAR) */}
              <div className="relative">
                <label className="text-sm text-slate-600 font-bold mb-2 block">Booking Dates</label>
                <button
                  type="button"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="w-full flex items-center justify-between bg-blue-50 border-2 border-blue-100 hover:border-blue-300 px-4 py-3 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-200">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Select Dates</p>
                      <p className="text-sm font-bold text-slate-700">
                        {bookingDates.length === 0 
                          ? "Tap to choose dates" 
                          : `${bookingDates.length} Date(s) selected`}
                      </p>
                    </div>
                  </div>
                  <div className={`transition-transform duration-300 ${showCalendar ? 'rotate-180' : ''}`}>
                    <AlertCircle className="w-5 h-5 text-blue-300" />
                  </div>
                </button>

                {/* Calendar Dropdown */}
                {showCalendar && (
                  <div className="absolute top-full left-0 right-0 mt-3 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl border border-blue-100 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Dates on Calendar</label>
                        <button 
                          type="button" 
                          onClick={() => setShowCalendar(false)}
                          className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black hover:bg-blue-700 transition"
                        >
                          DONE
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                          <div key={d} className="text-center text-[10px] font-black text-slate-300 py-1">{d}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1 max-h-64 overflow-y-auto pr-1 scrollbar-hide">
                        {(() => {
                          const today = new Date();
                          const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                          
                          const days = [];
                          for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
                            days.push(<div key={`pad-${i}`} className="h-10"></div>);
                          }
                          
                          for (let i = 0; i < 60; i++) {
                            const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
                            const iso = d.toISOString().split('T')[0];
                            const isSelected = bookingDates.includes(iso);
                            const isToday = d.toDateString() === today.toDateString();
                            
                            days.push(
                              <button
                                key={iso}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setBookingDates(bookingDates.filter(date => date !== iso));
                                  } else {
                                    setBookingDates([...bookingDates, iso].sort());
                                  }
                                }}
                                className={`h-10 w-full rounded-xl text-xs font-bold transition-all flex items-center justify-center relative
                                  ${isSelected 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                                    : 'hover:bg-blue-50 text-slate-600'}
                                  ${isToday && !isSelected ? 'border-2 border-blue-100' : ''}`}
                              >
                                {d.getDate()}
                                {isToday && <span className={`absolute bottom-1.5 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-600'}`}></span>}
                              </button>
                            );
                          }
                          return days;
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected Summary Tags (Outside) */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {bookingDates.map(date => (
                    <div key={date} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-2 border border-blue-200 animate-in slide-in-from-left-2">
                      {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      <button type="button" onClick={() => setBookingDates(bookingDates.filter(d => d !== date))}>
                        <XCircle className="w-3.5 h-3.5 hover:text-red-500 transition-colors" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SLOTS */}
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

                {/* Priority Mode Toggle - Only show if there are booked slots */}
                {bookedSlots.length > 0 && (
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
                        <span className="text-xs font-bold uppercase tracking-wider">
                          {priorityMode ? 'Priority Mode Active' : 'Request a Booked Slot?'}
                        </span>
                      </div>
                      <div className={`w-10 h-6 rounded-full relative transition-colors ${priorityMode ? 'bg-orange-600' : 'bg-slate-300'}`}>
                         <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${priorityMode ? 'left-5' : 'left-1'}`}></div>
                      </div>
                    </button>

                    {isCustomTime && checkCustomOverlap() && (
                      <div className="mt-3 p-3 rounded-xl bg-orange-50 border border-orange-200 animate-in slide-in-from-left-2">
                        <div className="flex items-center gap-2 text-orange-700 text-xs font-bold uppercase mb-1">
                          <AlertCircle className="w-4 h-4" />
                          Conflict Detected
                        </div>
                        <p className="text-[11px] text-orange-600">
                          Your custom time overlaps with: <span className="font-bold">{checkCustomOverlap()}</span>. 
                          {priorityMode ? " You can proceed as a priority request." : " Please enable Priority Mode above or change times."}
                        </p>
                      </div>
                    )}

                    {priorityMode && (
                      <div className="mt-4 p-4 rounded-2xl bg-orange-50 border-2 border-orange-200 animate-in slide-in-from-top-4 duration-500 shadow-inner">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-5 h-5 text-orange-600 animate-pulse" />
                          <label className="text-sm font-black text-orange-800 uppercase tracking-tighter">
                            Reason for Priority Request
                          </label>
                        </div>
                        <textarea
                          placeholder="Please explain why this booking is urgent (e.g., 'National Seminar with External Guests'). This will be reviewed by the HOD."
                          value={priorityReason}
                          onChange={(e) => setPriorityReason(e.target.value)}
                          className="w-full p-3 rounded-xl bg-white border border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm text-slate-700 transition-all placeholder:text-slate-400 min-h-[100px]"
                          required
                        />
                        <p className="text-[10px] text-orange-600 mt-2 font-medium italic">
                          * If approved, the existing booking will be revoked with your reason provided as justification.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {isCustomTime ? (
                  <div className="grid grid-cols-2 gap-3 mt-2">
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
                  <div className="flex flex-wrap gap-2 mt-2">
                    {STANDARD_SLOTS.map((slot, i) => {
                      const isSelected = selectedSlots.includes(slot);
                      const isBooked = bookedSlots.some(bs => isSlotStringOverlapping(bs, slot));
                      const isPending = pendingSlots.some(ps => isSlotStringOverlapping(ps, slot));
                      const isOccupied = isBooked || isPending;

                      return (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => {
                            if (isOccupied && !priorityMode) return;
                            if (isOccupied && priorityMode) {
                              const reason = window.prompt(
                                `${isBooked ? 'Booked' : 'Pending Approval'}: Slot "${slot}" currently has a request. To request on priority, please provide a justification/reason for the HOD and Superadmin:`
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
                          className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm transition-all duration-300
                        ${isBooked && !priorityMode
                              ? 'bg-slate-200 text-slate-400 border border-slate-300 opacity-40 cursor-not-allowed grayscale'
                              : isPending && !priorityMode
                                ? 'bg-orange-50 text-orange-400 border border-orange-200 border-dashed opacity-70 cursor-not-allowed'
                                : isSelected
                                  ? (isOccupied ? 'bg-orange-600 text-white shadow-lg ring-2 ring-orange-300' : 'bg-blue-900 text-white scale-105 shadow-md')
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
                disabled={isSubmitting || (priorityMode && (isCustomTime ? !!checkCustomOverlap() : selectedSlots.some(s => bookedSlots.includes(s))) && !priorityReason.trim())}
                className={`w-full py-3 rounded-xl text-white font-semibold hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg 
                  ${(priorityMode && (isCustomTime ? !!checkCustomOverlap() : selectedSlots.some(s => bookedSlots.includes(s))) && !priorityReason.trim())
                    ? 'bg-slate-400 cursor-not-allowed grayscale'
                    : 'bg-gradient-to-r from-blue-900 to-blue-700'}`}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Confirm Booking"
                )}
              </button>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

