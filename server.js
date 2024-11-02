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
const legoData = require('./modules/legoSets'); // Assuming legoSets module provides data functions
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

legoData.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log(`Server is running at http://localhost:${HTTP_PORT}`);
        });
    })
    .catch(err => {
        console.error("Failed to initialize Lego data:", err);
    });

// Home Route
app.get('/', (req, res) => {
    legoData.getAllSets()
        .then(legoSets => {
            res.render('home', { legoSets });
        })
        .catch(err => {
            res.status(500).send("Error loading Lego sets.");
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
            res.status(500).send("Error loading Lego sets.");
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

// 404 Route for unmatched paths
app.use((req, res) => {
    res.status(404).render('404', { message: "Page not found" });
});