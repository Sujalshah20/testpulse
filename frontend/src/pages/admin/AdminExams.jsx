// src/pages/admin/AdminExams.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../client/axios.js';
import {
  Plus, BookOpen, Clock, Award, Edit2, Send, ChevronLeft,
  Calendar, AlertCircle, CheckCircle, X, Loader, Trash2
} from 'lucide-react';

const EMPTY_FORM = {
  title: '', subject_id: '', duration_mins: 60, total_marks: 100,
  passing_marks: 40, negative_marks: 0, start_time: '', end_time: '',
  shuffle_questions: true, show_result: true,
  num_questions: ''
};

export default function AdminExams() {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // exam object to delete
  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [examsRes, subjectsRes] = await Promise.all([
        api.get('/exams'),
        api.get('/subjects') 
      ]);
      setExams(examsRes.data.data || []);
      setSubjects(subjectsRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowModal(true);
  };

  const openEdit = (exam) => {
    setEditing(exam);

    // Convert UTC timestamps from DB to local datetime-local format (YYYY-MM-DDTHH:MM)
    const toLocalDatetimeInput = (utcString) => {
      if (!utcString) return '';
      const d = new Date(utcString);
      // Offset to local time
      const offset = d.getTimezoneOffset() * 60000;
      const local = new Date(d.getTime() - offset);
      return local.toISOString().slice(0, 16);
    };

    setForm({
      title: exam.title,
      subject_id: exam.subject_id,
      duration_mins: exam.duration_mins,
      total_marks: exam.total_marks,
      passing_marks: exam.passing_marks,
      negative_marks: exam.negative_marks,
      start_time: toLocalDatetimeInput(exam.start_time),
      end_time: toLocalDatetimeInput(exam.end_time),
      shuffle_questions: exam.shuffle_questions,
      show_result: exam.show_result,
      num_questions: exam.num_questions ?? ''
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const dur = parseInt(form.duration_mins);
    const tm = parseInt(form.total_marks);
    const pm = parseInt(form.passing_marks);
    const nm = parseFloat(form.negative_marks);
    const nq = form.num_questions === '' ? null : parseInt(form.num_questions);

    if (form.num_questions !== '' && (isNaN(nq) || nq <= 0)) { setError('num_questions must be a positive integer'); setSaving(false); return; }

    if (!form.subject_id) { setError('Subject is required'); setSaving(false); return; }
    if (!form.start_time || isNaN(Date.parse(form.start_time))) { setError('Valid start time is required'); setSaving(false); return; }
    if (!form.end_time || isNaN(Date.parse(form.end_time))) { setError('Valid end time is required'); setSaving(false); return; }
    if (new Date(form.start_time) >= new Date(form.end_time)) { setError('Start time must be before end time'); setSaving(false); return; }
    if (isNaN(dur) || dur <= 0) { setError('Duration must be a positive integer'); setSaving(false); return; }
    if (isNaN(tm) || tm <= 0) { setError('Total marks must be positive'); setSaving(false); return; }
    if (isNaN(pm) || pm < 0 || pm > tm) { setError('Passing marks must be between 0 and total marks'); setSaving(false); return; }
    if (isNaN(nm) || nm < 0) { setError('Negative marks must be 0 or positive'); setSaving(false); return; }

    try {
      // Convert datetime-local values (which are in local time) to proper UTC ISO strings
      // This fixes the timezone offset issue (e.g. IST is UTC+5:30)
      const startUTC = form.start_time ? new Date(form.start_time).toISOString() : '';
      const endUTC = form.end_time ? new Date(form.end_time).toISOString() : '';

      const payload = {
        ...form,
        subject_id: form.subject_id,
        duration_mins: dur,
        total_marks: tm,
        passing_marks: pm,
        negative_marks: nm,
        randomize: form.shuffle_questions,
        num_questions: nq,
        start_time: startUTC,
        end_time: endUTC,
      };
      if (editing) {
        await api.put(`/exams/${editing.id}`, payload);
        showToast('Exam updated successfully');
      } else {
        await api.post('/exams', payload);
        showToast('Exam created successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (examId) => {
    setPublishing(examId);
    try {
      await api.post(`/exams/${examId}/publish`);
      showToast('Exam published! Students can now take it.');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Publish failed', 'error');
    } finally {
      setPublishing(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(confirmDelete.id);
    setConfirmDelete(null);
    try {
      await api.delete(`/exams/${confirmDelete.id}`);
      showToast(`Exam "${confirmDelete.title}" deleted successfully`);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'live') return <span className="badge-live">Live</span>;
    if (status === 'completed') return <span className="badge-completed">Completed</span>;
    return <span className="badge-draft">Draft</span>;
  };

  return (
    <div className="page-container">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-glass animate-slide-down
          ${toast.type === 'error' ? 'bg-danger-500/20 border border-danger-500/30 text-danger-400' : 'bg-success-500/20 border border-success-500/30 text-success-400'}`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          <span className="text-sm font-medium">{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link to="/dashboard" className="btn-ghost p-2"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="page-title">Manage Exams</h1>
      </div>
      <p className="page-subtitle ml-12 mb-6">Create, edit, and publish examinations</p>

      {exams.length > 0 && (
        <div className="flex justify-end mb-6">
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Exam
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : exams.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <BookOpen className="w-12 h-12 text-surface-400 mx-auto mb-3" />
          <p className="text-surface-300">No exams yet. Create your first exam!</p>
          <button onClick={openCreate} className="btn-primary mt-4 inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Exam
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr>
                {['Title', 'Subject', 'Duration', 'Marks', 'Status', 'Actions'].map(h => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exams.map(exam => (
                <tr key={exam.id} className="hover:bg-white/5 transition-colors">
                  <td className="table-cell font-medium text-white">{exam.title}</td>
                  <td className="table-cell text-surface-300">{exam.subjects?.name || '—'}</td>
                  <td className="table-cell">
                    <span className="flex items-center gap-1.5 text-surface-300">
                      <Clock className="w-3.5 h-3.5" />{exam.duration_mins}m
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="flex items-center gap-1.5 text-surface-300">
                      <Award className="w-3.5 h-3.5" />{exam.total_marks}
                    </span>
                  </td>
                  <td className="table-cell">{getStatusBadge(exam.status)}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(exam)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-surface-300 hover:text-white transition-all"
                        title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {exam.status === 'draft' && (
                        <button onClick={() => handlePublish(exam.id)}
                          disabled={publishing === exam.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 transition-all"
                          title="Publish">
                          {publishing === exam.id
                            ? <Loader className="w-3 h-3 animate-spin" />
                            : <Send className="w-3 h-3" />
                          }
                          Publish
                        </button>
                      )}
                      {exam.status !== 'live' && (
                        <button
                          onClick={() => setConfirmDelete(exam)}
                          disabled={deleting === exam.id}
                          className="p-1.5 rounded-lg hover:bg-danger-500/20 text-surface-400 hover:text-danger-400 transition-all"
                          title="Delete Exam">
                          {deleting === exam.id
                            ? <Loader className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />
                          }
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card p-7 w-full max-w-xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-xl">
                {editing ? 'Edit Exam' : 'Create Exam'}
              </h2>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="input-label">Exam Title</label>
                <input type="text" required value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Data Structures Midterm" className="input-field" />
              </div>

              <div>
                <label className="input-label">Subject</label>
                <select required value={form.subject_id}
                  onChange={e => setForm({ ...form, subject_id: e.target.value })}
                  className="input-field">
                  <option value="" disabled>Select a Subject</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Duration (mins)</label>
                  <input type="number" required min="1" value={form.duration_mins}
                    onChange={e => setForm({ ...form, duration_mins: e.target.value })}
                    className="input-field" />
                </div>
                <div>
                  <label className="input-label">Total Marks</label>
                  <input type="number" required min="1" value={form.total_marks}
                    onChange={e => setForm({ ...form, total_marks: e.target.value })}
                    className="input-field" />
                </div>
                <div>
                  <label className="input-label">Passing Marks</label>
                  <input type="number" required min="0" value={form.passing_marks}
                    onChange={e => setForm({ ...form, passing_marks: e.target.value })}
                    className="input-field" />
                </div>
              <div>
                <label className="input-label">Negative Marks</label>
                <input type="number" min="0" step="0.25" value={form.negative_marks}
                  onChange={e => setForm({ ...form, negative_marks: e.target.value })}
                  className="input-field" />
              </div>
              <div>
                <label className="input-label">How many questions to take</label>
                <input type="number" min="1" step="1" value={form.num_questions}
                  onChange={e => setForm({ ...form, num_questions: e.target.value })}
                  placeholder="Leave blank for all"
                  className="input-field" />
              </div>

              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Start Time</label>
                  <input type="datetime-local" value={form.start_time}
                    onChange={e => setForm({ ...form, start_time: e.target.value })}
                    className="input-field" />
                </div>
                <div>
                  <label className="input-label">End Time</label>
                  <input type="datetime-local" value={form.end_time}
                    onChange={e => setForm({ ...form, end_time: e.target.value })}
                    className="input-field" />
                </div>
              </div>

              <div className="flex gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.shuffle_questions}
                    onChange={e => setForm({ ...form, shuffle_questions: e.target.checked })}
                    className="w-4 h-4 accent-brand-500" />
                  <span className="text-sm text-surface-200">Shuffle Questions</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.show_result}
                    onChange={e => setForm({ ...form, show_result: e.target.checked })}
                    className="w-4 h-4 accent-brand-500" />
                  <span className="text-sm text-surface-200">Show Result Immediately</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                    : editing ? 'Update Exam' : 'Create Exam'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card p-7 w-full max-w-md animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-danger-500/15 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-danger-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Delete Exam?</h2>
                <p className="text-surface-400 text-sm">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-surface-300 text-sm mb-6">
              Are you sure you want to delete{' '}
              <span className="text-white font-semibold">"{confirmDelete.title}"</span>?
              All related data will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm bg-danger-500/20 border border-danger-500/30 text-danger-400 hover:bg-danger-500/30 transition-all">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
