import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Menu, X, MapPin, Users, CheckCircle,
  ChevronRight, CalendarDays, Building, Phone, Mail,
  Download, Clock, CheckCheck, Loader2
} from 'lucide-react';


const STANDARD_SLOTS = [
  "09:35 AM - 10:35 AM",
  "10:35 AM - 11:35 AM",
  "11:35 AM - 12:35 PM",
  "12:35 PM - 01:35 PM",
  "02:10 PM - 03:10 PM",
  "03:10 PM - 04:10 PM"
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-xl shadow-sm p-1 w-12 h-12 flex items-center justify-center overflow-hidden">
            <img src="/SISTec_Logo.png" alt="SISTec Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className={`text-xl font-extrabold tracking-tight ${scrolled ? 'text-slate-800' : 'text-white'}`}>SISTec</h1>
            <p className={`text-xs uppercase tracking-widest font-semibold ${scrolled ? 'text-blue-600' : 'text-blue-300'}`}>Event Organizer</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-7 py-2.5 text-sm font-semibold rounded-full shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105">
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-7 py-2.5 text-sm font-semibold rounded-full shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105">
            Registration
          </button>
        </div>

        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className={scrolled ? 'text-slate-800' : 'text-white'} /> : <Menu className={scrolled ? 'text-slate-800' : 'text-white'} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl px-6 py-6 absolute w-full left-0 top-full shadow-2xl flex flex-col gap-4 border-t border-slate-100">
          <button onClick={() => navigate('/login')} className="bg-gradient-to-r from-blue-600 to-indigo-600 w-full py-3 flex items-center justify-center rounded-xl font-semibold text-white shadow-lg shadow-blue-500/20">Login</button>
          <button onClick={() => navigate('/register')} className="bg-gradient-to-r from-blue-600 to-indigo-600 w-full py-3 flex items-center justify-center rounded-xl font-semibold text-white shadow-lg shadow-blue-500/20">Registration</button>
        </div>
      )}
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative h-[75vh] md:h-[90vh] w-full pt-[76px] bg-[#030712] overflow-hidden">
      <div className="w-full h-full flex flex-row gap-4 md:gap-6 p-4 md:p-6 relative">
        <div className="flex-1 overflow-hidden group rounded-2xl md:rounded-[2.5rem] shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/5 relative">
          <img src="/hero1.jpeg" alt="Campus 1" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
        </div>
        <div className="flex-1 overflow-hidden group rounded-2xl md:rounded-[2.5rem] shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/5 relative">
          <img src="/hero2.jpeg" alt="Campus 2" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
        </div>
        <div className="flex-1 overflow-hidden group rounded-2xl md:rounded-[2.5rem] shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/5 relative">
          <img src="/hero3.jpeg" alt="Campus 3" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
        </div>


        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-slate-900/70 backdrop-blur-md px-10 py-6 md:px-16 md:py-10 rounded-full border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.4)] animate-pulse">
            <h1 className="text-4xl md:text-7xl font-serif italic text-slate-100 text-center tracking-normal drop-shadow-lg">
              Welcome to <span className="font-sans not-italic font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">SEO</span>
            </h1>
            <p className="text-2xl md:text-3xl font-large text-slate-200 text-center mt-2">Sagar Event Organizer</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const Process = () => {
  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">How It Works</h2>
          <p className="text-slate-500 text-lg">A simple 3-step process to secure your desired venue.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">

          <div className="hidden md:block absolute top-[50px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 z-0"></div>

          <div className="relative z-10 flex flex-col items-center text-center group">
            <div className="w-24 h-24 bg-white rounded-3xl shadow-xl shadow-blue-900/5 flex items-center justify-center mb-6 transform transition-transform group-hover:-translate-y-2 duration-300">
              <CalendarDays className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">1. Check Slot</h3>
            <p className="text-slate-500 leading-relaxed max-w-xs">View real-time availability on our interactive campus calendar.</p>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center group">
            <div className="w-24 h-24 bg-white rounded-3xl shadow-xl shadow-blue-900/5 flex items-center justify-center mb-6 transform transition-transform group-hover:-translate-y-2 duration-300 delay-75">
              <Building className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">2. Submit Details</h3>
            <p className="text-slate-500 leading-relaxed max-w-xs">Fill in your event info and infrastructure requirements easily.</p>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center group">
            <div className="w-24 h-24 bg-white rounded-3xl shadow-xl shadow-blue-900/5 flex items-center justify-center mb-6 transform transition-transform group-hover:-translate-y-2 duration-300 delay-150">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">3. Get Approval</h3>
            <p className="text-slate-500 leading-relaxed max-w-xs">Requests are quickly routed to department heads for clearance.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const ProjectOverview = () => {
  const images = [
    "/Atp1.jpeg",
    "/Atp2.jpeg",
    "/Atp3.jpeg",
    "/Atp4.jpeg"
  ];
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <section className="py-24 bg-white overflow-hidden border-t border-slate-100">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left Side - Project Details */}
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-700 font-bold tracking-wide text-sm border border-indigo-100 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              About The Project
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              A Smarter Way to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Manage Campus Spaces</span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed font-medium text-justify">
              We developed this platform to eliminate the friction in facility booking by integrating real-time scheduling with seamless administrative approval flows.
            </p>
            <p className="text-slate-500 leading-relaxed text-justify">
              Custom-built for SISTec, it ensures that every event, seminar, or workshop gets the perfect space without unexpected overlaps or endless paper trails. Experience the future of academic facility management today.
            </p>

          </div>

          {/* Right Side - Image Slider */}
          <div className="flex-1 w-full relative">
            <div className="relative h-[400px] md:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10 border border-slate-100 group bg-slate-50">
              {images.map((img, idx) => {
                let transformClass = 'translate-x-full scale-105 opacity-0';
                if (idx === currentIdx) {
                  transformClass = 'translate-x-0 scale-100 opacity-100 z-10';
                } else if (idx === (currentIdx - 1 + images.length) % images.length) {
                  transformClass = '-translate-x-full scale-105 opacity-0';
                }

                return (
                  <img
                    key={idx}
                    src={img}
                    alt={`Project Slide ${idx + 1}`}
                    className={`absolute inset-0 w-full h-full object-contain p-2 md:p-4 transition-all duration-1000 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] ${transformClass}`}
                  />
                )
              })}

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-20 pointer-events-none" />

              {/* Slider Quick Nav */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-30 bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/20">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-2 rounded-full transition-all duration-500 ${idx === currentIdx ? 'w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'w-2 bg-white/50 hover:bg-white/90'}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Ambient Background Glow */}
            <div className="absolute top-10 -right-10 w-64 h-64 bg-blue-400/20 rounded-full blur-[80px] -z-10" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-400/20 rounded-full blur-[80px] -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

const Venues = () => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/booking/venues')
      .then(res => {
        if (res.data.success) {
          setVenues(res.data.venues);
        }
      })
      .catch(err => console.error("Venues fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
    </div>
  );

  if (venues.length === 0) return null;

  // Duplicate for infinite continuous sliding
  const marqueeVenues = [...venues, ...venues, ...venues];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.3333%); }
          }
          .animate-marquee {
            animation: marquee ${venues.length * 5}s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}
      </style>
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Discover Spaces</h2>
            <p className="text-slate-500 text-lg">Browse our premium facilities equipped with top-tier amenities.</p>
          </div>
        </div>
      </div>

      <div className="w-full relative px-6 md:px-0">
        <div className="flex gap-8 w-max animate-marquee pb-10">
          {marqueeVenues.map((venue, i) => (
            <div key={i} className="w-[300px] md:w-[350px] shrink-0 group bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 transform hover:-translate-y-2 flex flex-col">
              <div className="h-48 overflow-hidden relative p-2">
                <img
                  src={venue.image || "/lac.jpeg"}
                  alt={venue.name}
                  className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-bold text-slate-800 text-xl mb-2">{venue.name}</h3>

                <div className="flex items-center text-blue-600 mb-6 bg-blue-50 w-max px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-blue-100">
                  <Users className="w-3.5 h-3.5 mr-1.5" />
                  Capacity: {venue.capacity}
                </div>

                <div className="mb-6 space-y-2 flex-grow">
                  <span className="text-[11px] text-slate-400 uppercase font-black tracking-wider block mb-3">Included Amenities</span>
                  {venue.features ? (
                    venue.features.split(',').map((feat, idx) => (
                      <div key={idx} className="flex items-center text-sm font-medium text-slate-600">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
                        {feat.trim()}
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center text-sm font-medium text-slate-600">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
                        LCD Projector
                      </div>
                      <div className="flex items-center text-sm font-medium text-slate-600">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
                        {venue.type === 'Lab' ? 'High-speed LAN' : 'Wi-Fi Enabled'}
                      </div>
                      {venue.capacity > 100 && (
                        <div className="flex items-center text-sm font-medium text-slate-600">
                          <CheckCircle className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
                          PA System
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="pt-4 mt-auto border-t border-slate-50">
                  <button onClick={() => navigate('/login')} className="w-full py-3 bg-slate-50 text-slate-700 font-bold text-sm rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md">
                    Check Schedule
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQ = () => {
  return (
    <section className="py-24 bg-slate-50 border-t border-slate-100">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Frequently Asked Questions</h2>
          <p className="text-slate-500 text-lg">Quick answers for faculty and coordinators.</p>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-xl transition-shadow cursor-pointer">
            <h3 className="font-bold text-slate-800 text-lg mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> How early should I book a venue?</h3>
            <p className="text-slate-600 pl-3 leading-relaxed">It is recommended to place a booking request at least 48 hours prior to the event to ensure sufficient time for HOD clearances and infrastructural setup.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-xl transition-shadow cursor-pointer">
            <h3 className="font-bold text-slate-800 text-lg mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Can students book venues directly?</h3>
            <p className="text-slate-600 pl-3 leading-relaxed">No, students must approach their respective faculty coordinators or club heads. Only authorized staff members have the credentials to make a formal booking.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-xl transition-shadow cursor-pointer">
            <h3 className="font-bold text-slate-800 text-lg mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> What happens if two requests overlap?</h3>
            <p className="text-slate-600 pl-3 leading-relaxed">Our smart scheduling system strictly prevents overlapping bookings for the same time slot and venue, displaying an alert immediately during selection.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-[#0f172a] pt-20 pb-10 text-slate-300">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white rounded-xl p-1.5 w-14 h-14 flex items-center justify-center shadow-lg">
                <img src="/SISTec_Logo.png" alt="SISTec Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white">SISTec</h1>
                <p className="text-xs text-blue-400 uppercase tracking-widest font-bold">Event Organizer</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 max-w-md pr-8">
              A premium resource scheduling portal engineered for real-time facility management, making academic events seamless and efficient.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 tracking-widest text-xs uppercase">Quick Links</h4>
            <ul className="space-y-4">

              <li className="group">
                <a href="https://www.instagram.com/sagarcollegebhopal/" className="hover:text-pink-500 transition-colors text-sm text-slate-400 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-500 group-hover:text-pink-500 transition-colors"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg> Instagram
                </a>
              </li>
              <li className="group">
                <a href="https://www.linkedin.com/school/sagar-group-of-institutions-sistec/posts/?feedView=all" className="hover:text-blue-500 transition-colors text-sm text-slate-400 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-500 group-hover:text-blue-500 transition-colors"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg> LinkedIn
                </a>
              </li>
              <li className="group">
                <a href="https://x.com/sagarcollege" className="hover:text-slate-100 transition-colors text-sm text-slate-400 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-4 h-4 text-slate-500 group-hover:text-slate-100 transition-colors"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> Twitter
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 tracking-widest text-xs uppercase">Contact Information</h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <div className="bg-blue-500/10 p-2 rounded-lg shrink-0 text-blue-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-sm text-slate-400 leading-relaxed max-w-[200px]">Opposite International Airport, Gandhi Nagar, Bhopal (M.P.)</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="bg-emerald-500/10 p-2 rounded-lg shrink-0 text-emerald-400">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-sm text-slate-400 hover:text-white cursor-pointer transition-colors">+91 910 999 75760</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="bg-indigo-500/10 p-2 rounded-lg shrink-0 text-indigo-400">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-sm text-slate-400 hover:text-white cursor-pointer transition-colors">resources@sistec.ac.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center text-xs text-slate-500 font-medium">
          <p>
            &copy; {new Date().getFullYear()} Designed & Developed by <span className="text-blue-400">Ajay, Ghanshyam, Shubham</span> and <span className="text-blue-400">Shivam</span> under the Guidance of <span className="text-blue-400">Prof. Nargish Gupta</span>.
          </p>
        </div>
      </div>
    </footer>
  );
};

const WeeklySchedule = () => {
  const [bookings, setBookings] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [dateRange, setDateRange] = useState([]);
  const printRef = useRef();

  useEffect(() => {
    // Fetch both bookings and venues using centralized API service
    setLoading(true);
    Promise.all([
      api.get('/booking/weekly-schedule'),
      api.get('/booking/venues')
    ])
      .then(([bookingRes, venueRes]) => {
        if (bookingRes.data.success) setBookings(bookingRes.data.bookings);
        if (venueRes.data.success) setVenues(venueRes.data.venues);

        // Build date range
        const dates = [];
        const today = new Date();
        const dayOfWeek = today.getDay();

        // Calculate start of week (Monday) and end (Saturday)
        // If today is Sunday(0), Mon is +1. If today is Mon(1), Mon is 0.
        const diffToMon = dayOfWeek === 0 ? 1 : (1 - dayOfWeek);
        const monday = new Date(today);
        monday.setDate(today.getDate() + diffToMon);

        for (let i = 0; i < 6; i++) { // Mon to Sat
          const d = new Date(monday);
          d.setDate(monday.getDate() + i);
          const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          dates.push({ iso, label: DAY_FULL[d.getDay()], short: DAY_NAMES[d.getDay()], isToday: d.toDateString() === today.toDateString() });
        }
        setDateRange(dates);

        // Default to "All Week" or Today
        setSelectedDate('all');
      })
      .catch(err => console.error('Schedule fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  // Filter venues to ONLY show those that have at least one booking this week
  const activeVenueIds = new Set(bookings.map(b => b.venue?._id));
  const activeVenues = venues.filter(v => activeVenueIds.has(v._id));

  // Helper to merge consecutive slots for the same faculty & purpose
  const mergeConsecutiveBookings = (dayBookings) => {
    if (!dayBookings || dayBookings.length === 0) return [];

    // Sort by slot index
    const sorted = [...dayBookings].sort((a, b) =>
      STANDARD_SLOTS.indexOf(a.timeSlot) - STANDARD_SLOTS.indexOf(b.timeSlot)
    );

    const merged = [];
    if (sorted.length === 0) return merged;

    let current = { ...sorted[0] };

    for (let i = 1; i < sorted.length; i++) {
      const next = sorted[i];
      const currentIndex = STANDARD_SLOTS.indexOf(current.timeSlot);
      const nextIndex = STANDARD_SLOTS.indexOf(next.timeSlot);

      const samePerson = current.faculty?._id === next.faculty?._id;
      const samePurpose = current.purpose === next.purpose;
      const isConsecutive = nextIndex === currentIndex + 1;

      if (samePerson && samePurpose && isConsecutive) {
        // Update current end time
        const newEndTime = next.timeSlot.split(' - ')[1];
        current.timeSlot = `${current.timeSlot.split(' - ')[0]} - ${newEndTime}`;
      } else {
        merged.push(current);
        current = { ...next };
      }
    }
    merged.push(current);
    return merged;
  };

  // Helper to get booking for a specific venue, date and slot
  const getSpecificBooking = (venueId, date, slot) =>
    bookings.find(b => b.venue?._id === venueId && b.date === date && b.timeSlot === slot);

  // Helper to get booking for selected day
  const getBooking = (venueId, slot) =>
    bookings.find(b => b.venue?._id === venueId && b.date === selectedDate && b.timeSlot === slot);

  const handlePrint = () => {
    const printContents = printRef.current?.innerHTML;
    const title = selectedDate === 'all' ? 'Weekly Venue Schedule' : `Venue Schedule - ${selectedDate}`;
    const dateLabel = selectedDate === 'all' ? 'Full Week' : selectedDate;

    const w = window.open('', '_blank');
    w.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 20px; color: #1e293b; }
            h2 { color: #1e3a8a; margin: 0 0 4px 0; font-size: 20px; }
            p { color: #64748b; margin: 0 0 15px 0; font-size: 12px; }
            .venue-section { margin-bottom: 30px; page-break-inside: avoid; }
            .venue-name { background: #f1f5f9; padding: 8px 12px; font-weight: 800; color: #1e3a8a; border-radius: 6px; margin-bottom: 10px; border-left: 4px solid #3b82f6; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; table-layout: fixed; }
            th { background: #1e3a8a; color: white; padding: 6px 4px; text-align: center; border: 1px solid #1e3a8a; }
            td { padding: 4px; border: 1px solid #e2e8f0; vertical-align: top; text-align: center; height: 40px; }
            td:first-child { font-weight: 700; background: #f8fafc; color: #1e3a8a; width: 80px; }
            .booked { background: #eff6ff; color: #1e40af; text-align: left; padding: 4px; }
            .booked strong { display: block; font-size: 9px; line-height: 1.1; }
            .booked span { font-size: 8px; color: #64748b; display: block; margin-top: 2px; }
            .free { color: #10b981; font-weight: 700; font-size: 8px; text-transform: uppercase; display: flex; align-items: center; justify-content: center; height: 100%; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div style="border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 20px;">
            <h1 style="margin:0; font-size: 24px; color: #1e3a8a;">SISTec Venue Schedule</h1>
            <p style="margin:5px 0 0 0;">Report Generated for: <strong>${dateLabel}</strong></p>
          </div>
          ${printContents}
        </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 500);
  };

  const selectedDayInfo = dateRange.find(d => d.iso === selectedDate);

  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/20 rounded-full text-blue-300 font-bold tracking-wide text-xs border border-blue-500/30 mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              LIVE SCHEDULE
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              This Week's Venue Schedule
            </h2>
            <p className="text-slate-400 mt-2 text-base">
              Real-time approved bookings — Today through Saturday
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-900/40 hover:scale-105 active:scale-95 shrink-0"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>

        {/* Day Tabs */}
        {!loading && dateRange.length > 0 && (
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedDate('all')}
              className={`shrink-0 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300
                ${selectedDate === 'all'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 scale-105'
                  : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
            >
              <CalendarDays className="w-4 h-4 mx-auto mb-1 opacity-70" />
              All Week
            </button>
            {dateRange.map(d => (
              <button
                key={d.iso}
                onClick={() => setSelectedDate(d.iso)}
                className={`shrink-0 px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-300
                  ${selectedDate === d.iso
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 scale-105'
                    : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
              >
                <span className="block text-[10px] uppercase tracking-widest opacity-70 mb-0.5">{d.short}</span>
                {new Date(d.iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                {d.isToday && <span className="block text-[8px] text-blue-300 font-black uppercase tracking-tighter mt-0.5">Today</span>}
              </button>
            ))}
          </div>
        )}

        {/* Schedule View */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-blue-400 animate-spin mr-3" />
            <span className="text-slate-400 font-medium text-lg">Loading schedule...</span>
          </div>
        ) : activeVenues.length === 0 ? (
          <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10">
            <CheckCheck className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <p className="text-slate-300 font-bold text-xl">No Active Bookings</p>
            <p className="text-slate-500 mt-2">Venues will appear here once they have approved bookings for this week.</p>
          </div>
        ) : selectedDate === 'all' ? (
          <div className="overflow-x-auto rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
            <div ref={printRef}>
              <div className="p-6 bg-white/5 border-b border-white/10 print:block hidden">
                <h2 className="text-2xl font-black text-blue-800">SISTec Weekly Venue Schedule</h2>
                <p>Full Week Summary — Approved Bookings</p>
              </div>
              <table className="w-full min-w-[1000px] border-collapse bg-white/[0.02]">
                <thead>
                  <tr>
                    <th className="bg-blue-900/60 text-blue-200 text-[10px] uppercase tracking-widest font-black py-5 px-6 text-left border-b border-white/10 w-48">
                      Venue Details
                    </th>
                    {dateRange.map(day => (
                      <th key={day.iso} className={`bg-blue-900/40 text-blue-100 text-[11px] uppercase tracking-widest font-black py-5 px-4 text-center border-b border-white/10 border-l border-white/5 ${day.isToday ? 'bg-blue-600/30' : ''}`}>
                        {day.label}
                        <span className="block text-[9px] font-normal opacity-60 mt-1">{day.iso.split('-').slice(1).reverse().join('/')}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeVenues.map((venue, vi) => (
                    <tr key={venue._id} className={`border-b border-white/5 group hover:bg-white/[0.04] transition-colors ${vi % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'}`}>
                      <td className="py-6 px-6 border-r border-white/10">
                        <div className="flex flex-col">
                          <span className="text-white font-black text-base group-hover:text-blue-400 transition-colors">{venue.name}</span>
                          <span className="text-slate-500 text-[10px] font-bold flex items-center gap-1 mt-1 uppercase tracking-tighter">
                            <MapPin className="w-3 h-3" /> {venue.location}
                          </span>
                        </div>
                      </td>
                      {dateRange.map(day => {
                        const dayBookingsForVenue = bookings.filter(b => b.venue?._id === venue._id && b.date === day.iso);
                        const mergedBookings = mergeConsecutiveBookings(dayBookingsForVenue);

                        return (
                          <td key={day.iso} className={`p-3 border-l border-white/5 align-top ${day.isToday ? 'bg-blue-600/5' : ''}`}>
                            <div className="flex flex-col gap-2 min-h-[80px]">
                              {mergedBookings.length === 0 ? (
                                <div className="flex items-center justify-center h-full opacity-10 group-hover:opacity-20 transition-opacity">
                                  <CheckCheck className="w-5 h-5 text-emerald-400" />
                                </div>
                              ) : (
                                mergedBookings.map(b => (
                                  <div key={b._id} className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-2.5 shadow-lg shadow-black/20">
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                      <span className="text-[9px] font-black text-amber-400 uppercase tracking-tighter bg-amber-400/10 px-1.5 py-0.5 rounded-md border border-amber-400/20">
                                        {b.timeSlot}
                                      </span>
                                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                                    </div>
                                    <p className="text-white text-[10px] font-bold leading-tight line-clamp-1">{b.faculty?.name}</p>
                                    <p className="text-slate-400 text-[8px] italic line-clamp-1 mt-0.5">"{b.purpose}"</p>
                                  </div>
                                ))
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
            <div ref={printRef}>
              <div className="p-6 bg-white/5 border-b border-white/10 print:block hidden">
                <h2 className="text-2xl font-black text-blue-800">SISTec Venue Schedule</h2>
                <p>{selectedDayInfo?.label}, {selectedDate} — Approved Bookings</p>
              </div>
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr>
                    <th className="bg-blue-900/60 text-blue-200 text-xs uppercase tracking-widest font-black py-4 px-4 text-left border-b border-white/10 w-44">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Time Slot
                      </div>
                    </th>
                    {activeVenues.map(v => (
                      <th key={v._id} className="bg-blue-900/60 text-blue-200 text-xs uppercase tracking-widest font-black py-4 px-4 text-center border-b border-white/10 border-l border-white/5">
                        <span className="block font-black text-white">{v.name}</span>
                        <span className="text-[10px] text-blue-300/70 font-normal">{v.location}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {STANDARD_SLOTS.map((slot, si) => {
                    const isAfterFourth = si === 3;
                    return (
                      <React.Fragment key={slot}>
                        <tr className={`border-b border-white/5 ${si % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'}`}>
                          <td className="py-3 px-4 text-xs font-bold text-blue-300 whitespace-nowrap border-r border-white/10">
                            <div className="flex flex-col">
                              <span>{slot.split(' - ')[0]}</span>
                              <span className="text-slate-500 font-normal">to {slot.split(' - ')[1]}</span>
                            </div>
                          </td>
                          {activeVenues.map(v => {
                            const booking = getBooking(v._id, slot);
                            return (
                              <td key={v._id} className="py-3 px-3 text-center border-l border-white/5 align-top">
                                {booking ? (
                                  <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-2.5 text-left">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0"></div>
                                      <span className="text-[11px] font-black text-blue-300 uppercase tracking-wider">Booked</span>
                                    </div>
                                    <p className="text-white font-bold text-xs leading-snug">{booking.faculty?.name}</p>
                                    {booking.faculty?.designation && (
                                      <p className="text-blue-300/70 text-[10px] font-medium">{booking.faculty.designation}</p>
                                    )}
                                    <p className="text-slate-400 text-[10px] mt-1 italic line-clamp-2">"{booking.purpose}"</p>
                                  </div>
                                ) : (
                                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl py-2.5 px-2">
                                    <CheckCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                                    <span className="text-emerald-400 text-[11px] font-bold uppercase tracking-wider">Free</span>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                        {isAfterFourth && (
                          <tr className="bg-amber-400/5 border-b border-white/5 no-print">
                            <td className="py-2 px-4 text-[10px] font-black text-amber-500 uppercase tracking-widest text-center" colSpan={activeVenues.length + 1}>
                              🍱 Lunch Break (01:35 PM - 02:10 PM)
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p className="text-center text-slate-600 text-xs mt-6 font-medium">
          * Only approved bookings are shown. Schedule updates in real time.
        </p>
      </div>
    </section>
  );
};

// V2 - Verified Landing Page Routing
const LandingPage = () => {
  return (
    <div className="min-h-screen font-sans bg-slate-50 selection:bg-blue-500 selection:text-white">
      <Navbar />
      <Hero />

      <Process />
      <ProjectOverview />
      <Venues />
      <WeeklySchedule />
      <FAQ />
      <Footer />
    </div>
  );
};

export default LandingPage;


