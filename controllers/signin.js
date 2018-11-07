const handleSignIn = (req, res, bcrypt, Login, Users) => {
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
};

module.exports = handleSignIn;
