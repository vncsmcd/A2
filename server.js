/******************************************************************************** 
*  WEB322 – Assignment 05
*  
*  I declare that this assignment is my own work in accordance with Seneca's 
*  Academic Integrity Policy: 
*  
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html 
*  
*  Name: Vinicius Macedo Pereira Leal Student ID: 152826228 Date: 11/22/2024
* 
*  Published URL: ___________________________________________________________ 
* 
********************************************************************************/ 
const express = require('express');
const path = require('path');
const legoData = require('./modules/legoSets');
const { getAllThemes, addSet } = require("./modules/legoSets"); 


const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.urlencoded({ extended: true }));

// Set the view engine
app.set('view engine', 'ejs');

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON bodies
app.use(express.json());

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
    res.render("home");
});

// Route for the about page
app.get('/about', (req, res) => {
    res.render("about");
});

// Route to get all Lego sets or sets by theme
app.get('/lego/sets', (req, res) => {
    const theme = req.query.theme;

    if (theme) {
        legoData.getSetsByTheme(theme)
            .then(sets => res.render("sets", { sets }))
            .catch(err => res.status(404).json({ error: err.message }));
    } else {
        legoData.getAllSets()
            .then(sets => res.render("sets", { sets }))
            .catch(err => res.status(404).json({ error: err.message }));
    }
});

// Route to get a Lego set by its set number
app.get('/lego/sets/:setNum', (req, res) => {
    const setNum = req.params.setNum;

    legoData.getSetByNum(setNum)
        .then(set => res.render("set", { set }))
        .catch(err => res.status(404).json({ error: err.message }));
});



app.get('/lego/addSet', async (req, res) => {
    try {
        const themes = await getAllThemes(); // Fetch themes from the database
        console.log("Fetched themes:", themes); // Log fetched themes to verify
        res.render('addSet', { themes }); // Pass themes to the view
    } catch (err) {
        console.error("Error in GET /lego/addSet:", err); // Log the error
        res.render('500', { message: `An error occurred: ${err.message}` });
    }
});

// Route: POST /lego/addSet
app.post("/lego/addSet", async (req, res) => {
    const setData = req.body; // Extract form data from request body
    try {
        await addSet(setData); // Add the new set using the Promise-based function
        res.redirect("/lego/sets"); // Redirect to the collection page
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.render("500", {
            message: `I'm sorry, but we have encountered the following error: ${err.message}`
        });
    }
});


// Route: GET /lego/editSet/:setNum
app.get('/lego/editSet/:setNum', async (req, res) => {
    try {
        const set = await legoData.getSetByNum(req.params.setNum); // Fetch the set details
        const themes = await legoData.getAllThemes(); // Fetch themes for dropdown
        res.render('editSet', { set, themes });
    } catch (err) {
        console.error("Error in GET /lego/editSet/:setNum:", err);
        res.render('500', { message: `An error occurred: ${err.message}` });
    }
});

// Route: POST /lego/editSet/:setNum
app.post('/lego/editSet/:setNum', async (req, res) => {
    try {
        await legoData.updateSet(req.params.setNum, req.body); // Update set with new data
        res.redirect('/lego/sets'); // Redirect to the sets listing
    } catch (err) {
        console.error("Error in POST /lego/editSet/:setNum:", err);
        res.render('500', { message: `An error occurred: ${err.message}` });
    }
});

// Route: POST /lego/deleteSet/:setNum
app.get('/lego/deleteSet/:setNum', async (req, res) => {
    try {
        const setNum = req.params.setNum;

        // Fetch the set to confirm it exists
        const set = await legoData.getSetByNum(setNum);

        // If the set exists, render the delete confirmation view
        res.render('delete', { set });
    } catch (err) {
        console.error("Error in GET /lego/deleteSet/:setNum:", err);
        res.status(404).render('404', { message: "Set not found or does not exist." });
    }
});

app.post('/lego/deleteSet/:setNum', async (req, res) => {
    try {
        const setNum = req.params.setNum;

        // Call the deleteSet function to delete the record from the database
        await legoData.deleteSet(setNum);

        // Render the success page
        res.render('deleteSuccess');
    } catch (err) {
        console.error("Error in POST /lego/deleteSet/:setNum:", err);

        // Render the 404 page if the set does not exist or there's an error
        res.status(404).render('404', { message: err.message });
    }
});


// Custom 404 Error Handling
app.use((req, res) => {
    res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for" });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); 
    res.status(500).render('500', { error: err }); 
});




