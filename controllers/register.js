const handleRegistration = (req, res, bcrypt, sequelize, Users, Login) => {
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
};

module.exports = {
	handleRegistration,
};
