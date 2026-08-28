import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Plus,
  Filter,
  Search,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Archive,
  Trash2,
  Edit3,
  Calendar,
  Sparkles,
  ShieldAlert,
  ArrowUpDown,
  Tag,
  RefreshCcw,
} from 'lucide-react';
import { prioritiesApi } from '../api/priorities';
import { useAuth } from '../context/AuthContext';
import type { Priority, PriorityLevel, PriorityStatus, RelatedEntityType } from '../types/api';
import { Drawer } from '../components/ui/Drawer';

export const PrioritiesPage: React.FC = () => {
  const { isDemo } = useAuth();
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'created_desc' | 'created_asc' | 'priority'>('created_desc');

  // Modal / Drawer state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<Priority | null>(null);
  const [editingPriority, setEditingPriority] = useState<Priority | null>(null);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formLevel, setFormLevel] = useState<PriorityLevel>('High');
  const [formStatus, setFormStatus] = useState<PriorityStatus>('Open');
  const [formEntity, setFormEntity] = useState<RelatedEntityType>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPriorities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await prioritiesApi.getPriorities({
        status: statusFilter || undefined,
        priority_level: levelFilter || undefined,
      });
      setPriorities(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load strategic priorities.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPriorities();
  }, [statusFilter, levelFilter]);

  const handleOpenCreate = () => {
    if (isDemo) {
      setDemoNotice('Demo mode is read-only. Create, edit, and delete operations are restricted in demo mode.');
      return;
    }
    setFormTitle('');
    setFormDesc('');
    setFormLevel('High');
    setFormStatus('Open');
    setFormEntity('general');
    setEditingPriority(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (p: Priority, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isDemo) {
      setDemoNotice('Demo mode is read-only. Create, edit, and delete operations are restricted in demo mode.');
      return;
    }
    setFormTitle(p.title);
    setFormDesc(p.description);
    setFormLevel(p.priority_level);
    setFormStatus(p.status);
    setFormEntity(p.related_entity_type || 'general');
    setEditingPriority(p);
    setIsCreateModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) {
      setDemoNotice('Demo mode is read-only. Create, edit, and delete operations are restricted in demo mode.');
      setIsCreateModalOpen(false);
      return;
    }
    if (!formTitle.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingPriority) {
        await prioritiesApi.updatePriority(editingPriority.id, {
          title: formTitle,
          description: formDesc,
          priority_level: formLevel,
          status: formStatus,
          related_entity_type: formEntity,
        });
      } else {
        await prioritiesApi.createPriority({
          title: formTitle,
          description: formDesc,
          priority_level: formLevel,
          status: formStatus,
          related_entity_type: formEntity,
        });
      }
      setIsCreateModalOpen(false);
      await fetchPriorities();
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (p: Priority, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDemo) {
      setDemoNotice('Demo mode is read-only. Create, edit, and delete operations are restricted in demo mode.');
      return;
    }
    const nextStatus: PriorityStatus = p.status === 'Completed' ? 'Open' : 'Completed';
    try {
      await prioritiesApi.updatePriority(p.id, { status: nextStatus });
      await fetchPriorities();
    } catch (err: any) {
      alert(err.message || 'Failed to update priority status.');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDemo) {
      setDemoNotice('Demo mode is read-only. Create, edit, and delete operations are restricted in demo mode.');
      return;
    }
    if (!confirm('Are you sure you want to delete this strategic priority?')) return;
    try {
      await prioritiesApi.deletePriority(id);
      setSelectedPriority(null);
      await fetchPriorities();
    } catch (err: any) {
      alert(err.message || 'Failed to delete priority.');
    }
  };

  // Filter and Sort in memory
  const filteredPriorities = priorities
    .filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'created_desc') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'created_asc') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      const order: Record<PriorityLevel, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      return order[b.priority_level] - order[a.priority_level];
    });

  const getLevelBadge = (level: PriorityLevel) => {
    switch (level) {
      case 'Critical':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'High':
        return 'bg-amber-50 text-amber-900 border-amber-300';
      case 'Medium':
        return 'bg-blue-50 text-blue-900 border-blue-200';
      case 'Low':
        return 'bg-forest-50 text-forest-800 border-forest-200';
    }
  };

  const getStatusBadge = (status: PriorityStatus) => {
    switch (status) {
      case 'Open':
        return 'bg-forest-100 text-forest-900 border-forest-200';
      case 'In Progress':
        return 'bg-gold-100 text-gold-900 border-gold-300';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Archived':
        return 'bg-ivory-300 text-forest-700 border-ivory-400';
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-gold-700">
              Strategic Execution
            </span>
            {isDemo && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                Demo Workspace
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-forest-950 mt-1">
            Enterprise Priorities &amp; Action Directives
          </h1>
          <p className="text-xs sm:text-sm text-forest-600 mt-1">
            Track, assign, and execute high-leverage directives synthesized from analytics insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-semibold text-xs transition-all shadow-luxury active:scale-98"
          >
            <Plus className="w-4 h-4 text-gold-300" />
            <span>+ Add Priority</span>
          </button>
        </div>
      </div>

      {/* Demo Notice Alert if triggered */}
      {demoNotice && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <p className="font-medium">{demoNotice}</p>
          </div>
          <button
            onClick={() => setDemoNotice(null)}
            className="text-amber-800 hover:text-amber-950 font-bold px-2 py-1"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Toolbar: Search, Status Filter, Level Filter, Sort */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-ivory-300 shadow-sm">
        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-forest-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search priorities by title..."
            className="w-full pl-10 pr-4 py-2 bg-ivory-50 border border-ivory-300 rounded-xl text-xs text-forest-950 focus:outline-none focus:border-gold-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-ivory-50 border border-ivory-300 rounded-xl text-xs text-forest-800 font-medium focus:outline-none focus:border-gold-500"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Archived">Archived</option>
          </select>

          {/* Level filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 bg-ivory-50 border border-ivory-300 rounded-xl text-xs text-forest-800 font-medium focus:outline-none focus:border-gold-500"
          >
            <option value="">All Levels</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-ivory-50 border border-ivory-300 rounded-xl text-xs text-forest-800 font-medium focus:outline-none focus:border-gold-500"
          >
            <option value="created_desc">Newest First</option>
            <option value="created_asc">Oldest First</option>
            <option value="priority">Priority Level</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-ivory-300" />
          ))}
        </div>
      ) : filteredPriorities.length === 0 ? (
        <div className="rounded-3xl bg-white border border-ivory-300 p-12 text-center space-y-4 shadow-luxury">
          <div className="w-14 h-14 rounded-full bg-forest-50 text-forest-800 flex items-center justify-center mx-auto">
            <CheckSquare className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-serif font-bold text-forest-950">No priorities yet</h3>
            <p className="text-xs text-forest-600 max-w-sm mx-auto">
              Create strategic directives to coordinate action on revenue, customer retention, or quality items.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-900 text-white text-xs font-semibold hover:bg-forest-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 text-gold-300" />
            <span>+ Add Priority</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPriorities.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              onClick={() => setSelectedPriority(p)}
              className="group rounded-2xl bg-white border border-ivory-300 p-5 sm:p-6 shadow-luxury hover:shadow-luxury-lg hover:border-gold-400/40 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Badges */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getLevelBadge(p.priority_level)}`}>
                    {p.priority_level}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(p.status)}`}>
                    {p.status}
                  </span>
                </div>

                {/* Title */}
                <h3 className={`text-base font-serif font-bold text-forest-950 line-clamp-2 leading-snug group-hover:text-forest-800 ${p.status === 'Completed' ? 'line-through opacity-70' : ''}`}>
                  {p.title}
                </h3>

                {/* Description */}
                {p.description && (
                  <p className="text-xs text-forest-600 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-ivory-200 flex items-center justify-between text-[11px] text-forest-500">
                <div className="flex items-center gap-1.5 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(p.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleToggleComplete(p, e)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      p.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-ivory-100 text-forest-700 border-ivory-300 hover:bg-forest-100'
                    }`}
                    title={p.status === 'Completed' ? 'Mark Open' : 'Mark Completed'}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => handleOpenEdit(p, e)}
                    className="p-1.5 rounded-lg bg-ivory-100 hover:bg-forest-100 text-forest-700 border border-ivory-300 transition-colors"
                    title="Edit Priority"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => handleDelete(p.id, e)}
                    className="p-1.5 rounded-lg bg-ivory-100 hover:bg-rose-50 text-rose-700 border border-ivory-300 transition-colors"
                    title="Delete Priority"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Priority Detail Drawer */}
      <Drawer
        isOpen={!!selectedPriority}
        onClose={() => setSelectedPriority(null)}
        title={selectedPriority?.title || 'Strategic Directive'}
        subtitle={`Created: ${selectedPriority?.created_at ? new Date(selectedPriority.created_at).toLocaleDateString() : ''}`}
        badge={selectedPriority?.priority_level}
        badgeTone={selectedPriority?.priority_level === 'Critical' ? 'lotus' : 'gold'}
      >
        {selectedPriority && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-ivory-100 border border-ivory-200 text-xs">
              <div>
                <span className="text-forest-600 block">Current Status</span>
                <strong className="text-forest-950 font-serif text-sm mt-0.5 block">{selectedPriority.status}</strong>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getLevelBadge(selectedPriority.priority_level)}`}>
                {selectedPriority.priority_level} Priority
              </span>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-forest-700 mb-2">Description &amp; Directive</h4>
              <p className="text-sm text-forest-900 bg-white p-4 rounded-xl border border-ivory-300 leading-relaxed">
                {selectedPriority.description || 'No detailed instructions provided.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200">
                <span className="text-forest-600 block">Entity Scope</span>
                <strong className="text-forest-900 mt-0.5 block capitalize">{selectedPriority.related_entity_type || 'General'}</strong>
              </div>
              <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200">
                <span className="text-forest-600 block">Last Updated</span>
                <strong className="text-forest-900 mt-0.5 block font-mono">{new Date(selectedPriority.updated_at).toLocaleDateString()}</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-ivory-200">
              <button
                onClick={(e) => handleToggleComplete(selectedPriority, e)}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
              >
                {selectedPriority.status === 'Completed' ? 'Reopen Priority' : 'Mark as Completed'}
              </button>
              <button
                onClick={() => handleOpenEdit(selectedPriority)}
                className="px-4 py-2 rounded-xl bg-forest-900 text-white text-xs font-semibold hover:bg-forest-800 transition-colors"
              >
                Edit Details
              </button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create / Edit Modal Dialog */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-ivory-300 shadow-luxury-lg max-w-lg w-full p-6 sm:p-7 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-ivory-200 pb-3">
                <h3 className="text-lg font-serif font-bold text-forest-950">
                  {editingPriority ? 'Edit Strategic Priority' : 'Create Strategic Priority'}
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-forest-500 hover:text-forest-900"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-forest-800 font-semibold mb-1">
                    Priority Title <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Re-engage 135 At-Risk High-Value Accounts"
                    className="w-full px-3.5 py-2 bg-ivory-50 border border-ivory-300 rounded-xl text-forest-950 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-forest-800 font-semibold mb-1">Description &amp; Action Notes</label>
                  <textarea
                    rows={3}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Document specific business actions, metrics, and owner expectations..."
                    className="w-full px-3.5 py-2 bg-ivory-50 border border-ivory-300 rounded-xl text-forest-950 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-forest-800 font-semibold mb-1">Priority Level</label>
                    <select
                      value={formLevel}
                      onChange={(e) => setFormLevel(e.target.value as PriorityLevel)}
                      className="w-full px-3 py-2 bg-ivory-50 border border-ivory-300 rounded-xl text-forest-950 focus:outline-none focus:border-gold-500"
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-forest-800 font-semibold mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as PriorityStatus)}
                      className="w-full px-3 py-2 bg-ivory-50 border border-ivory-300 rounded-xl text-forest-950 focus:outline-none focus:border-gold-500"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-ivory-200">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-ivory-200 text-forest-800 font-semibold hover:bg-ivory-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-forest-900 text-white font-semibold hover:bg-forest-800 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : editingPriority ? 'Save Changes' : 'Create Priority'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
