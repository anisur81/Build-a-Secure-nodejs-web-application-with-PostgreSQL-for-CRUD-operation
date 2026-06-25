# Creating Secure Nodejs Web Applications for CRUD Operation

## Introduction

Node.js and Express have become potent tools for creating dynamic web applications in the quickly changing web development landscape. Node.js is a server-side JavaScript runtime environment, while Express is a minimalist web application framework that runs on top of Node.js.

## 1. Setting Up the Environment

### Option 1 — Installing Node.js with Apt from the Default Repositories

```bash
sudo apt install nodejs
sudo apt install npm
```

### Verify Installation

```bash
administrator@WIN-RJ32TRRFOFP:/mnt/g/NODEJS/nodejsapp$ node -v
v18.19.1

administrator@WIN-RJ32TRRFOFP:/mnt/g/NODEJS/nodejsapp$ npm -v
9.2.0
```

## 2. Project Setup

### Create a New Project Directory

```bash
mkdir nodejsapp
cd nodejsapp
```

### Initialize Project

```bash
npm init -y
```

### Step 3: Install Dependencies

```bash
npm install express pg ejs body-parser dotenv
```

### Package Purpose

| Package     | Purpose               |
| ----------- | --------------------- |
| express     | Web framework         |
| pg          | PostgreSQL driver     |
| ejs         | Dynamic templates     |
| body-parser | Form handling         |
| dotenv      | Environment variables |

## 3. Database Setup

### Step 5: Create PostgreSQL Database

#### Login to PostgreSQL

```bash
psql -U postgres
```

OR

```bash
sudo -u postgres psql
```

#### Change Password (if needed)

```sql
ALTER USER postgres WITH PASSWORD 'postgres';
```

#### Create Database

```sql
CREATE DATABASE mydb;
```

#### Connect to Database

```sql
\c mydb
```

#### Create Table

```sql
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    rollno INTEGER,
    age INTEGER
);
```

#### Verify Table Creation

```sql
SELECT * FROM students;
```

#### Create Contact Requests Table

```sql
CREATE TABLE home_contactreq (
    id SERIAL PRIMARY KEY,
    orgtitle VARCHAR(100),
    phoneno VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    comment TEXT
);
```

## 4. Environment Configuration

### Step 6: Environment Variables

Create `.env` file in the project root folder:

```env
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
DB_NAME=schooldb
```

## 5. Database Connection

### Step 7: PostgreSQL Connection

Create `config/db.js`:

```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

module.exports = pool;
```

## 6. Express Server Configuration

### Step 8: Create Express Server

Create `app.js`:

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./config/db');

const app = express();

// Test database connection
pool.query('SELECT NOW()')
    .then(() => console.log('PostgreSQL Connected'))
    .catch(err => console.error('DB Error:', err.message));

// Set view engine
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const PORT = 3000;
```

## 7. Routes Configuration

### Static Routes

```javascript
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

app.get('/about', (req, res) => {
    res.render('about');
});
```

### Dynamic Routes with Database Operations

#### GET - Display Contact Requests

```javascript
app.get('/contact', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM home_contactreq ORDER BY id'
        );
        res.render('contact', {
            home_contactreq: result.rows
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Database Error');
    }
});
```

#### GET - Add New Contact Request Form

```javascript
app.get('/add', (req, res) => {
    res.render('add');
});
```

#### POST - Add New Contact Request

```javascript
app.post('/add', async (req, res) => {
    const { orgtitle, phoneno, email, address, comment } = req.body;
    
    try {
        await pool.query(
            'INSERT INTO home_contactreq(orgtitle, phoneno, email, address, comment) VALUES($1,$2,$3,$4,$5)',
            [orgtitle, phoneno, email, address, comment]
        );
        res.redirect('/');
    } catch (err) {
        console.log(err);
        res.status(500).send('Database Error');
    }
});
```

#### GET - Edit Contact Request Form

```javascript
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
```

#### POST - Update Contact Request

```javascript
app.post('/update/:id', async (req, res) => {
    const id = req.params.id;
    const { orgtitle, phoneno, email, address, comment } = req.body;
    
    try {
        await pool.query(
            `UPDATE home_contactreq
             SET orgtitle = $1,
                 phoneno = $2,
                 email = $3,
                 address = $4,
                 comment = $5
             WHERE id = $6`,
            [orgtitle, phoneno, email, address, comment, id]
        );
        res.redirect('/contact');
    } catch (err) {
        console.error(err);
        res.status(500).send('Database Error');
    }
});
```

#### GET - Delete Contact Request

```javascript
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
```

### Start Server

```javascript
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
```

## 8. EJS Templates

### Add Contact Request Form (add.ejs)

```html
<!DOCTYPE html>
<html>
<head>
    <title>Add Contact Request</title>
</head>
<body>
    <h1>Add Contact Request</h1>
    
    <form action="/add" method="POST">
        <input type="text" name="orgtitle" placeholder="orgtitle" required>
        <br><br>
        
        <input type="text" name="phoneno" placeholder="phoneno" required>
        <br><br>
        
        <input type="text" name="email" placeholder="email" required>
        <br><br>
        
        <input type="text" name="address" placeholder="address" required>
        <br><br>
        
        <textarea name="comment" placeholder="comment" required></textarea>
        <br><br>
        
        <button type="submit">Save</button>
    </form>
</body>
</html>
```

### Edit Contact Request Form (edit.ejs)

```html
<!DOCTYPE html>
<html>
<head>
    <title>Edit Contact Request</title>
</head>
<body>
    <h1>Edit Contact Request</h1>
    
    <form action="/update/<%= conreq.id %>" method="POST">
        <input type="text" name="orgtitle" value="<%= conreq.orgtitle %>" required>
        <br><br>
        
        <input type="text" name="phoneno" value="<%= conreq.phoneno %>" required>
        <br><br>
        
        <input type="email" name="email" value="<%= conreq.email %>" required>
        <br><br>
        
        <input type="text" name="address" value="<%= conreq.address %>" required>
        <br><br>
        
        <textarea name="comment" required><%= conreq.comment %></textarea>
        <br><br>
        
        <button type="submit">Update</button>
    </form>
</body>
</html>
```

### Contact List Display (contact.ejs)

```html
<!DOCTYPE html>
<html>
<head>
    <title>Contact Requests</title>
</head>
<body>
    <h1>Contact Requests</h1>
    
    <a href="/add">Add New Request</a>
    
    <table border="1">
        <thead>
            <tr>
                <th>ID</th>
                <th>Organization</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th>Comment</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <% home_contactreq.forEach(req => { %>
                <tr>
                    <td><%= req.id %></td>
                    <td><%= req.orgtitle %></td>
                    <td><%= req.phoneno %></td>
                    <td><%= req.email %></td>
                    <td><%= req.address %></td>
                    <td><%= req.comment %></td>
                    <td>
                        <a href="/edit/<%= req.id %>">Edit</a>
                        <a href="/delete/<%= req.id %>">Delete</a>
                    </td>
                </tr>
            <% }); %>
        </tbody>
    </table>
</body>
</html>
```

## 9. Application Flow Architecture

```
Browser
   |
   V
Express Route
   |
   V
PostgreSQL Database
   |
   V
Data Returned
   |
   V
EJS Template
   |
   V
HTML Response
   |
   V
Browser
```

### Example Flow

1. **User visits** `/contact`
2. **Express executes** SQL query: `SELECT * FROM home_contactreq ORDER BY id`
3. **PostgreSQL returns** contact request records
4. **EJS creates** HTML dynamically with the data
5. **Browser displays** updated data

## 10. Project Structure

```
nodejsapp/
├── config/
│   └── db.js
├── views/
│   ├── overview.ejs
│   ├── certificates.ejs
│   ├── skills.ejs
│   ├── projects.ejs
│   ├── contact.ejs
│   ├── about.ejs
│   ├── add.ejs
│   └── edit.ejs
├── public/
│   └── (static files - CSS, JS, images)
├── .env
├── app.js
└── package.json
```

## 11. Running the Application

```bash
node app.js
```

The application will be available at: `http://localhost:3000`

## 12. Key Features Summary

- **Dynamic Content Generation** - Using EJS templates
- **Database Integration** - PostgreSQL with proper connection pooling
- **CRUD Operations** - Create, Read, Update, Delete functionality
- **Environment Configuration** - Using dotenv for secure configuration
- **Form Handling** - Using body-parser middleware
- **RESTful Routes** - Organized and maintainable routing structure
- **Error Handling** - Proper try-catch blocks for database operations
- **Template Engine** - EJS for server-side rendering
