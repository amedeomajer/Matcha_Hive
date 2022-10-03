const express = require('express');
const db = require('./config/db.js');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { sendMail } = require('./utils/sendEmail');


require('dotenv').config();

const requestLogger = (request, response, next) => {
	console.log('Method:', request.method)
	console.log('Path:  ', request.path)
	console.log('Body:  ', request.body)
	console.log('---')
	next();
}

//app.use(cors({credentials : true, origin : 'http://localhost:3000'}));
//app.use(cors());
app.use(express.json());
app.use(cookieParser())
app.use(requestLogger);
app.use(express.static('build'));

app.get('/api/users', (request, response) => {
	const sql = 'SELECT * FROM users';
	db.query(sql,
		function (error, result) {
			if (error) throw error
			response.send(result);
		})
})

app.post('/api/users/activate', (request, response) => {
	const sql = 'SELECT * FROM users WHERE activation_token = ?';
	
	const token = request.body.token;
	console.log(request.body)
	db.query(sql, [token], function(error, result) {
		if (error) throw error;
		if (result.length > 0) {
			const sql = "UPDATE users SET acti_stat = 1 WHERE id = ?"
			db.query(sql, [result[0].id], function (error, result) {
				if (error) throw error;
				response.status(202).send('user activated :)');
			})
		} else {
			response.send('user not found');
		}
	})
})

app.post('/api/login', (request, response) => {
	const sql = 'SELECT * FROM users WHERE email = ?';
	const email = request.body.email;
	const password = request.body.password;
	db.query(sql, [email],
		function (error, result) {
			if (error) throw error;
			if (result.length > 0) {
				bcrypt.compare(password,  result[0].password, function(err, compare) {
					if (err)
						console.log(err);
					console.log(compare)
					if (compare === true) {
						const user = { name : result[0].username , id : result[0].id }
						const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
						response.status(202).cookie('token', accessToken,
							{ 
								path: '/',
								httpOnly: true
							}).send('cookie initialized');
						
					} else {
						response.send('wrong password')
					}
				});
			}
			else 
				response.send('user not found');
		})
})

app.post('/api/login', (request, response) => {
	const sql = 'SELECT * FROM users WHERE email = ?';
	const email = request.body.email;
	const password = request.body.password;
	db.query(sql, [email],
		function (error, result) {
			if (error) throw error;
			if (result.length > 0) {
				bcrypt.compare(password,  result[0].password, function(err, compare) {
					if (err)
						console.log(err);
					console.log(compare)
					if (compare === true) {
						const user = { name : result[0].username , id : result[0].id }
						const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
						response.status(202).cookie('token', accessToken,
							{ 
								path: '/',
								httpOnly: true
							}).send('cookie initialized');
						
					} else {
						response.send('wrong password')
					}
				});
			}
			else 
				response.send('user not found');
		})
})

app.post('/api/set-up-user', (request, response) => {
	console.log(request.cookies);
})

app.post('/api/register', (request, response) => {

	const name = request.body.name;
	const email = request.body.email;
	const password = request.body.password;
	const sqlEmailCheck = 'SELECT * FROM users WHERE email = ?';
	db.query(sqlEmailCheck, [email],
		function (error, result) {
			if (error) throw error;
			if (result.length > 0) {
				response.status(228).send('Email already in use');
			} else {
				const hash = bcrypt.hashSync(password, 10);
				const activationToken = bcrypt.hashSync(email, 10).replace(/\//g,'_').replace(/\+/g,'-');;
				const sql = `INSERT INTO users \
				(username, email, password, activation_token) \
				VALUES \
				(?, ?, ?, ?)`;
				db.query(sql,[ name, email, hash, activationToken ], 
					function (error, results) {
						if (error) throw error;
						else 
							console.log('row added');
					}
				);
				const infoForEmail = {
					email,
					activationToken
				}
				sendMail(infoForEmail);
				response.status(201).json({
					name: name,
					email: email,
					password: password,
				})
			}
		})
})

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Listening on port ${port}`))
