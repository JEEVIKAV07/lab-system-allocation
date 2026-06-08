import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { studentsAPI, batchesAPI } from '../utils/api';

const DEPTS = ['CSE','ECE','EEE','IT','MECH','CIVIL','MBA','MCA'];
const EMPTY = { name: '', rollNumber: '', email: '', department: 'CSE', semester: 1, section: 'A', phone: '' };

export default function Students() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');

  const load = () => {
    Promise.all([studentsAPI.getAll(), batchesAPI.getAll()])
      .then(([s, b]) => { setStudents(s.data); setBatches(b.data); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit = (s) => { setForm({ name: s.name, rollNumber: s.rollNumber, email: s.email, department: s.department, semester: s.semester, section: s.section, phone: s.phone || '' }); setEditing(s._id); setModal(true); };
  const close = () => setModal(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    try {
      if (editing) { await studentsAPI.update(editing, form); toast.success('Student updated'); }
      else { await studentsAPI.create(form); toast.success('Student added'); }
      load(); close();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete student?')) return;
    try { await studentsAPI.delete(id); toast.success('Student deleted'); load(); }
    catch (e) { toast.error('Delete failed'); }
  };

  const getBatchName = (student) => {
    if (!student.batch) return null;
    const b = batches.find(x => x._id === (student.batch?._id || student.batch));
    return b?.batchName;
  };

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    const matchDept = !filterDept || s.department === filterDept;
    return matchSearch && matchDept;
  });

  return (
    <>
      <div className="page-header">
        <div className="page-title">Students</div>
        <div className="page-subtitle">Manage enrolled students</div>
      </div>
      <div className="topbar">
        <div className="search-input-wrap">
          <span className="search-icon">⌕</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, roll, email..." />
        </div>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ width: 140 }}>
          <option value="">All Departments</option>
          {DEPTS.map(d => <option key={d}>{d}</option>)}
        </select>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Student</button>
      </div>
      <div className="page-body">
        <div className="card">
          <div className="section-header">
            <div className="section-title">Students ({filtered.length})</div>
          </div>
          {loading ? <div className="loading">Loading...</div> : filtered.length === 0 ? <div className="empty-state">No students found.</div> : (
            <div className="table-wrap">
              <table>
                <thead><tr>
                  <th>Name</th><th>Roll No.</th><th>Email</th><th>Dept / Sem / Sec</th><th>Batch</th><th>Phone</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s._id}>
                      <td style={{ fontWeight: 600, color: 'var(--text)' }}>{s.name}</td>
                      <td><span className="text-mono text-accent">{s.rollNumber}</span></td>
                      <td style={{ fontSize: 12 }}>{s.email}</td>
                      <td>
                        <span className="badge badge-blue">{s.department}</span>
                        <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', marginLeft: 6 }}>S{s.semester} · {s.section}</span>
                      </td>
                      <td>
                        {getBatchName(s)
                          ? <span className="badge badge-green">{getBatchName(s)}</span>
                          : <span className="badge badge-gray">Unallocated</span>}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text3)' }}>{s.phone || '—'}</td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Student' : 'Add New Student'}</div>
              <button className="btn btn-ghost btn-icon" onClick={close}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group full">
                <label>Full Name</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Student full name" />
              </div>
              <div className="form-group">
                <label>Roll Number</label>
                <input value={form.rollNumber} onChange={e => set('rollNumber', e.target.value)} placeholder="e.g. 21CSE001" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="student@college.edu" />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select value={form.department} onChange={e => set('department', e.target.value)}>
                  {DEPTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Semester</label>
                <select value={form.semester} onChange={e => set('semester', Number(e.target.value))}>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Section</label>
                <input value={form.section} onChange={e => set('section', e.target.value)} placeholder="e.g. A" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="10-digit number" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={close}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit}>{editing ? 'Update' : 'Add'} Student</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
