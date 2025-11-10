import api from '../config/api';

// CRUD de Mesas
export const mesasService = {
  getAll: () => api.get('/mesas'),
  getActive: () => api.get('/mesas?activas=true'),
  getOne: (numero) => api.get(`/mesas/${numero}`),
  getByCapacity: (capacidad) => api.get(`/mesas/capacidad/${capacidad}`),
  create: (data) => api.post('/mesas', data),
  update: (numero, data) => api.patch(`/mesas/${numero}`, data),
  delete: (numero) => api.delete(`/mesas/${numero}`),
};

// CRUD de Clientes
export const clientesService = {
  getAll: () => api.get('/clientes'),
  getActive: () => api.get('/clientes?activos=true'),
  getOne: (id) => api.get(`/clientes/${id}`),
  getByEmail: (email) => api.get(`/clientes/email/${email}`),
  searchByName: (nombre) => api.get(`/clientes/buscar?nombre=${nombre}`),
  getHistorial: (id) => api.get(`/clientes/${id}/historial`),
  create: (data) => api.post('/clientes', data),
  update: (id, data) => api.patch(`/clientes/${id}`, data),
  delete: (id) => api.delete(`/clientes/${id}`),
};

// CRUD de Reservas
export const reservasService = {
  getAll: () => api.get('/reservas'),
  getOne: (id) => api.get(`/reservas/${id}`),
  getDelDia: (fecha) => api.get(`/reservas/dia${fecha ? `?fecha=${fecha}` : ''}`),
  getDisponibilidad: (fecha, hora) => api.get(`/reservas/disponibilidad?fecha=${fecha}&hora=${hora}`),
  create: (data) => api.post('/reservas', data),
  update: (id, data) => api.patch(`/reservas/${id}`, data),
  cancel: (id) => api.patch(`/reservas/${id}/cancelar`),
  delete: (id) => api.delete(`/reservas/${id}`),
};

// Consultas Especiales
export const consultasService = {
  disponibilidadMesas: (fecha, hora) => api.get(`/consultas/disponibilidad-mesas?fecha=${fecha}&hora=${hora}`),
  reservasDelDia: (fecha) => api.get(`/consultas/reservas-dia${fecha ? `?fecha=${fecha}` : ''}`),
  historialCliente: (clienteId) => api.get(`/consultas/historial-cliente?cliente_id=${clienteId}`),
  resumenOcupacion: (fecha) => api.get(`/consultas/resumen-ocupacion${fecha ? `?fecha=${fecha}` : ''}`),
  mesasPopulares: (dias) => api.get(`/consultas/mesas-populares${dias ? `?dias=${dias}` : ''}`),
};
