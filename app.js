//app.js

const express = require("express");

const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", (req, res) => {
  fs.access("file.txt", fs.constants.R_OK, (err) => {
    if (err) {
      res.status(404).send("File Not Found");
    } else {
      fs.readFile("file.txt", "utf8", (err, data) => {
        if (err) {
          res.status(500).send("Error Reading File");
        } else {
          res.render("index", {
            message: data,
          });
        }
      });
    }
  });
});

app.get("/file", (req, res) => {
  fs.access("file.txt", fs.constants.R_OK, (err) => {
    if (err) {
      res.status(404).send("File Not Found");
    } else {
      fs.readFile("file.txt", "utf8", (err, data) => {
        if (err) {
          res.status(500).send("Error Reading File");
        } else {
          res.send(data);
        }
      });
    }
  });
});

app.post("/send", (req, res) => {
  const { message } = req.body;
  fs.writeFile("file.txt", message, (err) => {
    if (err) {
      res.status(500).send("Error Sending Data");
    } else {
      res.send("Data sent successfully");
    }
  });
});

app.listen(PORT, (error) => {
  if (!error)
    console.log(
      "Server is Successfully Running,and App is listening on port " + PORT
    );
  else console.log("Error occurred, server can't start", error);
});
