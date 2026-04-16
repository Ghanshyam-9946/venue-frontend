import { Loader2, Plus, Trash2, Grid, Edit2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function AdminBlocks() {
  const { user } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const isSuperadmin = user?.role === 'superadmin';

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/blocks');
      setBlocks(res.data.blocks || []);
    } catch (error) {
      toast.error('Failed to load blocks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        const res = await api.put(`/admin/block/${editingId}`, formData);
        toast.success('Block renamed');
        setBlocks(blocks.map(b => b._id === editingId ? res.data.block : b));
      } else {
        const res = await api.post('/admin/block', formData);
        toast.success('Block created');
        setBlocks([...blocks, res.data.block]);
      }
      setIsModalOpen(false);
      setFormData({ name: '' });
      setEditingId(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (block) => {
    setFormData({ name: block.name });
    setEditingId(block._id);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setFormData({ name: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this block? All departments MUST be removed from this block first.')) return;
    try {
      await api.delete(`/admin/block/${id}`);
      toast.success('Block deleted');
      setBlocks(blocks.filter(b => b._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-6 animate-fade-in">

      {/* HEADER */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 
          bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-500 
          text-white shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 blur-2xl rounded-full"></div>

        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl font-bold">Manage Blocks</h1>
          <p className="text-indigo-100 text-xs sm:text-sm mt-1">
            Define organizational blocks (e.g., Block A, Block B)
          </p>
        </div>

        {isSuperadmin && (
          <button
            onClick={openCreateModal}
            className="relative z-10 flex items-center justify-center gap-2 
            px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl 
            bg-white/20 hover:bg-white/30 backdrop-blur-md 
            text-white text-sm font-medium transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Block
          </button>
        )}
      </div>

      {/* WARNING BOX */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3 items-start">
        <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-amber-900">Important Note</h4>
          <p className="text-xs text-amber-800 mt-0.5">
            Blocks are used to group departments. You can rename blocks anytime, but you can only delete a block if no departments are currently assigned to it.
          </p>
        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
      ) : blocks.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed bg-white/60 backdrop-blur-xl">
          <Grid className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-medium text-slate-800">
            No Blocks Found
          </h3>
          <p className="text-xs text-slate-500 mt-1">Start by adding your first building block.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {blocks.map((block) => (
            <div
              key={block._id}
              onClick={() => navigate(`/admin/departments?blockId=${block._id}`)}
              className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between cursor-pointer hover:-translate-y-1"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  {block.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                {isSuperadmin && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditModal(block); }}
                      className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                      title="Rename Block"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(block._id); }}
                      className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      title="Delete Block"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-extrabold text-slate-800">{block.name}</h3>
                <div className="flex items-center justify-between mt-1">
                   <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Structure Level 1</p>
                   <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="p-4 sm:p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-indigo-900">
                {editingId ? "Rename Block" : "Create New Block"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleCreateOrUpdate} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Block Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm transition-all"
                  placeholder="e.g. Block A or Main Building"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm tracking-wide hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex justify-center items-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    editingId ? "Save Changes" : "Create Block"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
