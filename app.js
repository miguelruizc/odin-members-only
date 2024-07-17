const express = require('express');
const path = require('node:path');
const mongoose = require('mongoose');
const Post = require('./models/Post');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
// const passport = require('passport');
// const session = require('express-session');
// const LocalStrategy = require('passport-local').Strategy;

const port = process.env.PORT || 3000;

const app = express();

// // Middleware for passport
app.use(express.urlencoded({ extended: true }));
// app.use(session({ secret: process.env.SECRET }));
// app.use(passport.initialize());
// app.use(passport.session());

// // Passport configuration
// passport.use(
// 	newLocalStrategy((username, password, done) => {
// 		const user = users.find(
// 			(u) => u.username === username && u.password === password
// 		);
// 		if (!user) return done(null, false, { message: 'Invalid credentials' });
// 		return done(null, user);
// 	})
// );
// passport.serializeUser((user, done) => done(null, user.id));
// passport.deserializeUser((id, done) => {
// 	const user = users.find((u) => u.id === id);
// 	done(null, user);
// });

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/login', (req, res) => {
	res.status(200).render('login', { title: 'Log In' });
});
app.get('/register', (req, res) => {
	res.status(200).render('register', { title: 'Register', errors: [] });
});
app.post('/register', async (req, res) => {
	let errors = [];
	const username = req.body.username;
	let password = req.body.password;
	const exists = await User.find({ username: username });
	if (exists.length > 0) {
		errors.push('Username already exists');
		return res.render('register', { title: 'Register', errors });
	}

	try {
		password = await bcrypt.hash(req.body.password, Math.random());
		const newUser = new User({
			username,
			password,
			membership: 'non-member',
		});

		try {
			const savedUser = await newUser.save();
			console.log('New user saved: ', savedUser);
			res.redirect('/login');
		} catch (error) {
			console.log(error);
			res.redirect('/register');
		}
	} catch (error) {
		console.log(error);
		res.redirect('/register');
	}
});
app.get('/post', (req, res, next) => {
	res.status(200).render('post', { title: 'Log In' });
});
app.get('/logout', (req, res) => {
	res.redirect('/');
});
app.get('/', async (req, res) => {
	const posts = await Post.find({});
	res.status(200).render('index', { title: 'Only Members', posts });
});

mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => {
		console.log('Conected to database: ', mongoose.connection.name);

		app.listen(port, () =>
			console.log(`Server running, listening port ${port}`)
		);
	})
	.catch((err) => console.error('Error connecting to database: ', err));
