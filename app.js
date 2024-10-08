const express = require('express');
const path = require('node:path');
const mongoose = require('mongoose');
const Post = require('./models/Post');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;

const port = process.env.PORT || 3000;

const app = express();

// Middleware for passport
app.use(express.urlencoded({ extended: true }));
app.use(
	session({
		secret: process.env.SECRET,
		resave: false,
		saveUninitialized: false,
	})
);
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(
	new LocalStrategy(async (username, password, done) => {
		try {
			const user = await User.findOne({ username });
			if (!user)
				return done(null, false, { message: 'Invalid username' });

			const isValid = await bcrypt.compare(password, user.password);
			if (!isValid)
				return done(null, false, { message: 'Invalid password' });

			return done(null, user);
		} catch (error) {
			return done(error);
		}
	})
);
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
	User.findById(id)
		.then((user) => done(null, user))
		.catch((err) => done(err, null));
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/login', (req, res) => {
	const error = req.query.error;
	res.status(200).render('login', {
		title: 'Log In',
		user: req.user,
		errors: error ? [error] : [],
	});
});
app.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/login?error=Invalid%20credentials',
	})
);
app.get('/register', (req, res) => {
	res.status(200).render('register', {
		title: 'Register',
		user: req.user,
		errors: [],
	});
});
app.post('/register', async (req, res, next) => {
	let errors = [];
	const username = req.body.username;
	let password = req.body.password;
	const exists = await User.find({ username: username });
	if (exists.length > 0) {
		errors.push('Username already exists');
		return res.render('register', {
			title: 'Register',
			user: req.user,
			errors,
		});
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

			passport.authenticate('local', {
				successRedirect: '/',
				failureRedirect: '/login',
			})(req, res, next);

			// res.redirect('/login');
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
	if (req.isAuthenticated()) {
		const errors = req.query.error ? [req.query.error] : [];
		res.status(200).render('post', {
			title: 'Log In',
			user: req.user,
			errors,
		});
	} else res.redirect('login');
});
app.post('/post', async (req, res, next) => {
	if (req.isAuthenticated()) {
		const title = req.body.title.trim();
		const body = req.body.body.trim();
		if (!title || !body)
			return res.redirect(
				'/post?error= ' +
					encodeURIComponent('Title and body are required')
			);

		const newPost = new Post({
			title,
			body,
			author: req.user.username,
		});
		try {
			const savedPost = await newPost.save();
			console.log('Saved: ', savedPost);
		} catch (error) {
			console.log(error);
		}

		res.redirect('/');
	} else res.redirect('/login');
});
app.get('/upgrade', (req, res) => {
	if (req.isAuthenticated() && req.user.membership === 'non-member') {
		res.status(200).render('upgrade', {
			title: 'Become a member',
			user: req.user,
			errors: [],
		});
	} else if (req.isAuthenticated() && req.user.membership === 'member') {
		res.status(200).render('upgrade', {
			title: 'Become a member',
			user: req.user,
			errors: [],
		});
	} else res.redirect('login');
});
app.post('/upgrade', async (req, res) => {
	const password = req.body.password;
	console.log(password);

	if (password === 'supersecret' && req.isAuthenticated()) {
		try {
			const updated = await User.findByIdAndUpdate(req.user.id, {
				membership: 'member',
			});
			console.log('User updated: ', updated);
			res.redirect('/');
		} catch (error) {
			consol.log(error);
			res.redirect('/');
		}
	} else
		res.render('upgrade', {
			title: 'Become a member',
			user: req.user,
			errors: ['Incorrect password'],
		});
});
app.get('/logout', (req, res) => {
	req.logout((err) => {
		if (err) return next(err);
		res.redirect('/');
	});
});
app.get('/', async (req, res) => {
	const posts = await Post.find({}).sort({ updatedAt: -1 });
	res.status(200).render('index', {
		title: 'Only Members',
		posts,
		user: req.user,
	});
});
app.get('/delete/:id', async (req, res) => {
	if (req.isAuthenticated() && req.user.membership === 'admin') {
		try {
			const deleted = await Post.findByIdAndDelete(req.params.id);
			console.log('Deleted: ', deleted);
			res.redirect('/');
		} catch (error) {
			console.log(error);
			res.redirect('/');
		}
	} else res.redirect('/');
});
app.get('*', (req, res) => {
	res.send('404, not found');
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
