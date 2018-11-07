const updateScore = (req, res, Users) => {
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
};

module.exports = {
	updateScore,
};
