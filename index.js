const express = require("express");
const methodOverride = require("method-override");
const app = express();

const mysql = require("mysql2");
const path = require("path");

require("dotenv").config();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

const port = process.env.PORT;
const connection = mysql.createConnection({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});
connection.connect();

app.listen(port, () => {
  console.log("Server Started at port", port);
});

app.get("/", (req, res) => {
  let q = `SELECT * FROM switches`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      res.render("home.ejs", { switches: result });
    });
  } catch (err) {
    res.send("Error Occured");
  }
});

app.post("/create-switch", (req, res) => {
  let { status, name, hour, minute, second } = req.body;

  status = status == "on" ? true : false;

  let timer = Number(second);
  timer += 60 * Number(minute);
  timer += 3600 * Number(hour);

  let date = new Date().toISOString().slice(0, 19).replace("T", " ");

  try {
    let q = `INSERT INTO switches(name,status,last_toggled,timer) VALUES('${name}',${status},'${date}',${timer});`;
    connection.query(q, (err, result) => {
      if (err) throw err;
      res.redirect("/");
    });
  } catch (err) {
    res.send("Error Occured");
  }
});
