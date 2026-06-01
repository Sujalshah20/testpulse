// src/pages/admin/AdminUsers.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../client/axios.js';
import {
  Plus, Users, Edit2, ChevronLeft, AlertCircle, CheckCircle, X, Loader, Trash2, Mail, Shield
} from 'lucide-react';

const EMPTY_FORM = {
  name: '', email: '', password: '', role: 'student', is_active: true
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
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
      const res = await api.get('/users');
      setUsers(res.data.data || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch users', 'error');
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

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      name: user.name,
      email: user.email,
      password: '', // Leave blank unless changing
      role: user.role,
      is_active: user.is_active !== false // default true
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editing) {
        const payload = {
          name: form.name,
          role: form.role,
          is_active: form.is_active
        };
        if (form.password) payload.password = form.password;
        
        await api.put(`/users/${editing.id}`, payload);
        showToast('User updated successfully');
      } else {
        await api.post('/users', form);
        showToast('User created successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(confirmDelete.id);
    try {
      await api.delete(`/users/${confirmDelete.id}`);
      showToast(`User "${confirmDelete.name}" deleted successfully`);
      setConfirmDelete(null);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin': return <span className="badge bg-danger-500/20 text-danger-400 border border-danger-500/30">Admin</span>;
      case 'examiner': return <span className="badge bg-warning-500/20 text-warning-400 border border-warning-500/30">Examiner</span>;
      case 'invigilator': return <span className="badge bg-purple-500/20 text-purple-400 border border-purple-500/30">Invigilator</span>;
      default: return <span className="badge bg-brand-500/20 text-brand-300 border border-brand-500/30">Student</span>;
    }
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
        <h1 className="page-title">Manage Users</h1>
      </div>
      <p className="page-subtitle ml-12 mb-6">Create, edit, and manage user accounts</p>

      <div className="flex justify-end mb-6">
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New User
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Users className="w-12 h-12 text-surface-400 mx-auto mb-3" />
          <p className="text-surface-300">No users found.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">Email</th>
                <th className="table-header">Role</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="table-cell font-medium text-white">{user.name}</td>
                  <td className="table-cell text-surface-300">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> {user.email}
                    </div>
                  </td>
                  <td className="table-cell">{getRoleBadge(user.role)}</td>
                  <td className="table-cell">
                    {user.is_active !== false ? (
                      <span className="flex items-center gap-1.5 text-success-400 text-sm font-medium">
                        <div className="w-2 h-2 rounded-full bg-success-500" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-surface-400 text-sm font-medium">
                        <div className="w-2 h-2 rounded-full bg-surface-500" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(user)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-surface-300 hover:text-white transition-all"
                        title="Edit User">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => setConfirmDelete(user)}
                        disabled={deleting === user.id}
                        className="p-1.5 rounded-lg hover:bg-danger-500/20 text-surface-400 hover:text-danger-400 transition-all"
                        title="Delete User">
                        {deleting === user.id
                          ? <Loader className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />
                        }
                      </button>
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
          <div className="glass-card p-7 w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-xl">
                {editing ? 'Edit User' : 'Create User'}
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
                <label className="input-label">Full Name</label>
                <input type="text" required value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe" className="input-field" />
              </div>

              <div>
                <label className="input-label">Email</label>
                <input type="email" required={!editing} disabled={!!editing} value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="john@example.com" 
                  className={`input-field ${editing ? 'opacity-50 cursor-not-allowed' : ''}`} />
                {editing && <p className="text-xs text-surface-400 mt-1">Email cannot be changed.</p>}
              </div>

              <div>
                <label className="input-label">Password {editing && '(Leave blank to keep unchanged)'}</label>
                <input type="password" required={!editing} value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••" className="input-field" />
              </div>

              <div>
                <label className="input-label">Role</label>
                <select required value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="input-field">
                  <option value="student">Student</option>
                  <option value="examiner">Examiner</option>
                  <option value="invigilator">Invigilator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {editing && (
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_active}
                      onChange={e => setForm({ ...form, is_active: e.target.checked })}
                      className="w-4 h-4 accent-brand-500" />
                    <span className="text-sm text-surface-200">Account is Active</span>
                  </label>
                  <p className="text-xs text-surface-400 mt-1 ml-6">Inactive users cannot log in.</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                    : editing ? 'Update User' : 'Create User'
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
                <h2 className="text-white font-bold text-lg">Delete User?</h2>
                <p className="text-surface-400 text-sm">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-surface-300 text-sm mb-6">
              Are you sure you want to delete <span className="text-white font-semibold">"{confirmDelete.name}"</span>?
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
