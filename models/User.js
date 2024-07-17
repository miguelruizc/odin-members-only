const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	username: { type: String, required: true },
	password: { type: String, required: true },
	membership: {
		type: String,
		required: true,
		enum: ['non-member', 'member', 'admin'],
	},
});

const User = mongoose.model('User', userSchema);

module.exports = User;
