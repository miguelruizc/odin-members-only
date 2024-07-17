const express = require('express');
const path = require('node:path');
const mongoose = require('mongoose');
const Post = require('./models/Post');
// const passport = require('passport');
// const session = require('express-session');
// const LocalStrategy = require('passport-local').Strategy;

const port = process.env.PORT || 3000;

const app = express();

// // Middleware for passport
// app.use(express.urlencoded({ extended: true }));
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

app.get('/login', (req, res, next) => {
	res.status(200).render('login', { title: 'Log In' });
});
app.get('/register', (req, res, next) => {
	res.status(200).render('register', { title: 'Register' });
});
app.get('/post', (req, res, next) => {
	res.status(200).render('post', { title: 'Log In' });
});
app.get('/logout', (req, res, next) => {
	res.redirect('/');
});
app.get('/', async (req, res, next) => {
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
