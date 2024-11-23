/********************************************************************************
*  WEB322 – Assignment 04
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Kemono Onomek ID: 146433230 Date: Oct 30, 2024
*
********************************************************************************/

const express = require('express');
const bodyParser = require('body-parser');
const legoData = require('./modules/legoSets'); // LegoSets module provides data functions

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Middleware
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Lego Data
legoData.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log(`Server is running at http://localhost:${HTTP_PORT}`);
        });
    })
    .catch(err => {
        console.error("Failed to initialize Lego data:", err);
    });

// Routes

// Home Route
app.get('/', (req, res) => {
    legoData.getAllSets()
        .then(legoSets => {
            res.render('home', { legoSets });
        })
        .catch(err => {
            res.status(500).render('500', { message: "Error loading Lego sets." });
        });
});

// About Page Route
app.get('/about', (req, res) => {
    res.render('about');
});

// Lego Sets Collection Route (View Collection)
app.get('/lego/sets', (req, res) => {
    legoData.getAllSets()
        .then(data => {
            res.render('sets', { sets: data });
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
                res.render('set', { set: data });
            } else {
                res.status(404).render('404', { message: "Set not found." });
            }
        })
        .catch(err => {
            res.status(404).render('404', { message: "Error loading set details." });
        });
});

// GET /lego/addSet
app.get('/lego/addSet', async (req, res) => {
    try {
        const themes = await legoData.getAllThemes();
        res.render('addSet', { themes });
    } catch (err) {
        res.render('500', { message: `Error loading themes: ${err.message}` });
    }
});

// POST /lego/addSet
app.post('/lego/addSet', async (req, res) => {
    try {
        await legoData.addSet(req.body);
        res.redirect('/lego/sets');
    } catch (err) {
        res.render('500', { message: `Error adding set: ${err.message}` });
    }
});

// GET /lego/editSet/:num
app.get('/lego/editSet/:num', async (req, res) => {
    try {
        const set = await legoData.getSetByNum(req.params.num);
        const themes = await legoData.getAllThemes();
        res.render('editSet', { set, themes });
    } catch (err) {
        res.status(404).render('404', { message: err.message });
    }
});

// POST /lego/editSet
app.post('/lego/editSet', async (req, res) => {
    try {
        await legoData.editSet(req.body.set_num, req.body);
        res.redirect('/lego/sets');
    } catch (err) {
        res.render('500', { message: `Error editing set: ${err.message}` });
    }
});

// GET /lego/deleteSet/:num
app.get('/lego/deleteSet/:num', async (req, res) => {
    try {
        await legoData.deleteSet(req.params.num);
        res.redirect('/lego/sets');
    } catch (err) {
        res.render('500', { message: `Error deleting set: ${err.message}` });
    }
});

// 404 Route for unmatched paths
app.use((req, res) => {
    res.status(404).render('404', { message: "Page not found" });
});
