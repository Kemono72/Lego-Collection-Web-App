require('dotenv').config();
require('pg');

const express = require('express');
const path = require('path');
const legoData = require('./modules/legoSets');
const app = express();
const HTTP_PORT = process.env.PORT || 8080;
const Sequelize = require('sequelize');

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for error logging
app.use((err, req, res, next) => {
    console.error(err.stack);
    next(err);
});

// Initialize lego data and start the server
legoData.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log(`Server is running at http://localhost:${HTTP_PORT}`);
        });
    })
    .catch(err => {
        console.error("Failed to initialize Lego data:", err);
    });

// Route for the home page
app.get('/', (req, res) => {
    res.render("home", { page: '/' });
});

// Route for the about page
app.get('/about', (req, res) => {
    res.render("about", { page: '/about' });
});

// GET route for the add set page
app.get('/lego/addSet', (req, res) => {
    legoData.getAllThemes()
        .then(themeData => {
            res.render('addSet', { themes: themeData });
        })
        .catch(err => {
            res.render('500', { message: `Error fetching themes: ${err.message}` });
        });
});

// POST route for adding a new Lego set
app.post('/lego/addSet', (req, res) => {
    const setData = {
        set_num: req.body.set_num,
        name: req.body.name,
        year: parseInt(req.body.year, 10),
        num_parts: parseInt(req.body.num_parts, 10),
        img_url: req.body.img_url,
        theme_id: parseInt(req.body.theme_id, 10),
    };

    // Input validation
    if (!setData.set_num || !setData.name || isNaN(setData.year) || isNaN(setData.theme_id)) {
        return res.render('500', { message: "Invalid input data. Please fill all required fields." });
    }

    legoData.addSet(setData)
        .then(() => {
            res.redirect('/lego/sets');
        })
        .catch(err => {
            res.render('500', { message: `Error adding set: ${err}` });
        });
});

// Route for Lego sets with an optional theme query parameter
app.get('/lego/sets', (req, res) => {
    const theme = req.query.theme;
    if (theme) {
        legoData.getSetsByTheme(theme)
            .then(data => {
                res.render('sets', { sets: data, theme, page: '/lego/sets' });
            })
            .catch(err => {
                res.status(404).render('404', { page: '', message: `No sets found for theme: ${theme}` });
            });
    } else {
        legoData.getAllSets()
            .then(data => {
                res.render('sets', { sets: data, theme: null, page: '/lego/sets' });
            })
            .catch(err => {
                res.status(500).render('500', { page: '', message: "Server error retrieving sets." });
            });
    }
});

// Route to delete a Lego set by set_num
app.get('/lego/deleteSet/:num', (req, res) => {
    const setNum = req.params.num;

    legoData.deleteSet(setNum)
        .then(() => {
            res.redirect('/lego/sets');
        })
        .catch(err => {
            res.render('500', { message: `Error deleting set: ${err}` });
        });
});

// GET route for editing a Lego set
app.get('/lego/editSet/:set_num', (req, res) => {
    const setNum = req.params.set_num;

    legoData.getSetByNum(setNum)
        .then(setData => {
            legoData.getAllThemes()
                .then(themeData => {
                    res.render('editSet', { set: setData, themes: themeData });
                })
                .catch(err => {
                    res.render('500', { message: `Error fetching themes: ${err.message}` });
                });
        })
        .catch(err => {
            res.render('500', { message: `Error fetching Lego set: ${err.message}` });
        });
});

// POST route for updating a Lego set
app.post('/lego/editSet/:set_num', (req, res) => {
    const setNum = req.params.set_num;

    const setData = {
        set_num: req.body.set_num,
        name: req.body.name,
        year: parseInt(req.body.year, 10),
        num_parts: parseInt(req.body.num_parts, 10),
        img_url: req.body.img_url,
        theme_id: parseInt(req.body.theme_id, 10),
    };

    if (!setData.name || isNaN(setData.year) || isNaN(setData.theme_id)) {
        return res.render('500', { message: "Invalid input data for editing the set." });
    }

    legoData.editSet(setNum, setData)
        .then(() => {
            res.redirect('/lego/sets');
        })
        .catch(err => {
            res.render('500', { message: `Error updating Lego set: ${err}` });
        });
});

// Route for specific Lego set by set_num
app.get('/lego/sets/:set_num', (req, res) => {
    const setNum = req.params.set_num;

    legoData.getSetByNum(setNum)
        .then(setData => {
            res.render('setDetail', { set: setData, page: '/lego/sets' });
        })
        .catch(err => {
            res.status(404).render('404', { page: '', message: `Set with number ${setNum} not found.` });
        });
});

// Catch-all for 404 errors
app.use((req, res) => {
    res.status(404).render('404', { page: '', message: "Page not found." });
});
