/********************************************************************************
*  WEB322 – Assignment 06
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Kemono Onomek ID: 146433230 Date: Dec 6, 2024
*
********************************************************************************/

const express = require('express');
const bodyParser = require('body-parser');
const legoData = require('./modules/legoSets'); // LegoSets module provides data functions
const authData = require('./modules/auth-service'); // Auth Service for user authentication
const clientSessions = require('client-sessions');
require('dotenv').config();

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Middleware
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Configure Client Sessions
app.use(clientSessions({
    cookieName: "session",
    secret: "lego_app_secret_key", // Replace with a strong key
    duration: 2 * 60 * 60 * 1000, // 2 hours
    activeDuration: 30 * 60 * 1000 // 30 minutes
}));

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// Middleware to ensure the user is logged in
function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        next();
    }
}

// Initialize Lego Data and Auth Service
legoData.initialize()
    .then(authData.initialize)
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log(`Server is running at http://localhost:${HTTP_PORT}`);
        });
    })
    .catch(err => {
        console.error("Failed to initialize data:", err);
    });

// Routes

// Home Route
app.get('/', (req, res) => {
    legoData.getAllSets()
        .then(legoSets => {
            res.render('home', { legoSets, page: '/' });
        })
        .catch(err => {
            res.status(500).render('500', { message: "Error loading Lego sets." });
        });
});

// About Page Route
app.get('/about', (req, res) => {
    res.render('about', { page: '/about' });
});

// Login Routes
app.get('/login', (req, res) => {
    res.render('login', { errorMessage: null, page: '/login' });
});

app.post('/login', (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    authData.checkUser(req.body)
        .then(user => {
            req.session.user = {
                userName: user.userName,
                email: user.email,
                loginHistory: user.loginHistory
            };
            res.redirect('/lego/sets');
        })
        .catch(err => {
            res.render('login', { errorMessage: err, page: '/login' });
        });
});

// Logout Route
app.get('/logout', (req, res) => {
    req.session.reset();
    res.redirect('/');
});

// Register Routes
app.get('/register', (req, res) => {
    res.render('register', { errorMessage: null, successMessage: null, page: '/register' });
});

app.post('/register', (req, res) => {
    authData.registerUser(req.body)
        .then(() => {
            res.render('register', { successMessage: 'User created successfully', errorMessage: null, page: '/register' });
        })
        .catch(err => {
            res.render('register', { errorMessage: err, successMessage: null, page: '/register' });
        });
});

// User History Route
app.get('/userHistory', ensureLogin, (req, res) => {
    res.render('userHistory', { user: req.session.user, page: '/userHistory' });
});

// Lego Sets Collection Route
app.get('/lego/sets', (req, res) => {
    legoData.getAllSets()
        .then(data => {
            res.render('sets', { sets: data, page: '/lego/sets' });
        })
        .catch(err => {
            res.status(500).render('500', { message: "Error loading Lego sets." });
        });
});

// Individual Lego Set Route
app.get('/lego/sets/:set_num', (req, res) => {
    const setNum = req.params.set_num;
    legoData.getSetByNum(setNum)
        .then(data => {
            if (data) {
                res.render('set', { set: data, page: '/lego/sets' });
            } else {
                res.status(404).render('404', { message: "Set not found." });
            }
        })
        .catch(err => {
            res.status(404).render('404', { message: "Error loading set details." });
        });
});

// Add Set Route
app.get('/lego/addSet', ensureLogin, async (req, res) => {
    try {
        const themes = await legoData.getAllThemes();
        res.render('addSet', { themes, page: '/lego/addSet' });
    } catch (err) {
        res.render('500', { message: `Error loading themes: ${err.message}` });
    }
});

app.post('/lego/addSet', ensureLogin, async (req, res) => {
    try {
        await legoData.addSet(req.body);
        res.redirect('/lego/sets');
    } catch (err) {
        res.render('500', { message: `Error adding set: ${err.message}` });
    }
});

// Edit Set Route
app.get('/lego/editSet/:num', ensureLogin, async (req, res) => {
    try {
        const set = await legoData.getSetByNum(req.params.num);
        const themes = await legoData.getAllThemes();
        res.render('editSet', { set, themes, page: '/lego/editSet' });
    } catch (err) {
        res.status(404).render('404', { message: err.message });
    }
});

app.post('/lego/editSet', ensureLogin, async (req, res) => {
    try {
        await legoData.editSet(req.body.set_num, req.body);
        res.redirect('/lego/sets');
    } catch (err) {
        res.render('500', { message: `Error editing set: ${err.message}` });
    }
});

// Delete Set Route
app.get('/lego/deleteSet/:num', ensureLogin, async (req, res) => {
    try {
        await legoData.deleteSet(req.params.num);
        res.redirect('/lego/sets');
    } catch (err) {
        res.render('500', { message: `Error deleting set: ${err.message}` });
    }
});

// 404 Route
app.use((req, res) => {
    res.status(404).render('404', { message: "Page not found" });
});
