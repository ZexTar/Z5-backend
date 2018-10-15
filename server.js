const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const Sequelize = require('sequelize');


const sequelize = new Sequelize('users', 'postgres', 'kale', {
	host: 'localhost',
	dialect: 'postgres',
	operatorsAliases: false,

	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000,
	},
});

const Users = sequelize.define('users', {
	email: {
		type: Sequelize.TEXT,
		unique: true,
		allowNull: false,
	},
	name: Sequelize.STRING,
	clicks: {
		type: Sequelize.BIGINT,
		defaultValue: 9999,
	},
});

const Login = sequelize.define('login', {
	hash: {
		type: Sequelize.STRING,
		allowNull: false,
	},

	email: {
		type: Sequelize.TEXT,
		unique: true,
		allowNull: false,
	},
});

sequelize.sync();

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => { res.send('it is working'); });

app.post('/signin', (req, res) => {
	Login.findAll({
		where: {
			email: req.body.email,
		},
	}).then((data) => {
		const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
		if (isValid) {
			return Users.findAll({
				where: {
					email: req.body.email,
				},
			}).then((user) => {
				res.json(user[0]);
			}).catch(() => res.status(400).json('unable to get user'));
		}
		res.status(400).json('wrong credentials');
		return false;
	}).catch(() => res.status(400).json('wrong credentials'));
});

app.post('/register', (req, res) => {
	const { email, name, password } = req.body;
	const hash = bcrypt.hashSync(password);
	return sequelize.transaction().then(trx => Users.create({
		email,
		name,
	}, { transaction: trx }).then(() => Login.create({
		email,
		hash,
	}, { transaction: trx }).then((user) => {
		res.json(user);
	}).then(() => trx.commit()))
		.catch(() => trx.rollback()))
		.catch(() => res.status(400).json('unable to register'));
});

app.get('/profile/:id', (req, res) => {
	const { id } = req.params;

	Users.findAll({
		where: {
			id,
		},
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

app.put('/updatescore', (req, res) => {
	const { id, clicks } = req.body;
	Users.findAll({
		where: {
			id,
		},
	}).then((user) => {
		if (user.length) {
			const newRecord = (Number(user[0].clicks) > clicks);
			if (newRecord) {
				return Users.update(
					{ clicks },
					{ returning: true, where: { id } },
				).then(() => {
					res.json('updated');
				}).catch(() => {
					res.status(400).json('unable to get clicks');
				});
			}
			res.json('not a record');
		}
		return false;
	});
});


app.get('/leaderboard', (req, res) => {
	Users.findAll({
		order: [
			['clicks', 'ASC'],
		],
	}).then(data => res.json(data));
});

app.listen(3000, () => {
	console.log('app is running on port 3000');
});
