import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Loader2, Users, MapPin, Search, Grid, ArrowLeft, CheckSquare, Square, Layers, Boxes, LayoutGrid, Folder, Briefcase } from 'lucide-react';

export default function VenuesList() {
  const [venues, setVenues] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Department Selection State
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
      const [vRes, dRes] = await Promise.all([
        api.get('/admin/venues'),
        api.get('/admin/departments')
      ]);
      setVenues(vRes.data.venues || []);
      setDepartments(dRes.data.departments || []);
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
    return true;
  });

  // Group by type
  const groupedVenues = filteredVenues.reduce((acc, venue) => {
    const type = venue.type || 'Classroom';
    if (!acc[type]) acc[type] = [];
    acc[type].push(venue);
    return acc;
  }, {});

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
    <div className="space-y-6 pb-24">

      {/* HEADER */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">

        {/* Glow */}
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-blue-400/20 blur-3xl rounded-full"></div>

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {selectedDept ? selectedDept.name : 'Select a Department'}
            </h1>

            <p className="text-blue-200 text-sm mt-1">
              {selectedDept
                ? `Browse venues under ${selectedDept.name}`
                : 'Choose a department to explore venues'}
            </p>
          </div>

          {selectedDept && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
              <input
                type="text"
                placeholder="Search venues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white text-slate-900 border border-blue-200 focus:ring-2 focus:ring-blue-300 outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* ACTION BAR */}
      {selectedDept && (
        <div className="flex justify-between items-center">

          <button
            onClick={() => { setSelectedDept(null); setSearchTerm(''); }}
            className="flex items-center text-blue-700 hover:text-blue-900 font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </button>

          <button
            onClick={() => setMultiMode(!multiMode)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all
          ${multiMode
                ? 'bg-blue-900 text-white shadow-md'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
          >
            {multiMode ? 'Cancel Multi-Book' : 'Multi-Book Mode'}
          </button>
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      ) : !selectedDept ? (

        /* DEPARTMENTS */
        departments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
            <p className="text-slate-500">No departments found</p>
          </div>
        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {departments.map(dept => (
              <div
                key={dept._id}
                onClick={() => setSelectedDept(dept)}
                className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 group-hover:bg-blue-900 group-hover:text-white transition">
                  <Layers className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  {dept.name}
                </h3>

                <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                  {dept.description || 'View venues'}
                </p>

                <div className="mt-4 text-blue-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition">
                  Explore →
                </div>
              </div>
            ))}

          </div>
        )

      ) : (

        /* VENUES */
        filteredVenues.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
            <p className="text-slate-500">No venues found</p>
          </div>
        ) : (

          <div className="space-y-10">

            {Object.keys(groupedVenues).sort().map(type => (
              <div key={type}>

                {/* SECTION HEADER */}
                <div className="flex items-center mb-4">
                  <h2 className="text-xl font-bold text-slate-900">{type}s</h2>
                  <span className="ml-3 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                    {groupedVenues[type].length}
                  </span>
                </div>

                {/* CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">

                  {groupedVenues[type].map((venue, i) => {
                    const isSelected = selectedVenues.some(v => v._id === venue._id);

                    return (
                      <div
                        key={venue._id}
                        onClick={() => handleVenueClick(venue)}
                        className={`rounded-3xl overflow-hidden bg-white border transition-all duration-300 cursor-pointer
                      ${multiMode && isSelected
                            ? 'border-blue-500 shadow-xl scale-[1.02]'
                            : 'border-slate-200 hover:shadow-lg hover:-translate-y-1'
                          }`}
                        style={{ animation: `fadeUp 0.4s ease ${i * 0.05}s both` }}
                      >

                        {/* IMAGE */}
                        <div className="relative h-52 overflow-hidden">
                          <img
                            src={venue.image}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          />

                          <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {venue.capacity}
                          </div>
                        </div>

                        {/* CONTENT */}
                        <div className="p-5">
                          <h3 className="text-lg font-bold text-slate-900">
                            {venue.name}
                          </h3>

                          <div className="flex items-center text-slate-500 text-sm mt-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            {venue.location}
                          </div>

                          <p className="text-sm text-slate-600 mt-3 line-clamp-2">
                            {venue.description}
                          </p>

                          {!multiMode && (
                            <button className="w-full mt-5 py-2.5 rounded-xl bg-blue-900 text-white text-sm font-semibold">
                              Book Now
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}

                </div>
              </div>
            ))}

          </div>
        )
      )}

      {/* FLOATING BAR */}
      {multiMode && selectedVenues.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4">
          <span className="text-sm">
            {selectedVenues.length} selected
          </span>

          <button
            onClick={() => navigate('/book-multiple', { state: { venues: selectedVenues, department: selectedDept } })}
            className="bg-white text-blue-900 px-4 py-2 rounded-full text-sm font-semibold"
          >
            Continue →
          </button>
        </div>
      )}

    </div>
  );
}
