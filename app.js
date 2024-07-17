const express = require('express');
const path = require('node:path');
const mongoose = require('mongoose');
const Post = require('./models/Post');

const port = process.env.PORT || 3000;

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/login', (req, res, next) => {
	res.status(200).render('login', { title: 'Log In' });
});
app.get('/signup', (req, res, next) => {
	res.status(200).render('signup', { title: 'Sign Up' });
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
