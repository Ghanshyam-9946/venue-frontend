import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Loader2, Users, MapPin, Search, ArrowLeft, Layers, Filter } from 'lucide-react';

export default function VenuesList() {
  const [venues, setVenues] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [minCap, setMinCap] = useState(0);
  const [maxCap, setMaxCap] = useState(500);

  // Selection State
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);

  // Multi-Book State
  const [multiMode, setMultiMode] = useState(false);
  const [selectedVenues, setSelectedVenues] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  // Clear selections if dept changes or multi-mode turns off
  useEffect(() => {
    if (!multiMode || !selectedDept) {
      setSelectedVenues([]);
    }
  }, [multiMode, selectedDept]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vRes, dRes, bRes] = await Promise.all([
        api.get('/admin/venues'),
        api.get('/admin/departments'),
        api.get('/admin/blocks')
      ]);
      setVenues(vRes.data.venues || []);
      setDepartments(dRes.data.departments || []);
      setBlocks(bRes.data.blocks || []);
    } catch (error) {
      toast.error('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredVenues = venues.filter(v => {
    if (selectedDept && v.department?._id !== selectedDept._id) return false;
    if (searchTerm && !(
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.location.toLowerCase().includes(searchTerm.toLowerCase())
    )) return false;
    if (v.capacity < minCap || v.capacity > maxCap) return false;
    return true;
  });

  const handleVenueClick = (venue) => {
    if (multiMode) {
      if (selectedVenues.some(v => v._id === venue._id)) {
        setSelectedVenues(selectedVenues.filter(v => v._id !== venue._id));
      } else {
        setSelectedVenues([...selectedVenues, venue]);
      }
    } else {
      navigate(`/venues/${venue._id}/book`);
    }
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-800 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
        
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full -mr-20 -mt-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full -ml-10 -mb-10"></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {selectedDept ? selectedDept.name : (selectedBlock ? selectedBlock.name : 'Select Building / Block')}
            </h1>
            <p className="text-blue-100/80 text-lg mt-2 font-medium">
              {selectedDept 
                ? `Explore available spaces within the ${selectedDept.name} department.`
                : (selectedBlock 
                   ? `Choose a department within ${selectedBlock.name} to view venues.`
                   : 'Choose a structural block to narrow down your search.')}
            </p>
          </div>

          {selectedDept && (
            <div className="relative w-full lg:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300 group-focus-within:text-white transition-colors" />
              <input
                type="text"
                placeholder="Search by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/20 focus:bg-white/20 focus:ring-2 focus:ring-blue-400/50 outline-none transition-all placeholder:text-blue-300/70"
              />
            </div>
          )}
        </div>
      </div>

      {/* LEVEL 1: BLOCKS VIEW */}
      {!selectedBlock && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
           {blocks.map((block, idx) => (
             <div
               key={block._id}
               onClick={() => setSelectedBlock(block)}
               className="group bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 cursor-pointer relative overflow-hidden"
               style={{ animationDelay: `${idx * 100}ms` }}
             >
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[5rem] group-hover:bg-indigo-600 transition-colors duration-500 -mr-8 -mt-8"></div>
               
               <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-indigo-600 transition-all shadow-inner relative z-10 font-bold text-2xl">
                 {block.name[block.name.length-1]}
               </div>

               <h3 className="text-2xl font-black text-slate-800 group-hover:text-slate-900 transition-colors">
                 {block.name}
               </h3>
               <p className="text-slate-500 mt-3 leading-relaxed">
                 Explore all departments and venues located within {block.name}.
               </p>

               <div className="mt-8 flex items-center text-indigo-600 font-bold text-sm uppercase tracking-wider group-hover:translate-x-2 transition-transform">
                 View Departments <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
               </div>
             </div>
           ))}
        </div>
      )}

      {/* LEVEL 2: DEPARTMENTS VIEW */}
      {selectedBlock && !selectedDept && !loading && (
        <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedBlock(null)}
              className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Departments in {selectedBlock.name}</h2>
              <p className="text-slate-500 text-sm">Select a department to browse venues</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {departments
              .filter(d => d.block?._id === selectedBlock._id)
              .map((dept, idx) => (
              <div
                key={dept._id}
                onClick={() => setSelectedDept(dept)}
                className="group bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 cursor-pointer relative overflow-hidden"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[5rem] group-hover:bg-blue-600 transition-colors duration-500 -mr-8 -mt-8"></div>
                
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-blue-600 transition-all shadow-inner relative z-10">
                  <Layers className="w-8 h-8" />
                </div>

                <h3 className="text-xl font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
                  {dept.name}
                </h3>
                <p className="text-slate-500 mt-3 leading-relaxed">
                  {dept.description || 'Explore shared spaces, labs, and collaborative zones.'}
                </p>

                <div className="mt-8 flex items-center text-blue-600 font-bold text-sm uppercase tracking-wider group-hover:translate-x-2 transition-transform">
                  Explore Venues <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </div>
              </div>
            ))}
            {departments.filter(d => d.block?._id === selectedBlock._id).length === 0 && (
                <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">No departments found in this block yet.</p>
                </div>
            )}
          </div>
        </div>
      )}

      {/* VENUES VIEW */}
      {selectedDept && !loading && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
          
          {/* NAVIGATION & FILTERS */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedDept(null)}
                className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Available Venues</h2>
                <p className="text-slate-500 text-sm">{selectedDept.name} â€¢ {filteredVenues.length} spaces</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setMultiMode(!multiMode)}
                className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-sm flex items-center gap-2
                  ${multiMode 
                    ? 'bg-indigo-900 text-white ring-4 ring-indigo-100' 
                    : 'bg-white text-indigo-900 border border-indigo-100 hover:bg-indigo-50'}`}
              >
                {multiMode ? 'âœ… Select Mode Active' : 'Multi-Selection'}
              </button>
            </div>
          </div>

          {/* CAPACITY RANGE FILTER */}
          <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-orange-100 shadow-sm animate-in slide-in-from-left-4 duration-500">
            <div className="flex flex-col gap-6">

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-orange-100 rounded-xl">
                    <Users className="w-5 h-5 text-orange-700" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 tracking-tight">Capacity Range Selection</h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Showing venues with {minCap} to {maxCap} seats
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center px-3 py-1.5 bg-orange-600 text-white rounded-xl text-sm font-black shadow-lg shadow-orange-200">
                    {minCap} - {maxCap}
                  </div>
                  {(minCap > 0 || maxCap < 500) && (
                    <button
                      onClick={() => {
                        setMinCap(0);
                        setMaxCap(500);
                      }}
                      className="text-xs font-bold text-orange-600 hover:text-orange-800 transition-colors uppercase tracking-widest"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              <div className="relative w-full px-2 h-10 flex items-center">
                <div className="absolute left-2 right-2 h-2 bg-orange-100 rounded-full"></div>

                <div
                  className="absolute h-2 bg-orange-500 rounded-full z-10"
                  style={{
                    left: `calc(${(minCap / 500) * 100}% + 8px)`,
                    right: `calc(${100 - (maxCap / 500) * 100}% + 8px)`
                  }}
                ></div>

                <input
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  value={minCap}
                  onChange={(e) => setMinCap(Math.min(Number(e.target.value), maxCap - 10))}
                  className="absolute left-0 w-full h-2 bg-transparent appearance-none pointer-events-none z-30 accent-orange-600 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
                />

                <input
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  value={maxCap}
                  onChange={(e) => setMaxCap(Math.max(Number(e.target.value), minCap + 10))}
                  className="absolute left-0 w-full h-2 bg-transparent appearance-none pointer-events-none z-30 accent-orange-600 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
                />
              </div>

              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                <span>0 Seats</span>
                <span>250 Seats</span>
                <span>500+ Seats</span>
              </div>
            </div>
          </div>

          {/* GRID */}
          {filteredVenues.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-300 shadow-inner">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-300" />
               </div>
               <h3 className="text-xl font-bold text-slate-800">No results found</h3>
               <p className="text-slate-500 mt-2">Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredVenues.map((venue, i) => {
                const isSelected = selectedVenues.some(v => v._id === venue._id);
                return (
                  <div
                    key={venue._id}
                    onClick={() => handleVenueClick(venue)}
                    className={`group relative bg-white rounded-[2.5rem] overflow-hidden border-2 transition-all duration-500 cursor-pointer flex flex-col h-full
                      ${multiMode && isSelected
                        ? 'border-blue-500 shadow-2xl scale-[1.03] ring-8 ring-blue-50'
                        : 'border-transparent shadow-md hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] hover:-translate-y-2 hover:border-blue-100'
                      }`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {/* Multi-select checkmark overlay */}
                    {multiMode && isSelected && (
                      <div className="absolute top-4 left-4 z-20 bg-blue-600 text-white p-2 rounded-full shadow-lg">
                        <CheckLargeIcon className="w-5 h-5" />
                      </div>
                    )}

                    {/* IMAGE SECTION */}
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={venue.image || '/images/default-venue.jpg'}
                        alt={venue.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-widest">
                          {venue.type || 'Classroom'}
                        </span>
                        <div className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg">
                          <Users className="w-3.5 h-3.5" />
                          {venue.capacity}
                        </div>
                      </div>
                    </div>

                    {/* CONTENT SECTION */}
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors line-clamp-1">
                        {venue.name}
                      </h3>
                      
                      <div className="flex items-center text-slate-500 text-sm mt-2 font-medium">
                        <MapPin className="w-4 h-4 mr-1.5 text-blue-500" />
                        {venue.location}
                      </div>

                      <p className="text-slate-500 text-sm mt-4 line-clamp-2 leading-relaxed italic">
                        "{venue.description || 'No description provided for this venue.'}"
                      </p>

                      <div className="mt-auto pt-6 flex items-center justify-between">
                        {!multiMode && (
                          <div className="w-full group/btn">
                            <button className="w-full py-3.5 rounded-2xl bg-slate-900 text-white text-sm font-bold hover:bg-blue-600 transition-all duration-300 shadow-xl shadow-slate-200 hover:shadow-blue-200 flex items-center justify-center gap-2">
                              Reserve Spot <ArrowLeft className="w-4 h-4 rotate-180 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        )}
                        {multiMode && !isSelected && (
                          <div className="w-full text-center text-xs font-bold text-slate-400 uppercase tracking-widest border-t border-slate-50 pt-4">
                            Click to select
                          </div>
                        )}
                        {multiMode && isSelected && (
                          <div className="w-full text-center text-xs font-bold text-blue-600 uppercase tracking-widest border-t border-blue-50 pt-4">
                            Selected
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-40 animate-pulse">
           <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
           <p className="text-lg font-bold text-slate-400">Curating the best spaces for you...</p>
        </div>
      )}

      {/* FLOATING ACTION BAR */}
      {multiMode && selectedVenues.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-8 z-50 animate-in slide-in-from-bottom-10">
          <div className="flex flex-col">
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400 font-bold">Selection</span>
            <span className="text-lg font-extrabold leading-none">
              {selectedVenues.length} Venue{selectedVenues.length > 1 ? 's' : ''}
            </span>
          </div>

          <button
            onClick={() => navigate('/book-multiple', { state: { venues: selectedVenues, department: selectedDept } })}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl text-sm font-extrabold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            Continue to Booking <ArrowLeft className="w-4 h-4 rotate-180" />
          </button>
        </div>
      )}

    </div>
  );
}

function CheckLargeIcon(props) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={3}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
