import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { batchesAPI, attendanceAPI } from '../utils/api';

export default function Attendance() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('mark');

  useEffect(() => {
    batchesAPI.getAll().then(r => setBatches(r.data));
  }, []);

  useEffect(() => {
    if (!selectedBatch) { setStudents([]); setHistory([]); return; }
    setLoading(true);
    Promise.all([
      batchesAPI.getStudents(selectedBatch),
      attendanceAPI.getByBatch(selectedBatch)
    ]).then(([s, h]) => {
      setStudents(s.data);
      // Init records: all absent
      const init = {};
      s.data.forEach(stu => { init[stu._id] = 'Present'; });
      setRecords(init);
      setHistory(h.data);
    }).finally(() => setLoading(false));
  }, [selectedBatch]);

  const setStatus = (id, status) => setRecords(r => ({ ...r, [id]: status }));
  const markAll = (status) => {
    const upd = {};
    students.forEach(s => { upd[s._id] = status; });
    setRecords(upd);
  };

  const handleSave = async () => {
    if (!selectedBatch) return toast.error('Select a batch');
    if (!students.length) return toast.error('No students in batch');
    setSaving(true);
    try {
      const payload = {
        batch: selectedBatch,
        date,
        records: students.map(s => ({ student: s._id, status: records[s._id] || 'Absent' })),
        markedBy: 'Admin'
      };
      await attendanceAPI.mark(payload);
      toast.success('Attendance saved!');
      const h = await attendanceAPI.getByBatch(selectedBatch);
      setHistory(h.data);
    } catch (e) { toast.error(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const present = Object.values(records).filter(v => v === 'Present').length;
  const absent = Object.values(records).filter(v => v === 'Absent').length;
  const late = Object.values(records).filter(v => v === 'Late').length;
  const pct = students.length ? Math.round((present / students.length) * 100) : 0;

  const statusColor = { Present: 'green', Absent: 'red', Late: 'yellow' };
  const statusBadge = (s) => `badge badge-${statusColor[s] || 'gray'}`;

  return (
    <>
      <div className="page-header">
        <div className="page-title">Attendance</div>
        <div className="page-subtitle">Mark and track lab session attendance</div>
      </div>
      <div className="page-body">
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 16, alignItems: 'end' }}>
            <div className="form-group">
              <label>Batch</label>
              <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
                <option value="">— Select Batch —</option>
                {batches.map(b => <option key={b._id} value={b._id}>{b.batchName} — {b.subject}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ display: 'flex', gap: 4, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 4 }}>
                <button className={`btn btn-sm ${tab === 'mark' ? 'btn-primary' : 'btn-ghost'}`} style={{ border: 'none' }} onClick={() => setTab('mark')}>Mark</button>
                <button className={`btn btn-sm ${tab === 'history' ? 'btn-primary' : 'btn-ghost'}`} style={{ border: 'none' }} onClick={() => setTab('history')}>History</button>
              </div>
            </div>
          </div>
        </div>

        {tab === 'mark' && (
          <>
            {selectedBatch && students.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
                <div className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800 }}>{students.length}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>TOTAL</div>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--success)' }}>{present}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>PRESENT</div>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--danger)' }}>{absent}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>ABSENT</div>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)' }}>{pct}%</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>ATTENDANCE</div>
                </div>
              </div>
            )}

            <div className="card">
              <div className="section-header">
                <div className="section-title">
                  {selectedBatch ? `Mark Attendance · ${students.length} students` : 'Select a batch to begin'}
                </div>
                {students.length > 0 && (
                  <div className="flex gap-2">
                    <button className="btn btn-success btn-sm" onClick={() => markAll('Present')}>All Present</button>
                    <button className="btn btn-danger btn-sm" onClick={() => markAll('Absent')}>All Absent</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Attendance'}</button>
                  </div>
                )}
              </div>
              {loading && <div className="loading">Loading students...</div>}
              {!loading && !selectedBatch && <div className="empty-state">Select a batch and date to mark attendance</div>}
              {!loading && selectedBatch && students.length === 0 && <div className="empty-state">No students in this batch</div>}
              {!loading && students.length > 0 && students.map(s => (
                <div key={s._id} className="attendance-row">
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{s.rollNumber}</div>
                  </div>
                  <div className="flex gap-2">
                    {['Present', 'Absent', 'Late'].map(st => (
                      <button
                        key={st}
                        className={`btn btn-sm ${records[s._id] === st ? `badge-${statusColor[st]}` : ''}`}
                        style={{
                          background: records[s._id] === st
                            ? st === 'Present' ? 'rgba(16,185,129,0.2)' : st === 'Absent' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'
                            : 'var(--bg3)',
                          color: records[s._id] === st
                            ? st === 'Present' ? 'var(--success)' : st === 'Absent' ? 'var(--danger)' : 'var(--warning)'
                            : 'var(--text3)',
                          border: '1px solid var(--border)',
                        }}
                        onClick={() => setStatus(s._id, st)}
                      >{st}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'history' && (
          <div className="card">
            <div className="section-header">
              <div className="section-title">Attendance History {selectedBatch ? `(${history.length} sessions)` : ''}</div>
            </div>
            {!selectedBatch && <div className="empty-state">Select a batch to view history</div>}
            {selectedBatch && history.length === 0 && <div className="empty-state">No attendance recorded yet</div>}
            {history.map((session, i) => {
              const pCount = session.records.filter(r => r.status === 'Present').length;
              const total = session.records.length;
              const p = total ? Math.round((pCount/total)*100) : 0;
              return (
                <div key={i} style={{ padding: '14px 0', borderBottom: '1px solid rgba(30,45,80,0.4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {new Date(session.date).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>Marked by {session.markedBy}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>{pCount}/{total}</div>
                      <div style={{ fontSize: 11, color: p >= 75 ? 'var(--success)' : 'var(--danger)' }}>{p}% present</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {session.records.map((r, j) => (
                      <span key={j} className={`badge ${statusBadge(r.status)}`} style={{ fontSize: 10 }}>
                        {r.student?.rollNumber || '?'} · {r.status[0]}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
