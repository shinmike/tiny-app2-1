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
    username: req.cookies.username
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
    username: req.cookies.username
  };
  res.render("urls_new", templateVars);
});

// -------------------------------- Read specific url page
app.get("/urls/:id", (req, res) => {
  if (req.params.id in urlDatabase) {
    const templateVars = {
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id],
      username: req.cookies.username
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

// -------------------------------- Login (set cookie)
app.post("/login", (req, res) => {
  if (req.body.username !== ""){
    res.cookie("username", req.body.username);
    console.log("cookie 'username' set!");
    res.redirect("/urls");
  } else {
    res.send("type in username");
  }
});

// -------------------------------- Logout
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  console.log("cookie 'username' cleared!");
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
