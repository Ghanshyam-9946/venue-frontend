import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle, XCircle, Clock, Calendar, MapPin, User, Mail, BookOpen, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state for reason
  const [reasonModal, setReasonModal] = useState({ isOpen: false, requestId: null, batchId: null, actionStatus: '', reason: '' });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/requests');
      setRequests(res.data.requests || []);
    } catch (error) {
      toast.error('Failed to load booking requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status, reason = '', cancellationReason = '') => {
    try {
      await api.put(`/admin/request/${id}`, { status, reason, cancellationReason });
      toast.success(`Request ${status} successfully`);

      setRequests(requests.map(req =>
        req._id === id ? { ...req, status, reason } : req
      ));
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${status} request`);
    }
  };

  const handleBatchStatusUpdate = async (batchId, status, reason = '', cancellationReason = '') => {
    try {
      await api.put(`/admin/batch-request/${batchId}`, { status, reason, cancellationReason });
      toast.success(`Batch Request ${status} successfully`);
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${status} batch request`);
    }
  };

  const submitReason = () => {
    if (!reasonModal.reason.trim()) {
      toast.error("Please provide a reason.");
      return;
    }

    if (reasonModal.batchId) {
      handleBatchStatusUpdate(reasonModal.batchId, reasonModal.actionStatus, reasonModal.reason, reasonModal.actionStatus === 'approved' ? reasonModal.reason : '');
    } else {
      handleStatusUpdate(reasonModal.requestId, reasonModal.actionStatus, reasonModal.reason, reasonModal.actionStatus === 'approved' ? reasonModal.reason : '');
    }
    setReasonModal({ isOpen: false, requestId: null, batchId: null, actionStatus: '', reason: '' });
  };

  const openReasonModal = (id, actionStatus, isBatch = false) => {
    if (isBatch) {
      setReasonModal({ isOpen: true, requestId: null, batchId: id, actionStatus, reason: '' });
    } else {
      setReasonModal({ isOpen: true, requestId: id, batchId: null, actionStatus, reason: '' });
    }
  };

  const getConflictDetails = (request) => {
    if (request.status !== 'pending') return null;
    const conflict = requests.find(r =>
      r._id !== request._id &&
      r.status === 'approved' &&
      r.venue?._id === request.venue?._id &&
      r.date === request.date &&
      r.timeSlot === request.timeSlot
    );
    return conflict ? conflict.faculty?.name : null;
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      revoked: 'bg-orange-100 text-orange-800 border-orange-200'
    };

    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${colors[status.toLowerCase()] || colors.pending} capitalize flex items-center shrink-0`}>
        {status === 'pending' && <Clock className="w-3.5 h-3.5 mr-1" />}
        {status === 'approved' && <CheckCircle className="w-3.5 h-3.5 mr-1" />}
        {status === 'rejected' && <XCircle className="w-3.5 h-3.5 mr-1" />}
        {status}
      </span>
    );
  };

  const displayItems = [];
  const batchGroups = {};

  requests.forEach(req => {
    if (req.batchId) {
      if (!batchGroups[req.batchId]) batchGroups[req.batchId] = [];
      batchGroups[req.batchId].push(req);
    } else {
      displayItems.push({ isBatch: false, ...req });
    }
  });

  Object.values(batchGroups).forEach(group => {
    if (group.length > 1) {
      displayItems.push({
        isBatch: true,
        batchId: group[0].batchId,
        status: group[0].status,
        faculty: group[0].faculty,
        purpose: group[0].purpose,
        requirements: group[0].requirements,
        date: group[0].date,
        timeSlot: group[0].timeSlot,
        createdAt: group[0].createdAt,
        items: group
      });
    } else {
      displayItems.push({ isBatch: false, ...group[0] });
    }
  });

  displayItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="relative space-y-8 animate-fade-in">

  {/* BACKGROUND */}
  <div className="absolute -top-32 -left-32 w-72 h-72 bg-blue-400/20 blur-[120px] rounded-full"></div>
  <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-400/20 blur-[120px] rounded-full"></div>

  {/* HEADER */}
  <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-4 bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-lg hover:shadow-xl transition">

    <div>
      <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
        Sistec Event Organizer
      </h1>
      <p className="text-slate-500 text-sm mt-1">
        Review and manage resource booking requests
      </p>
    </div>

    <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-xl text-sm font-semibold border border-blue-100 shadow-sm">
      {displayItems.length} Requests
    </div>

  </div>

  {/* LOADING */}
  {loading ? (
    <div className="flex flex-col items-center py-20">
      <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
      <p className="text-slate-500">Loading...</p>
    </div>
  ) : requests.length === 0 ? (
    <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
      <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-3" />
      <h3 className="text-lg font-medium text-slate-900">No requests</h3>
    </div>
  ) : (

    <div className="space-y-5 relative z-10">

      {displayItems.map(item => {
        const id = item.isBatch ? item.batchId : item._id;

        return (
          <div
            key={id}
            className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-blue-200/40 to-indigo-200/30 hover:from-blue-400/60 hover:to-indigo-300/50 transition-all duration-300"
          >

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-sm group-hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">

              {/* TOP */}
              <div className="flex flex-col sm:flex-row justify-between gap-4">

                {/* LEFT */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition">
                    {item.isBatch
                      ? `Grouped Booking (${item.items.length} Venues)`
                      : item.venue?.name}
                  </h3>

                  {item.isBatch && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.items.map((req, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md border border-indigo-100 flex items-center gap-1 shadow-sm">
                          <MapPin className="w-3 h-3 text-indigo-400" />
                          {req.venue?.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {getStatusBadge(item.status)}
                    {getConflictDetails(item) && (
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-orange-100 text-orange-700 border border-orange-200 flex items-center shadow-sm animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5 mr-1" /> Priority Conflict with {getConflictDetails(item)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-3">

                    {!item.isBatch && (
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-blue-500 group-hover:scale-110 transition" />
                        {item.venue?.location}
                      </span>
                    )}

                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-blue-500 group-hover:scale-110 transition" />
                      {format(new Date(item.date), 'MMM dd')}
                    </span>

                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-blue-500 group-hover:scale-110 transition" />
                      {item.timeSlot}
                    </span>

                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2 sm:flex-col sm:items-end">

                  {item.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          setReasonModal({
                            ...reasonModal,
                            isOpen: false,
                            requestId: id,
                            batchId: item.isBatch ? id : null,
                            actionStatus: 'rejected',
                            reason: ''
                          })
                        }
                        className="px-3 py-1.5 text-sm rounded-xl border border-red-200 text-red-600 hover:bg-red-50 hover:scale-105 transition-all"
                      >
                        Reject
                      </button>

                      <button
                        onClick={() => {
                          const conflictName = getConflictDetails(item);
                          if (conflictName) {
                            setReasonModal({
                              isOpen: true,
                              requestId: id,
                              batchId: item.isBatch ? id : null,
                              actionStatus: 'approved',
                              reason: ''
                            });
                          } else {
                            item.isBatch
                              ? handleBatchStatusUpdate(item.batchId, 'approved')
                              : handleStatusUpdate(item._id, 'approved');
                          }
                        }}
                        className={`px-3 py-1.5 text-sm rounded-xl text-white hover:scale-105 shadow-md transition-all ${getConflictDetails(item) ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}`}
                      >
                        {getConflictDetails(item) ? 'Revoke & Approve' : 'Approve'}
                      </button>
                    </>
                  )}

                  {item.status === "approved" && (
                    <button
                      onClick={() =>
                        setReasonModal({
                          ...reasonModal,
                          isOpen: false,
                          requestId: id,
                          batchId: item.isBatch ? id : null,
                          actionStatus: 'revoked',
                          reason: ''
                        })
                      }
                      className="px-3 py-1.5 text-sm rounded-xl border border-orange-200 text-orange-600 hover:bg-orange-50 hover:scale-105 transition-all"
                    >
                      Revoke
                    </button>
                  )}

                </div>

              </div>

              {/* PURPOSE */}
              <div className="mt-4 bg-slate-50/80 border border-slate-100 p-3 rounded-xl text-sm text-slate-600">
                <span className="font-semibold text-slate-700">Purpose: </span>
                {item.purpose}
              </div>

              {/* REQUIREMENTS */}
              {item.requirements && (
                <div className="mt-2 bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl text-sm text-indigo-700">
                  <span className="font-semibold text-indigo-800">Requirements: </span>
                  {item.requirements}
                </div>
              )}

              {/* PRIORITY REASON */}
              {item.priorityReason && (
                <div className="mt-2 bg-orange-50 border border-orange-200 p-3 rounded-xl text-sm text-orange-800 animate-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span className="font-bold uppercase text-[10px] tracking-wider">Priority Justification</span>
                  </div>
                  <p className="italic">"{item.priorityReason}"</p>
                </div>
              )}

              {/* INLINE BOX */}
              {reasonModal.requestId === id &&
                (reasonModal.actionStatus === 'revoked' || reasonModal.actionStatus === 'rejected' || reasonModal.actionStatus === 'approved') && (
                  <div
                    className={`mt-4 p-4 rounded-xl border transition-all duration-300 ease-out
                    animate-[fadeIn_0.3s_ease,slideUp_0.3s_ease]
                    ${reasonModal.actionStatus === 'revoked'
                        ? 'bg-orange-50 border-orange-200'
                        : reasonModal.actionStatus === 'approved'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-red-50 border-red-200'
                      }`}
                  >

                    <textarea
                      className="w-full p-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder={reasonModal.actionStatus === 'approved' 
                        ? "Enter reason for revoking the previous booking (this will be sent to the original user)..." 
                        : `Enter ${reasonModal.actionStatus} reason...`}
                      value={reasonModal.reason}
                      onChange={(e) =>
                        setReasonModal({
                          ...reasonModal,
                          reason: e.target.value
                        })
                      }
                    />

                    <div className="flex justify-end gap-2 mt-3">

                      <button
                        onClick={() =>
                          setReasonModal({
                            isOpen: false,
                            requestId: null,
                            batchId: null,
                            actionStatus: '',
                            reason: ''
                          })
                        }
                        className="px-3 py-1.5 text-sm bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={submitReason}
                        className={`px-3 py-1.5 text-sm text-white rounded-lg shadow-md hover:scale-105 transition-all
                        ${reasonModal.actionStatus === 'revoked'
                            ? 'bg-orange-500 hover:bg-orange-600'
                            : reasonModal.actionStatus === 'approved'
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-red-500 hover:bg-red-600'}`}
                      >
                        {reasonModal.actionStatus === 'approved' ? 'Revoke & Approve' : `Confirm ${reasonModal.actionStatus}`}
                      </button>

                    </div>
                  </div>
                )}

              {/* REASON */}
              {item.reason && (
                <div className="mt-3 p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
                  {item.reason}
                </div>
              )}

            </div>
          </div>
        );
      })}

    </div>
  )}
</div>
  );
}
