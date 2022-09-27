import axios from 'axios';
const baseUrl = 'http://localhost:5000/api/';


export const createUser = (newObject) => {
	return axios.post(`${baseUrl}register`, newObject);
}

export const setUpUser = (newObject) => {
	return axios.post(`${baseUrl}set-up-user`, newObject);
}