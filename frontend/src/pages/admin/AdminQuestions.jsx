// src/pages/admin/AdminQuestions.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../client/axios.js';
import {
  Plus, FileQuestion, Edit2, ChevronLeft, Upload,
  AlertCircle, CheckCircle, X, Filter, Search, Loader
} from 'lucide-react';

const TYPES = ['mcq', 'true_false', 'short_answer'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

const EMPTY_FORM = {
  body: '', type: 'mcq', subject_id: '',
  correct_answer: '', marks: 1, difficulty: 'medium',
  options: [
    { value: 'A', text: '' },
    { value: 'B', text: '' },
    { value: 'C', text: '' },
    { value: 'D', text: '' }
  ]
};

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ type: '', difficulty: '', search: '' });
  const [showBulk, setShowBulk] = useState(false);
  const [bulkJson, setBulkJson] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchQuestions(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const [{ data: qData }, { data: sData }] = await Promise.all([
        api.get('/questions', { params: { page: 1, limit: 1000 } }),
        api.get('/subjects')
      ]);
      setQuestions(qData.data || []);
      setSubjects(sData.data || []);
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

  const openEdit = (q) => {
    let opts = q.options;
    if (typeof opts === 'string') { try { opts = JSON.parse(opts); } catch { opts = []; } }
    setEditing(q);
    setForm({
      body: q.body,
      type: q.type,
      subject_id: q.subject_id,
      correct_answer: q.correct_answer,
      marks: q.marks,
      difficulty: q.difficulty,
      options: opts?.length
        ? opts
        : [{ value: 'A', text: '' }, { value: 'B', text: '' }, { value: 'C', text: '' }, { value: 'D', text: '' }]
    });
    setError('');
    setShowModal(true);
  };

  const handleOptionChange = (idx, val) => {
    const updated = [...form.options];
    updated[idx] = { ...updated[idx], text: val };
    setForm({ ...form, options: updated });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const parsedMarks = parseFloat(form.marks);

    if (!form.subject_id) { setError('Subject is required'); setSaving(false); return; }
    if (!form.body || form.body.trim().length === 0) { setError('Question body cannot be empty'); setSaving(false); return; }
    if (isNaN(parsedMarks) || parsedMarks <= 0) { setError('Marks must be a positive number'); setSaving(false); return; }
    if (!form.correct_answer || form.correct_answer.toString().trim() === '') { setError('Correct answer is required'); setSaving(false); return; }

    try {
      const payload = {
        ...form,
        subject_id: form.subject_id,
        marks: parsedMarks,
        options: form.type === 'mcq' ? form.options.filter(o => o.text.trim() !== '') : undefined
      };
      if (editing) {
        await api.put(`/questions/${editing.id}`, payload);
        showToast('Question updated');
      } else {
        await api.post('/questions', payload);
        showToast('Question created');
      }
      setShowModal(false);
      fetchQuestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkImport = async () => {
    setBulkLoading(true);
    try {
      const parsed = JSON.parse(bulkJson);
      const questionsArr = Array.isArray(parsed) ? parsed : parsed.questions;
      const { data } = await api.post('/questions/bulk-import', { questions: questionsArr });
      if (data.insertedCount > 0) {
        showToast(`Imported ${data.insertedCount} questions!`);
      } else {
        showToast(`Failed to import: ${data.message}`, 'error');
      }
      setShowBulk(false);
      setBulkJson('');
      fetchQuestions();
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid JSON or import failed', 'error');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setBulkJson(ev.target.result);
    reader.readAsText(file);
  };

  const filtered = questions.filter(q =>
    (!filter.type || q.type === filter.type) &&
    (!filter.difficulty || q.difficulty === filter.difficulty) &&
    (!filter.search || q.body?.toLowerCase().includes(filter.search.toLowerCase()))
  );

  const difficultyBadge = (d) => {
    const cls = d === 'easy' ? 'bg-success-500/15 text-success-400 border-success-500/20'
      : d === 'medium' ? 'bg-warning-500/15 text-warning-400 border-warning-500/20'
      : 'bg-danger-500/15 text-danger-400 border-danger-500/20';
    return <span className={`badge ${cls} capitalize`}>{d}</span>;
  };

  const typeBadge = (t) => (
    <span className="badge bg-brand-500/15 text-brand-400 border border-brand-500/20 capitalize">
      {t?.replace('_', ' ')}
    </span>
  );

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
        <h1 className="page-title">Question Bank</h1>
      </div>
      <p className="page-subtitle ml-12 mb-6">Create and manage examination questions</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
          <input type="text" value={filter.search}
            onChange={e => setFilter({ ...filter, search: e.target.value })}
            placeholder="Search questions..." className="input-field pl-10" />
        </div>
        {/* Type filter */}
        <select value={filter.type} onChange={e => setFilter({ ...filter, type: e.target.value })}
          className="input-field w-auto px-3">
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t} value={t} className="capitalize">{t.replace('_', ' ')}</option>)}
        </select>
        {/* Difficulty filter */}
        <select value={filter.difficulty} onChange={e => setFilter({ ...filter, difficulty: e.target.value })}
          className="input-field w-auto px-3">
          <option value="">All Difficulty</option>
          {DIFFICULTIES.map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
        </select>
        <button onClick={() => setShowBulk(true)} className="btn-secondary flex items-center gap-2 whitespace-nowrap">
          <Upload className="w-4 h-4" /> Bulk Import
        </button>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-4 mb-4 text-sm text-surface-300">
        <span>Total: <strong className="text-white">{questions.length}</strong></span>
        <span>Showing: <strong className="text-white">{filtered.length}</strong></span>
      </div>

      {/* Questions Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <FileQuestion className="w-12 h-12 text-surface-400 mx-auto mb-3" />
          <p className="text-surface-300">No questions found</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr>
                {['#', 'Question', 'Type', 'Difficulty', 'Marks', 'Actions'].map(h => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((q, idx) => (
                <tr key={q.id} className="hover:bg-white/5 transition-colors">
                  <td className="table-cell text-surface-400 text-xs">{idx + 1}</td>
                  <td className="table-cell max-w-xs">
                    <p className="text-white text-sm font-medium line-clamp-2">{q.body}</p>
                  </td>
                  <td className="table-cell">{typeBadge(q.type)}</td>
                  <td className="table-cell">{difficultyBadge(q.difficulty)}</td>
                  <td className="table-cell text-surface-200 font-semibold">{q.marks}</td>
                  <td className="table-cell">
                    <button onClick={() => openEdit(q)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-surface-300 hover:text-white transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
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
                {editing ? 'Edit Question' : 'New Question'}
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
                <label className="input-label">Question Body</label>
                <textarea rows={3} required value={form.body}
                  onChange={e => setForm({ ...form, body: e.target.value })}
                  placeholder="Enter the question text..." className="input-field resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    className="input-field">
                    {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Difficulty</label>
                  <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}
                    className="input-field">
                    {DIFFICULTIES.map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
                  </select>
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
                <div>
                  <label className="input-label">Marks</label>
                  <input type="number" required min="0.25" step="0.25" value={form.marks}
                    onChange={e => setForm({ ...form, marks: e.target.value })}
                    className="input-field" />
                </div>
              </div>

              {form.type === 'mcq' && (
                <div>
                  <label className="input-label">Options</label>
                  <div className="space-y-2">
                    {form.options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-7 h-7 flex-shrink-0 rounded-lg bg-brand-500/15 text-brand-400 flex items-center justify-center text-xs font-bold">
                          {opt.value}
                        </span>
                        <input type="text" value={opt.text}
                          onChange={e => handleOptionChange(idx, e.target.value)}
                          placeholder={`Option ${opt.value}`}
                          className="input-field text-sm py-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="input-label">
                  {form.type === 'true_false' ? 'Correct Answer (True or False)' : 'Correct Answer'}
                </label>
                {form.type === 'true_false' ? (
                  <div className="flex gap-3">
                    {['True', 'False'].map(v => (
                      <button key={v} type="button" onClick={() => setForm({ ...form, correct_answer: v })}
                        className={`flex-1 py-2.5 rounded-xl border font-medium text-sm transition-all
                          ${form.correct_answer === v
                            ? 'bg-brand-500/20 border-brand-500/50 text-brand-300'
                            : 'bg-white/5 border-white/10 text-surface-300 hover:bg-white/10'}`}>
                        {v}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input type="text" required value={form.correct_answer}
                    onChange={e => setForm({ ...form, correct_answer: e.target.value })}
                    placeholder={form.type === 'mcq' ? 'e.g. A' : 'Enter the correct answer'}
                    className="input-field" />
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                    : editing ? 'Update' : 'Create'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card p-7 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-xl">Bulk Import Questions</h2>
              <button onClick={() => setShowBulk(false)} className="btn-ghost p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-surface-300 text-sm mb-4">
              Upload a JSON file or paste JSON directly. Each question needs:{' '}
              <code className="text-brand-400 font-mono text-xs">body, type, subject_id, correct_answer, marks, difficulty, options (for mcq)</code>
            </p>

            <div className="mb-4">
              <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              <button onClick={() => fileInputRef.current.click()}
                className="btn-secondary flex items-center gap-2 text-sm mb-3">
                <Upload className="w-4 h-4" /> Upload JSON File
              </button>
            </div>

            <textarea rows={10} value={bulkJson} onChange={e => setBulkJson(e.target.value)}
              placeholder='[{"body": "What is ...?", "type": "mcq", "subject_id": 1, ...}]'
              className="input-field font-mono text-xs resize-none" />

            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowBulk(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleBulkImport} disabled={!bulkJson.trim() || bulkLoading}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                {bulkLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
