const getProfile = (req, res, Users) => {
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
};

module.exports = {
	getProfile,
};
