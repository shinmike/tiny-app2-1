"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const app = express();

const PORT = process.env.PORT || 8080; // default port 8080

// -------------------------------------------------- Configuration
app.set("view engine", "ejs");

// -------------------------------------------------- Middleware
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(cookieParser());

app.use("/assets", express.static("assets")); // to apply CSS

// -------------------------------------------------- Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "2kjg7L": "http://www.tsn.ca"
};

// -------------------------------------------------- Users
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
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
  res.redirect("/urls");
});

// -------------------------------- Read database page
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id]
  };
  res.render("urls_index", templateVars);
});

// -------------------------------- Create url to database
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// -------------------------------- Read new url page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});

// -------------------------------- Read specific url page
app.get("/urls/:id", (req, res) => {
  if (req.params.id in urlDatabase) {
    const templateVars = {
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id],
      user: users[req.cookies.user_id]
    };
    res.render("urls_show", templateVars);
  } else {
    res.render("urls_new");
  }
});

// -------------------------------- Delete specific url page
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// -------------------------------- Update specific url page
app.post("/urls/:id", (req, res) => {
  const longURLUpdated = req.body.longURLUpdated;
  urlDatabase[req.params.id] = longURLUpdated;
  res.redirect(`/urls/${req.params.id}`);
});

// -------------------------------- Read website of specific url page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// -------------------------------- Register
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const registrationEmail = req.body.email;
  const registrationPassword = req.body.password;
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

  if (!validateEmailAndPassword(registrationEmail, registrationPassword)){
    res.status(400).send("Invalid email and/or password");
    return;
  }

  if (!validateUniqueEmail(registrationEmail)){
    res.status(400).send("This email has already been registered");
    return;
  }
  
// ---------- add new user
  users[registrationUserId] = {
    id: registrationUserId,
    email: registrationEmail,
    password: registrationPassword
  }
// ---------- set cookie for new user
  res.cookie("user_id", registrationUserId);
  res.redirect("/urls");
});

// -------------------------------- Login (set cookie)
app.get("/login", (req,res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;
  
  for (let key in users){
    const user = users[key];
    if (user && user.email === loginEmail && user.password === loginPassword){
      res.cookie("user_id", user.id);
      res.redirect("/urls");
      return;
    }
  }
  res.status(403).send("Bad credentials");
});

// -------------------------------- Logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// -------------------------------- Read JSON of database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// -------------------------------------------------- Initialize app
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
