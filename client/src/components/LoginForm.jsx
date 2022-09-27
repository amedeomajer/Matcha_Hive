import React from 'react';
import { useState } from 'react';
import {Link} from 'react-router-dom';
import { loginUser } from '../services/login';
import { cookieProvider, Cookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom'

const LoginForm = () => {
	const [email, setEmail] = useState('amajer69@proton.me');
	const [password, setPassword] = useState('Amedeo11');
	const [error, setError] = useState();
	const Navigate = useNavigate();

	const handleSubmit = (event) => {
		event.preventDefault();
		const userObject = {
			email: email,
			password: password
		}
		loginUser(userObject).then((response) => {
			if (response.data === 'user not found')
				setError('User not found');
			else if (response.data === 'wrong password')
				setError('Wrong password');
			else if (response.status === 202) { // the cookie has been set in the backend and the user is authenticated
				console.log(response);
				// Navigate('../completeaccount');
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition((position) => {
						const userLocation = {
							lat: position.coords.latitude,
							lon: position.coords.longitude
						}
						console.log(userLocation);
					});
				} else {
					console.log('Geolocation is not supported by this browser.');
				}
			}
		});

	}

	const handleChangePassword = (event) => {
		setPassword(event);
	}

	return (
		<div className='p-5'>
			<div className='input-group flex-column m-40 text-warning'>
				<h2>Login</h2>
				<form>
					<label htmlFor="email">Email</label><br></br>
					<input id="email" className='form-control' type="email" value={email} onChange={(e) => setEmail(e.target.value)} /><br></br>
					<label htmlFor='password'>Password</label><br></br>
					<input id="password" className='form-control' type="text" value={password} placeholder="8-13ch. a-z A-Z 0-9" onChange={(e) => handleChangePassword(e.target.value)} />
					<small className='text-danger'>{error}</small><br></br>
					<div className="d-flex justify-content-between">
						<button type="button" className="btn btn-outline-warning" onClick={handleSubmit}>Login</button>
						<button>forgot password?</button>
					</div>
				</form>
				<p className='mt-5 m-lg-5'>Don't Have an account? <Link to="/register">sign up now!</Link></p>
			</div>
		</div>
	);
};

export default LoginForm;