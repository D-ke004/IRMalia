import React, { useEffect, useState } from 'react';
import { getUsers, createUser, updateUser } from '../utils/api';

const ROLES = ['admin', 'desk_officer', 'viewer'];
const empty = { full_name: '', username: '', password: '', role: 'desk_officer', employee_id: '' };

export default function UsersPage() {
  const [users, setUsers]     = useState([]);
  const [form, setForm]       = useState(empty);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg]         = useState('');
  const [err, setErr]         = useState('');

  const load = () => getUsers().then(r => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const flash = (m, isErr = false) => {
    isErr ? setErr(m) : setMsg(m);
    setTimeout(() => { setMsg(''); setErr(''); }, 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateUser({ ...form, id: editing });
        flash('User updated successfully.');
      } else {
        await createUser(form);
        flash('User created successfully.');
      }
      setForm(empty);
      setEditing(null);
      load();
    } catch (ex) {
      flash(ex.response?.data?.error || 'Operation failed.', true);
    }
  };

  const startEdit = (u) => {
    setForm({ full_name: u.full_name, username: u.username, password: '', role: u.role, employee_id: u.employee_id || '', is_active: u.is_active });
    setEditing(u.id);
  };

  const toggleActive = async (u) => {
    await updateUser({ id: u.id, is_active: u.is_active ? 0 : 1 });
    load();
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>👥 User Management</h1>
        <p>Manage barangay officer accounts (Admin only)</p>
      </div>

      <div className="users-layout">
        {/* Form */}
        <div className="users-form-card">
          <h3>{editing ? 'Edit User' : 'Add New User'}</h3>
          {msg && <div className="alert-success">{msg}</div>}
          {err && <div className="alert-error">{err}</div>}
          <form onSubmit={handleSubmit} className="users-form">
            {[['Employee ID', 'employee_id','text',false],
              ['Full Name',   'full_name','text', true],
              ['Username',    'username','text',  !editing],
              ['Password',    'password','password', !editing],
            ].map(([label, key, type, req]) => (
              <div key={key} className="users-field">
                <label>{label}{req && ' *'}</label>
                <input type={type} value={form[key] || ''} placeholder={editing && key === 'password' ? 'Leave blank to keep' : ''}
                  required={req} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="users-field">
              <label>Role *</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="users-form-actions">
              {editing && <button type="button" className="btn btn-secondary" onClick={() => { setForm(empty); setEditing(null); }}>Cancel</button>}
              <button type="submit" className="btn btn-success">{editing ? 'Update User' : 'Create User'}</button>
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="users-table-card">
          <h3>All Accounts ({users.length})</h3>
          <div className="table-wrap">
            <table className="users-table">
              <thead>
                <tr><th>ID</th><th>Name</th><th>Username</th><th>Role</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.employee_id || '—'}</td>
                    <td>{u.full_name}</td>
                    <td><code>{u.username}</code></td>
                    <td><span className={`role-badge role-${u.role}`}>{u.role.replace('_', ' ')}</span></td>
                    <td><span className={u.is_active ? 'badge-active' : 'badge-inactive'}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td className="users-actions">
                      <button className="btn-xs" onClick={() => startEdit(u)}>Edit</button>
                      <button className="btn-xs btn-xs-danger" onClick={() => toggleActive(u)}>{u.is_active ? 'Deactivate' : 'Activate'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
