const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const Sequelize = require('sequelize');
const signin = require('./controllers/signin');
const getprofile = require('./controllers/getprofile');
const register = require('./controllers/register');
const updatescore = require('./controllers/updatescore');
const leaderboard = require('./controllers/leaderboard');


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

app.post('/signin', (req, res) => signin.handleSignIn(req, res, bcrypt, Login, Users));

app.post('/register', (req, res) => register.handleRegistration(req, res, bcrypt, sequelize, Users, Login));

app.get('/profile/:id', (req, res) => getprofile.getProfile(req, res, Users));

app.put('/updatescore', (req, res) => updatescore.updateScore(req, res, Users));

app.get('/leaderboard', (req, res) => leaderboard.checkLeaderboard(res, Users));

app.listen(3000, () => {
	console.log('app is running on port 3000');
});
