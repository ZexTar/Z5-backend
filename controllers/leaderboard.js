const checkLeaderboard = (res, Users) => {
	Users.findAll({
		order: [
			['clicks', 'ASC'],
		],
	}).then(data => res.json(data));
};

module.exports = {
	checkLeaderboard,
};
