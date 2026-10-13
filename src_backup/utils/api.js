import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Incidents
export const getIncidents  = (params)    => api.get('/incidents/index.php', { params });
export const getIncident   = (id)        => api.get('/incidents/show.php', { params: { id } });
export const createIncident = (data)     => api.post('/incidents/create.php', data);
export const updateIncident = (data)     => api.put('/incidents/update.php', data);
export const deleteIncident = (id)       => api.delete('/incidents/delete.php', { data: { id } });

// Quick resolve (status update shortcut)
export const resolveIncident = (id) =>
  api.put('/incidents/update.php', { id, status: 'resolved', action_taken: 'Resolved via quick action.' });

// Stats
export const getStats  = () => api.get('/stats/summary.php');
export const getCharts = () => api.get('/stats/charts.php');

// Users
export const getUsers    = ()     => api.get('/users/index.php');
export const createUser  = (data) => api.post('/users/index.php', data);
export const updateUser  = (data) => api.put('/users/index.php', data);

// Audit
export const getAuditLogs = (page) => api.get('/audit/index.php', { params: { page } });

export default api;
