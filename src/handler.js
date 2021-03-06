const fs = require("fs");
const path = require("path");
const connect = require("../database/db_connection");

const publicHandler = (req, res) => {
  var url = req.url;
  if (url === "/") {
    url = "/public/index.html";
  }
  var parts = url.split(".")[1];
  var extensionType = {
    css: "text/css",
    html: "text/html",
    js: "application/javascript",
    ico: "image/x-icon",
    json: "application/json"
  }[parts];
  fs.readFile(path.join(__dirname, "..", url), (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/html" });
      console.log(err);
      return res.end("Internal Server Erroooor");
    }
    res.writeHead(200, { "Content-Type": extensionType });
    res.end(data);
  });
};

const getData = cb => {
  connect.query(`SELECT events.title, events.description ,events.dt , users.name FROM events INNER JOIN users ON events.user_id = users.id`, (err, users) => {
    if (err) {
      console.log(err + "get data didnt work");
      return cb(err);
    }
    const data = users.rows;
    cb(null, data);
  });
};

const postData = (username, title, description, date, cb) => {
  connect.query(`SELECT id FROM users WHERE name=$1`, [username],(err,data)=>{
    if (err){
      console.log(err + "user cannot be created");
    return  cb(err);

    }
    const userId = data.rows[0].id;

    connect.query(
      `INSERT INTO events(title, description, dt, user_id) VALUES ($1, $2, $3, $4)`,
      [title, description, date, userId],
      (err, data) => {
        if (err) {
          console.log(err, "Events cannot be created");
        return  cb(err);
        }
        cb(null, data);
      }
    );
  });

};

module.exports = { publicHandler, getData, postData };
