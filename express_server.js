"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const app = express();

const PORT = process.env.PORT || 8080; 

// -------------------------------------------------- Configuration
app.set("view engine", "ejs");

// -------------------------------------------------- Middleware
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieSession({
  name: "session",
  keys: ["blah blah blah"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.use("/assets", express.static("assets")); 

// -------------------------------------------------- Database
const urlDatabase = {
  // "b2xVn2": {
  //   userId: "userRandomID",
  //   longURL: "http://www.lighthouselabs.ca",
  // },
  // "9sm5xK": {
  //   userId: "user2RandomID",
  //   longURL: "http://www.google.com",
  // }
};

// -------------------------------------------------- Users
const users = { 
//   "userRandomID": {
//     id: "userRandomID", 
//     email: "user@example.com", 
//     password: "purple-monkey-dinosaur"
//   },
//  "user2RandomID": {
//     id: "user2RandomID", 
//     email: "user2@example.com", 
//     password: "dishwasher-funk"
//   }
}

// -------------------------------------------------- Generate Random String
function generateRandomString() {
  let text = "";
  const POSSIBLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    text += POSSIBLE.charAt(Math.floor(Math.random() * POSSIBLE.length));
  }
  return text;
}

// -------------------------------------------------- Routes
app.get("/", (req, res) => {
  res.render("landing-page");
});

// -------------------------------- Read database page
app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    const templateVars = {
      urls: urlDatabase,
      user: users[req.session.user_id]
    };
    res.render("urls_index", templateVars);
  } else {
    res.status(401).render("./errors/401");
  }  
});

// -------------------------------- Create url to database
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const urlTemplate = {
    userId: req.session.user_id,
    longURL: longURL
  };
  urlDatabase[shortURL] = urlTemplate;
  res.redirect(`/urls/${shortURL}`);
});

// -------------------------------- Read new url page
app.get("/urls/new", (req, res) => {
  if (req.session.user_id){
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
    return;
  }
  res.redirect("/login");
});

// -------------------------------- Read specific url page
app.get("/urls/:id", (req, res) => {
  if (req.session.user_id) {
    if (req.params.id in urlDatabase) {
      const templateVars = {
        shortURL: req.params.id,
        longURL: urlDatabase[req.params.id].longURL,
        user: users[req.session.user_id]
      };
      res.render("urls_show", templateVars);
    } else {
      res.status(404).render("./errors/404");
    }
  } else {
    res.status(403).render("./errors/403");
  }
});

// -------------------------------- Delete specific url page
app.post("/urls/:id/delete", (req, res) => {
  if (req.session.user_id) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.status(403).render("./errors/403"); // need another condition? asking for get delete route...
  }
});

// -------------------------------- Update specific url page
app.post("/urls/:id", (req, res) => {
  if (req.session.user_id) {
    const longURLUpdated = req.body.longURLUpdated;
    urlDatabase[req.params.id].longURL = longURLUpdated;
    res.redirect("/urls");
  } else {
    res.status(403).render("./errors/403");
  }
});

// -------------------------------- Read website of specific url page
app.get("/u/:shortURL", (req, res) => {
  if (req.params.shortURL in urlDatabase){
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).render("./errors/404");
  }
});

// -------------------------------- Register
app.get("/register", (req, res) => {
  if (req.session.user_id){
    res.redirect("/urls");
  } else {
    res.render("register");
  }
});

app.post("/register", (req, res) => {
  const registrationEmail = req.body.email;
  const registrationPassword = req.body.password;
  const hashed_password = bcrypt.hashSync(registrationPassword, 10);
  const registrationUserId = generateRandomString();

// ---------- Function - Validate email and password
  function validateEmailAndPassword(email, password){
    return (password.length > 0 && email.includes('@'));
  }

// ---------- Function - Validate unique email
  function validateUniqueEmail(email){
    for (let key in users){
      const user = users[key];
      if (user && user.email === email){
        return false;
      }
    }
    return true;
  }

  if (!validateEmailAndPassword(registrationEmail, hashed_password)){
    res.status(400).render("./errors/400-invalid");
    return;
  }

  if (!validateUniqueEmail(registrationEmail)){
    res.status(400).render("./errors/400-registered");
    return;
  }
  
// ---------- add new user
  users[registrationUserId] = {
    id: registrationUserId,
    email: registrationEmail,
    password: hashed_password
  }

// ---------- set cookie for new user
  req.session.user_id = registrationUserId;
  res.redirect("/urls");
});

// -------------------------------- Login (set cookie)
app.get("/login", (req,res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("login");
  }
});

app.post("/login", (req, res) => {
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;
  
  for (let key in users){
    const user = users[key];
    if (user && user.email === loginEmail && bcrypt.compareSync(loginPassword, user.password)){
      req.session.user_id = user.id;
      res.redirect("/urls");
      return;
    }
  }
  res.status(401).render("./errors/401");
});

// -------------------------------- Logout
app.post("/logout", (req, res) => {
  req.session = null;
  console.log("Logout successful");
  res.redirect("/");
});

// -------------------------------------------------- Initialize app
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
