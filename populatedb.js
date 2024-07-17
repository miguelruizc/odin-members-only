// Script to populate database with initial data (20 posts)
const mongoose = require('mongoose');
const Post = require('./models/Post');
const fs = require('node:fs/promises');
const path = require('node:path');

const dbUri = process.env.MONGODB_URI;

mongoose
	.connect(dbUri)
	.then(() => {
		console.log('Connected to database: ' + mongoose.connection.name);

		fs.readFile(path.join(__dirname, 'initialPosts.json'))
			.then((fileData) => {
				const posts = JSON.parse(fileData);

				posts.forEach((post) => {
					const newPost = new Post({
						title: post.title,
						body: post.body,
						author: post.author,
					});

					newPost
						.save()
						.then((saved) =>
							console.log(
								'Saved: ' + saved.title + ', ' + saved.body
							)
						)
						.catch((error) => console.error(error));
				});
			})
			.catch((error) => console.error(error));
	})
	.catch((error) => {
		console.error('Error connecting to database: ', error);
	});
