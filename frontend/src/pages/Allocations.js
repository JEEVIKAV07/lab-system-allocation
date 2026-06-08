import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { studentsAPI, batchesAPI, allocationsAPI } from '../utils/api';

export default function Allocations() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filterDept, setFilterDept] = useState('');
  const [filterSem, setFilterSem] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('unallocated'); // 'unallocated' | 'allocated'

  const load = () => {
    Promise.all([studentsAPI.getAll(), batchesAPI.getAll()])
      .then(([s, b]) => { setStudents(s.data); setBatches(b.data); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const toggle = (id) => setSelectedStudents(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);
  const toggleAll = (list) => {
    const ids = list.map(s => s._id);
    const allSelected = ids.every(id => selectedStudents.includes(id));
    setSelectedStudents(allSelected ? selectedStudents.filter(id => !ids.includes(id)) : [...new Set([...selectedStudents, ...ids])]);
  };

  const handleAssign = async () => {
    if (!selectedBatch) return toast.error('Select a batch first');
    if (!selectedStudents.length) return toast.error('Select at least one student');
    try {
      await allocationsAPI.bulkAssign(selectedStudents, selectedBatch);
      toast.success(`${selectedStudents.length} students allocated`);
      setSelectedStudents([]);
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const handleUnassign = async (studentId) => {
    try {
      await allocationsAPI.unassign(studentId);
      toast.success('Student unassigned');
      load();
    } catch (e) { toast.error('Error'); }
  };

  const getBatch = (s) => batches.find(b => b._id === (s.batch?._id || s.batch));

  const unallocated = students.filter(s => !s.batch).filter(s => {
    const q = search.toLowerCase();
    return (!q || s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q))
      && (!filterDept || s.department === filterDept)
      && (!filterSem || String(s.semester) === filterSem);
  });

  const allocated = students.filter(s => s.batch).filter(s => {
    const q = search.toLowerCase();
    return (!q || s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q))
      && (!filterDept || s.department === filterDept);
  });

  const depts = [...new Set(students.map(s => s.department))];
  const sems = [...new Set(students.map(s => s.semester))].sort();
  const batchFill = selectedBatch ? batches.find(b => b._id === selectedBatch) : null;

  return (
    <>
      <div className="page-header">
        <div className="page-title">Batch Allocations</div>
        <div className="page-subtitle">Assign students to lab batches</div>
      </div>
      <div className="page-body">
        {/* Batch selector + assign panel */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 16, alignItems: 'end' }}>
            <div className="form-group">
              <label>Select Target Batch</label>
              <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
                <option value="">— Choose a batch —</option>
                {batches.map(b => <option key={b._id} value={b._id}>{b.batchName} ({b.batchCode}) · {b.studentCount}/{b.maxCapacity}</option>)}
              </select>
            </div>
            <div>
              {batchFill && (
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>
                    <span>{batchFill.subject}</span> · <span style={{ color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{batchFill.lab?.labName}</span>
                    <span style={{ marginLeft: 12, color: batchFill.studentCount >= batchFill.maxCapacity ? 'var(--danger)' : 'var(--success)' }}>
                      {batchFill.studentCount}/{batchFill.maxCapacity} filled
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min((batchFill.studentCount/batchFill.maxCapacity)*100,100)}%` }} />
                  </div>
                </div>
              )}
            </div>
            <button className="btn btn-primary" onClick={handleAssign} disabled={!selectedStudents.length || !selectedBatch}>
              Assign {selectedStudents.length > 0 ? `(${selectedStudents.length})` : ''} →
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 4 }}>
            <button className={`btn btn-sm ${view === 'unallocated' ? 'btn-primary' : 'btn-ghost'}`} style={{ border: 'none' }} onClick={() => setView('unallocated')}>
              Unallocated ({students.filter(s => !s.batch).length})
            </button>
            <button className={`btn btn-sm ${view === 'allocated' ? 'btn-primary' : 'btn-ghost'}`} style={{ border: 'none' }} onClick={() => setView('allocated')}>
              Allocated ({students.filter(s => s.batch).length})
            </button>
          </div>
          <div className="search-input-wrap">
            <span className="search-icon">⌕</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ width: 180 }} />
          </div>
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ width: 130 }}>
            <option value="">All Depts</option>
            {depts.map(d => <option key={d}>{d}</option>)}
          </select>
          {view === 'unallocated' && (
            <select value={filterSem} onChange={e => setFilterSem(e.target.value)} style={{ width: 110 }}>
              <option value="">All Sems</option>
              {sems.map(s => <option key={s}>Sem {s}</option>)}
            </select>
          )}
        </div>

        <div className="card">
          {loading ? <div className="loading">Loading...</div> : view === 'unallocated' ? (
            <>
              <div className="section-header">
                <div className="section-title">Unallocated Students ({unallocated.length})</div>
                {unallocated.length > 0 && (
                  <button className="btn btn-ghost btn-sm" onClick={() => toggleAll(unallocated)}>
                    {unallocated.every(s => selectedStudents.includes(s._id)) ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>
              {unallocated.length === 0 ? <div className="empty-state">All students are allocated ✓</div> : (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>✓</th><th>Name</th><th>Roll No.</th><th>Dept</th><th>Sem / Sec</th></tr></thead>
                    <tbody>
                      {unallocated.map(s => (
                        <tr key={s._id} onClick={() => toggle(s._id)} style={{ cursor: 'pointer', background: selectedStudents.includes(s._id) ? 'rgba(59,130,246,0.08)' : '' }}>
                          <td>
                            <input type="checkbox" checked={selectedStudents.includes(s._id)} onChange={() => toggle(s._id)} onClick={e => e.stopPropagation()} />
                          </td>
                          <td style={{ fontWeight: 600, color: 'var(--text)' }}>{s.name}</td>
                          <td><span className="text-mono text-accent">{s.rollNumber}</span></td>
                          <td><span className="badge badge-blue">{s.department}</span></td>
                          <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>S{s.semester} · {s.section}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="section-header">
                <div className="section-title">Allocated Students ({allocated.length})</div>
              </div>
              {allocated.length === 0 ? <div className="empty-state">No students allocated yet.</div> : (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Name</th><th>Roll No.</th><th>Dept</th><th>Batch</th><th>Lab</th><th>Action</th></tr></thead>
                    <tbody>
                      {allocated.map(s => {
                        const b = getBatch(s);
                        return (
                          <tr key={s._id}>
                            <td style={{ fontWeight: 600, color: 'var(--text)' }}>{s.name}</td>
                            <td><span className="text-mono text-accent">{s.rollNumber}</span></td>
                            <td><span className="badge badge-blue">{s.department}</span></td>
                            <td><span className="badge badge-green">{b?.batchName || '—'}</span></td>
                            <td style={{ fontSize: 12, color: 'var(--text3)' }}>{b?.lab?.labName || '—'}</td>
                            <td>
                              <button className="btn btn-danger btn-sm" onClick={() => handleUnassign(s._id)}>Remove</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
