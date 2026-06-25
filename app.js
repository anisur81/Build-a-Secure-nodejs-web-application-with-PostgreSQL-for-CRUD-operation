const pool = require('./config/db');

pool.query('SELECT NOW()')
    .then(() => console.log('PostgreSQL Connected'))
    .catch(err => console.error('DB Error:', err.message));


const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const PORT = 3000;

/*
app.get('/view', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM students ORDER BY id'
        );

        res.render('index', {
            students: result.rows
        });

    } catch (err) {
        console.log(err);
    }
});

*/


//***********************************

app.get('/', (req, res) => {
    res.render('overview');
});

app.get('/certificates', (req, res) => {
    res.render('certificates');
});

app.get('/skills', (req, res) => {
    res.render('skills');
});

app.get('/projects', (req, res) => {
    res.render('projects');
});

app.get('/contact', async (req, res) => {
   // res.render('contact');
   try {
        const result = await pool.query(
            'SELECT * FROM home_contactreq ORDER BY id'
        );

        res.render('contact', {
            home_contactreq: result.rows
        });

    } catch (err) {
        console.log(err);
    }
});

app.get('/about', (req, res) => {
    res.render('about');
});

//********************************
app.get('/add', (req, res) => {
    res.render('add');
});


//**********************
app.post('/add', async (req, res) => {

    const { orgtitle, phoneno, email, address, comment } = req.body;

    try {

        await pool.query(
            'INSERT INTO home_contactreq(orgtitle,phoneno,email,address,comment) VALUES($1,$2,$3,$4,$5)',
            [orgtitle, phoneno, email, address, comment]
        );

        res.redirect('/');

    } catch (err) {
        console.log(err);
    }
});



app.post('/update/:id', async (req, res) => {

    const id = req.params.id;

    const {
        orgtitle,
        phoneno,
        email,
        address,
        comment
    } = req.body;

    try {

        await pool.query(
            `UPDATE home_contactreq
             SET
                orgtitle = $1,
                phoneno  = $2,
                email    = $3,
                address  = $4,
                comment  = $5
             WHERE id = $6`,
            [
                orgtitle,
                phoneno,
                email,
                address,
                comment,
                id
            ]
        );

        res.redirect('/contact');

    } catch (err) {
        console.error(err);
        res.status(500).send('Database Error');
    }
});



app.get('/edit/:id', async (req, res) => {

    const id = req.params.id;

    try {

        const result = await pool.query(
            'SELECT * FROM home_contactreq WHERE id = $1',
            [id]
        );

        res.render('edit', {
            conreq: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Database Error');
    }
});




app.get('/delete/:id', async (req, res) => {

    const id = req.params.id;

    try {

        await pool.query(
            'DELETE FROM home_contactreq WHERE id = $1',
            [id]
        );

        res.redirect('/contact');

    } catch (err) {
        console.error(err);
        res.status(500).send('Database Error');
    }
});



app.listen(PORT, '0.0.0.0',() => {
    console.log(`Server running on port ${PORT}`);
});

 