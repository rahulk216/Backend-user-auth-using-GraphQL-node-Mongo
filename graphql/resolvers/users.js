const User = require('../../models/User');
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../../config.js');

module.exports = {
	Mutation: {
		async register(
			_,
			{ registerInput: { username, password, email, confirmPassword } },
			context,
			info
		) {
			password = await md5(password);
			const newUser = new User({
				email,
				username,
				password,
				createdAt: new Date().toISOString(),
			});

			const res = await newUser.save();
			const token = jwt.sign(
				{
					id: res.id,
					email: res.email,
					username: res.username,
				},
				SECRET_KEY,
				{ expiresIn: '1hr' }
			);
			return {
				...res._doc,
				id: res._id,
				token,
			};
		},
	},
};
