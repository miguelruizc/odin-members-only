const express = require('express');
const path = require('node:path');

const port = process.env.PORT || 3000;

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/', (req, res, next) => {
	res.status(200).render('index', { title: 'Only Members' });
});

app.listen(port, () => console.log(`Server running, listening port ${port}`));
