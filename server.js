const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const db = knex({
	client: 'pg',
	connection: {
		host: '127.0.0.1',
		user: 'postgres',
		password: '',
		database: 'users',
	},
});

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => { res.send('it is working'); });

app.post('/signin', (req, res) => {
	db.select('email', 'hash').from('login')
		.where('email', '=', req.body.email)
		.then((data) => {
			const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
			if (isValid) {
				return db.select('*').from('users')
					.where('email', '=', req.body.email)
					.then((user) => {
						console.log(user);
						res.json(user[0]);
					})
					.catch(() => res.status(400).json('unable to get user'));
			}
			res.status(400).json('wrong credentials');
			return false;
		})
		.catch(() => res.status(400).json('wrong credentials'));
});

app.get('/profile/:id', (req, res) => {
	const { id } = req.params;
	db.select('*').from('users').where({
		id,
	})
		.then((user) => {
			if (user.length) {
				res.json(user[0]);
			} else {
				res.status(400).json('Not found');
			}
		})
		.catch(() => res.status(400).json('error getting user'));
});

app.get('/leaderboard', (req, res) => {
	db.select()
		.table('users')
		.orderBy('clicks', 'asc')
		.then(data => res.json(data));
});

app.post('/register', (req, res) => {
	const { email, name, password } = req.body;
	const hash = bcrypt.hashSync(password);

	db.transaction((trx) => {
		trx.insert({
			hash,
			email,
		})
			.into('login')
			.returning('email')
			.then(loginEmail => db('users')
				.returning('*')
				.insert({
					email: loginEmail[0],
					name,
					joined: new Date(),
				})
				.then((user) => {
					res.json(user[0]);
				}))
			.then(trx.commit)
			.catch(trx.rollback);
	})
		.catch(() => res.status(400).json('unable to register'));
});

app.put('/updatescore', (req, res) => {
	const { id, clicks } = req.body;

	db('users').where('id', '=', id).then((user) => {
		if (user.length) {
			const newRecord = (Number(user[0].clicks) > clicks);
			if (newRecord) {
				return db('users').where('id', '=', id).update('clicks', clicks)
					.returning('clicks')
					.then((userclicks) => {
						res.json(userclicks[0]);
					})
					.catch(() => res.status(400).json('unable to get entries'));
			}
			res.json('not a record');
		}
		return false;
	});
});

app.listen(3000, () => {
	console.log('app is running on port 3000');
});
