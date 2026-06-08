import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { labsAPI } from '../utils/api';

const LAB_TYPES = ['Computer Lab', 'Electronics Lab', 'Physics Lab', 'Chemistry Lab', 'Biology Lab', 'Network Lab', 'Other'];
const EMPTY = { labName: '', labCode: '', building: '', floor: 1, capacity: 30, labType: 'Computer Lab', equipment: [] };

export default function Labs() {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [equipInput, setEquipInput] = useState('');

  const load = () => labsAPI.getAll().then(r => setLabs(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(EMPTY); setEditing(null); setEquipInput(''); setModal(true); };
  const openEdit = (lab) => { setForm({ ...lab, equipment: lab.equipment || [] }); setEditing(lab._id); setEquipInput(''); setModal(true); };
  const close = () => setModal(false);

  const handleSubmit = async () => {
    try {
      if (editing) { await labsAPI.update(editing, form); toast.success('Lab updated'); }
      else { await labsAPI.create(form); toast.success('Lab created'); }
      load(); close();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lab?')) return;
    try { await labsAPI.delete(id); toast.success('Lab deleted'); load(); }
    catch (e) { toast.error('Delete failed'); }
  };

  const addEquip = () => {
    if (equipInput.trim()) {
      setForm(f => ({ ...f, equipment: [...(f.equipment || []), equipInput.trim()] }));
      setEquipInput('');
    }
  };
  const removeEquip = (i) => setForm(f => ({ ...f, equipment: f.equipment.filter((_, idx) => idx !== i) }));

  const typeColor = { 'Computer Lab': 'blue', 'Electronics Lab': 'cyan', 'Physics Lab': 'purple', 'Chemistry Lab': 'green', 'Network Lab': 'yellow', default: 'gray' };
  const getBadge = (t) => `badge badge-${typeColor[t] || typeColor.default}`;

  return (
    <>
      <div className="page-header">
        <div className="page-title">Laboratories</div>
        <div className="page-subtitle">Manage lab rooms and resources</div>
      </div>
      <div className="page-body">
        <div className="card">
          <div className="section-header">
            <div className="section-title">All Labs ({labs.length})</div>
            <button className="btn btn-primary" onClick={openAdd}>+ Add Lab</button>
          </div>
          {loading ? <div className="loading">Loading...</div> : labs.length === 0 ? <div className="empty-state">No labs found. Add your first lab.</div> : (
            <div className="table-wrap">
              <table>
                <thead><tr>
                  <th>Lab Name</th><th>Code</th><th>Type</th><th>Building / Floor</th><th>Capacity</th><th>Equipment</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {labs.map(lab => (
                    <tr key={lab._id}>
                      <td style={{ fontWeight: 600, color: 'var(--text)' }}>{lab.labName}</td>
                      <td><span className="text-mono" style={{ color: 'var(--accent)' }}>{lab.labCode}</span></td>
                      <td><span className={getBadge(lab.labType)}>{lab.labType}</span></td>
                      <td>{lab.building}, Floor {lab.floor}</td>
                      <td>{lab.capacity} seats</td>
                      <td>
                        <div className="chip-list">
                          {(lab.equipment || []).slice(0, 3).map((e, i) => <span key={i} className="chip">{e}</span>)}
                          {(lab.equipment || []).length > 3 && <span className="chip">+{lab.equipment.length - 3}</span>}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(lab)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(lab._id)}>Del</button>
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
              <div className="modal-title">{editing ? 'Edit Lab' : 'Add New Lab'}</div>
              <button className="btn btn-ghost btn-icon" onClick={close}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Lab Name</label>
                <input value={form.labName} onChange={e => setForm(f => ({ ...f, labName: e.target.value }))} placeholder="e.g. Computer Lab A" />
              </div>
              <div className="form-group">
                <label>Lab Code</label>
                <input value={form.labCode} onChange={e => setForm(f => ({ ...f, labCode: e.target.value }))} placeholder="e.g. CL-A101" />
              </div>
              <div className="form-group">
                <label>Building</label>
                <input value={form.building} onChange={e => setForm(f => ({ ...f, building: e.target.value }))} placeholder="e.g. Block A" />
              </div>
              <div className="form-group">
                <label>Floor</label>
                <input type="number" value={form.floor} onChange={e => setForm(f => ({ ...f, floor: Number(e.target.value) }))} min={0} />
              </div>
              <div className="form-group">
                <label>Capacity</label>
                <input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} min={1} />
              </div>
              <div className="form-group">
                <label>Lab Type</label>
                <select value={form.labType} onChange={e => setForm(f => ({ ...f, labType: e.target.value }))}>
                  {LAB_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group full">
                <label>Equipment</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={equipInput} onChange={e => setEquipInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addEquip()} placeholder="Add equipment and press Enter" />
                  <button className="btn btn-ghost" onClick={addEquip}>Add</button>
                </div>
                <div className="chip-list mt-1">
                  {(form.equipment || []).map((e, i) => (
                    <span key={i} className="chip" style={{ cursor: 'pointer' }} onClick={() => removeEquip(i)}>{e} ✕</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={close}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit}>{editing ? 'Update' : 'Create'} Lab</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
