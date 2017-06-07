"use strict";

const express = require("express");
const bodyParser = require("body-parser");

const app = express();

const PORT = process.env.PORT || 8080; // default port 8080

// -------------------------------------------------- Configuration
app.set("view engine", "ejs");

// -------------------------------------------------- Middleware
app.use(bodyParser.urlencoded({
  extended: true
}));

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
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// -------------------------------------------------- Routes
app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  if (req.params.id in urlDatabase) {
    console.log('Exists!');
    let templateVars = {
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id]
    };
    res.render("urls_show", templateVars);
  } else {
    console.log('Not a valid shortlink');
    res.redirect("/urls");
  }
});

app.post("/urls/:id", (req, res) => {
  let longURL = req.body.longURL;
  urlDatabase[req.params.id] = longURL;
  res.redirect(`/urls/${req.params.id}`)
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// -------------------------------------------------- Initialize app
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
