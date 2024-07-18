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

userSchema.virtual('membershipInfo').get(function () {
	switch (this.membership) {
		case 'non-member':
			return 'Non-members can only see messages, become a member to post';
		case 'member':
			return 'Members are awesome and can post messages';
		case 'admin':
			return 'Admin';
		default:
			return 'Invalid membership type';
	}
});

const User = mongoose.model('User', userSchema);

module.exports = User;
