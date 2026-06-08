import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { batchesAPI, labsAPI } from '../utils/api';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DEPTS = ['CSE','ECE','EEE','IT','MECH','CIVIL','MBA','MCA'];
const EMPTY = { batchName: '', batchCode: '', lab: '', maxCapacity: 30, subject: '', instructor: '', semester: 1, department: 'CSE', schedule: { day: 'Monday', startTime: '09:00', endTime: '11:00' } };

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);

  const load = () => {
    Promise.all([batchesAPI.getAll(), labsAPI.getAll()])
      .then(([b, l]) => { setBatches(b.data); setLabs(l.data); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm({ ...EMPTY, lab: labs[0]?._id || '' }); setEditing(null); setModal(true); };
  const openEdit = (b) => {
    setForm({ ...b, lab: b.lab?._id || b.lab, schedule: b.schedule || { day: 'Monday', startTime: '09:00', endTime: '11:00' } });
    setEditing(b._id); setModal(true);
  };
  const close = () => setModal(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setSched = (k, v) => setForm(f => ({ ...f, schedule: { ...f.schedule, [k]: v } }));

  const handleSubmit = async () => {
    try {
      if (editing) { await batchesAPI.update(editing, form); toast.success('Batch updated'); }
      else { await batchesAPI.create(form); toast.success('Batch created'); }
      load(); close();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete batch? Students will be unassigned.')) return;
    try { await batchesAPI.delete(id); toast.success('Batch deleted'); load(); }
    catch (e) { toast.error('Delete failed'); }
  };

  const fillPct = (b) => b.maxCapacity ? Math.min(Math.round((b.studentCount / b.maxCapacity) * 100), 100) : 0;

  return (
    <>
      <div className="page-header">
        <div className="page-title">Batches</div>
        <div className="page-subtitle">Manage lab batch schedules and capacities</div>
      </div>
      <div className="page-body">
        <div className="card">
          <div className="section-header">
            <div className="section-title">All Batches ({batches.length})</div>
            <button className="btn btn-primary" onClick={openAdd}>+ Add Batch</button>
          </div>
          {loading ? <div className="loading">Loading...</div> : batches.length === 0 ? <div className="empty-state">No batches yet.</div> : (
            <div className="table-wrap">
              <table>
                <thead><tr>
                  <th>Batch</th><th>Subject</th><th>Lab</th><th>Schedule</th><th>Dept / Sem</th><th>Capacity</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {batches.map(b => (
                    <tr key={b._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>{b.batchName}</div>
                        <div style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{b.batchCode}</div>
                      </td>
                      <td>
                        <div>{b.subject}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{b.instructor}</div>
                      </td>
                      <td>{b.lab?.labName || '—'}</td>
                      <td>
                        <span className="badge badge-purple">{b.schedule?.day}</span>
                        <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', marginTop: 4 }}>{b.schedule?.startTime} – {b.schedule?.endTime}</div>
                      </td>
                      <td>{b.department} · Sem {b.semester}</td>
                      <td>
                        <div style={{ width: 100 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11, fontFamily: 'var(--mono)' }}>
                            <span>{b.studentCount}/{b.maxCapacity}</span>
                            <span>{fillPct(b)}%</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${fillPct(b)}%`, background: fillPct(b) > 90 ? 'var(--danger)' : fillPct(b) > 70 ? 'var(--warning)' : 'var(--success)' }} />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(b)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b._id)}>Del</button>
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
              <div className="modal-title">{editing ? 'Edit Batch' : 'Add New Batch'}</div>
              <button className="btn btn-ghost btn-icon" onClick={close}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Batch Name</label>
                <input value={form.batchName} onChange={e => set('batchName', e.target.value)} placeholder="e.g. Batch A" />
              </div>
              <div className="form-group">
                <label>Batch Code</label>
                <input value={form.batchCode} onChange={e => set('batchCode', e.target.value)} placeholder="e.g. CSE-A-S3" />
              </div>
              <div className="form-group full">
                <label>Subject</label>
                <input value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="e.g. Data Structures Lab" />
              </div>
              <div className="form-group full">
                <label>Instructor</label>
                <input value={form.instructor} onChange={e => set('instructor', e.target.value)} placeholder="Instructor name" />
              </div>
              <div className="form-group">
                <label>Lab</label>
                <select value={form.lab} onChange={e => set('lab', e.target.value)}>
                  <option value="">Select Lab</option>
                  {labs.map(l => <option key={l._id} value={l._id}>{l.labName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Max Capacity</label>
                <input type="number" value={form.maxCapacity} onChange={e => set('maxCapacity', Number(e.target.value))} min={1} />
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
                <label>Day</label>
                <select value={form.schedule?.day} onChange={e => setSched('day', e.target.value)}>
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Start Time</label>
                <input type="time" value={form.schedule?.startTime} onChange={e => setSched('startTime', e.target.value)} />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input type="time" value={form.schedule?.endTime} onChange={e => setSched('endTime', e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={close}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit}>{editing ? 'Update' : 'Create'} Batch</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
