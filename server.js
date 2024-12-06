/******************************************************************************** 
*  WEB322 – Assignment 06
*  
*  I declare that this assignment is my own work in accordance with Seneca's 
*  Academic Integrity Policy: 
*  
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html 
*  
*  Name: Vinicius Macedo Pereira Leal Student ID: 152826228 Date: 12/06/2024
* 
*  Published URL: https://a6-dun.vercel.app

********************************************************************************/ 
const express = require('express');
const clientSessions = require('client-sessions');
const legoData = require('./modules/legoSets');
const authData = require('./modules/auth-service.js');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the "public" directory
app.use(express.static('public'));

// Middleware to parse JSON bodies
app.use(express.json());

// Configure client-sessions middleware
app.use(clientSessions({
    cookieName: "session",
    secret: "this_is_a_secret", // Replace with a secure random string
    duration: 2 * 60 * 60 * 1000, // Session duration: 2 hours
    activeDuration: 1000 * 60 * 5, // Extend session by 5 minutes if active
}));

// Middleware to make session data available to views
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// Middleware to ensure the user is logged in
const ensureLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

// Initialize services in the correct order
legoData.initialize()
    .then(authData.initialize)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error("Failed to initialize services:", err);
    });

// Routes

// Home page
app.get('/', (req, res) => {
    res.render("home");
});

// About page
app.get('/about', (req, res) => {
    res.render("about");
});


app.get('/register', (req, res) => {
    res.render('register', { errorMessage: null, successMessage: null, userName: '' });
});

app.post('/register', (req, res) => {
    authData.registerUser(req.body)
        .then(() => {
            res.render('register', { successMessage: "User created successfully!", errorMessage: null, userName: '' });
        })
        .catch((err) => {
            res.render('register', { errorMessage: err, successMessage: null, userName: req.body.userName });
        });
});

// GET /login
app.get('/login', (req, res) => {
  res.render('login', { errorMessage: null, userName: '' }); // Reset userName to blank
});

// POST /login
app.post('/login', (req, res) => {
  req.body.userAgent = req.get('User-Agent');
  authData.checkUser(req.body)
      .then((user) => {
          req.session.user = {
              userName: user.userName,
              email: user.email,
              loginHistory: user.loginHistory,
          };
          res.redirect('/lego/sets'); // Redirect on successful login
      })
      .catch((err) => {
          console.error("Login error:", err); // Log error details
          res.render('login', { errorMessage: err.message, userName: '' }); // Clear userName on error
      });
});


app.get('/logout', (req, res) => {
    req.session.reset();
    res.redirect('/');
});

app.get('/userHistory', ensureLogin, (req, res) => {
    res.render('userHistory');
});

// Lego Sets Management
app.get('/lego/sets', (req, res) => {
    const theme = req.query.theme;

    if (theme) {
        legoData.getSetsByTheme(theme)
            .then(sets => res.render("sets", { sets }))
            .catch(err => res.status(404).render("404", { message: err.message }));
    } else {
        legoData.getAllSets()
            .then(sets => res.render("sets", { sets }))
            .catch(err => res.status(404).render("404", { message: err.message }));
    }
});

app.get('/lego/sets/:setNum', (req, res) => {
    const setNum = req.params.setNum;

    legoData.getSetByNum(setNum)
        .then(set => res.render("set", { set }))
        .catch(err => res.status(404).render("404", { message: err.message }));
});

app.get('/lego/addSet', ensureLogin, async (req, res) => {
    try {
        const themes = await legoData.getAllThemes();
        res.render('addSet', { themes });
    } catch (err) {
        console.error("Error in GET /lego/addSet:", err);
        res.render('500', { message: `An error occurred: ${err.message}` });
    }
});

app.post('/lego/addSet', ensureLogin, async (req, res) => {
    try {
        await legoData.addSet(req.body);
        res.redirect("/lego/sets");
    } catch (err) {
        console.error("Error in POST /lego/addSet:", err);
        res.render("500", { message: `An error occurred: ${err.message}` });
    }
});

app.get('/lego/editSet/:setNum', ensureLogin, async (req, res) => {
    try {
        const set = await legoData.getSetByNum(req.params.setNum);
        const themes = await legoData.getAllThemes();
        res.render('editSet', { set, themes });
    } catch (err) {
        console.error("Error in GET /lego/editSet/:setNum:", err);
        res.render('500', { message: `An error occurred: ${err.message}` });
    }
});

app.post('/lego/editSet/:setNum', ensureLogin, async (req, res) => {
    try {
        await legoData.updateSet(req.params.setNum, req.body);
        res.redirect('/lego/sets');
    } catch (err) {
        console.error("Error in POST /lego/editSet/:setNum:", err);
        res.render('500', { message: `An error occurred: ${err.message}` });
    }
});

app.get('/lego/deleteSet/:setNum', ensureLogin, async (req, res) => {
    try {
        const setNum = req.params.setNum;
        const set = await legoData.getSetByNum(setNum);
        res.render('delete', { set });
    } catch (err) {
        console.error("Error in GET /lego/deleteSet/:setNum:", err);
        res.status(404).render('404', { message: "Set not found or does not exist." });
    }
});

app.post('/lego/deleteSet/:setNum', ensureLogin, async (req, res) => {
    try {
        const setNum = req.params.setNum;
        await legoData.deleteSet(setNum);
        res.render('deleteSuccess');
    } catch (err) {
        console.error("Error in POST /lego/deleteSet/:setNum:", err);
        res.status(404).render('404', { message: err.message });
    }
});

// Error Handling
app.use((req, res) => {
    res.status(404).render("404", { message: "Page not found" });
});

app.use((err, req, res, next) => {
    console.error(err.stack); 
    res.status(500).render('500', { error: err.message }); 
});


app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
