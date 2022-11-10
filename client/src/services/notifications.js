import axios from 'axios';
const baseUrl = '/api/notifications';

export const view = (newObject) => {
	console.log('view', newObject);
	return axios.post(`${baseUrl}/view`, newObject, { withCredentials: true});
}

export const getNofications = () => {
	return axios.post(`${baseUrl}`, { withCredentials: true});
}

export const setNotificationsRead = () => {
	return axios.post(`${baseUrl}/read`, { withCredentials: true});
}