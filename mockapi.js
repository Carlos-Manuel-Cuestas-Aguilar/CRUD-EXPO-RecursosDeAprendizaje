import axios from 'axios';

const API_URL = 'https://66e4eef15cc7f9b6273bde21.mockapi.io/api/recursos';

export const getResources = () => axios.get(API_URL);
export const getResourceById = (id) => axios.get(`${API_URL}/${id}`);
export const addResource = (resource) => axios.post(API_URL, resource);
export const updateResource = (id, resource) => axios.put(`${API_URL}/${id}`, resource);
export const deleteResource = (id) => axios.delete(`${API_URL}/${id}`);
