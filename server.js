/********************************************************************************
*  WEB322 – Assignment 03
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Vinicius Leal Student ID: 152826228 Date: 10/11/2024
*
*  Published URL: https://a3-aj8ik3o1b-vncsmcds-projects.vercel.app
*
********************************************************************************/

const express = require('express');
const path = require('path');
const legoData = require('./modules/legoSets');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Initialize the legoData
legoData.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error("Failed to initialize legoData:", err);
    });

// Route for the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

// Route for the about page
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// Route to get all Lego sets or sets by theme
app.get('/lego/sets', (req, res) => {
    const theme = req.query.theme;

    if (theme) {
        legoData.getSetsByTheme(theme)
            .then(sets => res.json(sets))
            .catch(err => res.status(404).send(err));
    } else {
        legoData.getAllSets()
            .then(sets => res.json(sets))
            .catch(err => res.status(404).send(err));
    }
});

// Route to get a Lego set by its set number
app.get('/lego/sets/:setNum', (req, res) => {
    const setNum = req.params.setNum;

    legoData.getSetByNum(setNum)
        .then(set => res.json(set))
        .catch(err => res.status(404).send(err));
});

// Custom 404 Error Handling
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

