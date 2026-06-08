import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

export const studentsAPI = {
  getAll: (params) => API.get('/students', { params }),
  getOne: (id) => API.get(`/students/${id}`),
  create: (data) => API.post('/students', data),
  update: (id, data) => API.put(`/students/${id}`, data),
  delete: (id) => API.delete(`/students/${id}`),
};

export const batchesAPI = {
  getAll: () => API.get('/batches'),
  getOne: (id) => API.get(`/batches/${id}`),
  create: (data) => API.post('/batches', data),
  update: (id, data) => API.put(`/batches/${id}`, data),
  delete: (id) => API.delete(`/batches/${id}`),
  getStudents: (id) => API.get(`/batches/${id}/students`),
};

export const labsAPI = {
  getAll: () => API.get('/labs'),
  getOne: (id) => API.get(`/labs/${id}`),
  create: (data) => API.post('/labs', data),
  update: (id, data) => API.put(`/labs/${id}`, data),
  delete: (id) => API.delete(`/labs/${id}`),
};

export const attendanceAPI = {
  getAll: (params) => API.get('/attendance', { params }),
  mark: (data) => API.post('/attendance', data),
  getByStudent: (id) => API.get(`/attendance/student/${id}`),
  getByBatch: (id) => API.get(`/attendance/batch/${id}`),
};

export const allocationsAPI = {
  assign: (studentId, batchId) => API.post('/allocations/assign', { studentId, batchId }),
  unassign: (studentId) => API.post('/allocations/unassign', { studentId }),
  bulkAssign: (studentIds, batchId) => API.post('/allocations/bulk-assign', { studentIds, batchId }),
};

export const dashboardAPI = {
  getStats: () => API.get('/dashboard/stats'),
};

export default API;
