require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

const userModel = require('./models/userModel')
const exerciseModel = require('./models/exerciseModel')
const logModel = require('./models/logModel')

const mongoose = require("mongoose");
mongoose.connect(process.env.ATLAS_URI, { useNewUrlParser: true });
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

// const urlMOdel('require')

app.use(cors());
app.use(express.static("public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/users", function (req, res) {
  const user = userModel;

  user.find((err, data) => {
    return res.json(data);
  })

})

app.get("/api/users/:_id/logs", function (req, res) {
  const id = req.params._id;

  const USER = userModel;

  USER.findOne({ _id: id }).then((user) => {
    if (user.length === 0) {
      res.json({ message: "User is not found" });
    } else {
      const EXERCISE = exerciseModel;

      EXERCISE.find({username: user['username']}).then((logs) => {
        let logsArray = [];
        
        for (let i = 0; i < logs.length; i++) {
          logsArray.push({
            "description": logs[i]["description"],
            "duration": logs[i]["duration"],
            "date": logs[i]["date"].toDateString()
          })
        }
        res.json({
          username: user['username'],
          count: logs.length,
          _id: user['_id'],
          log: logsArray,
        });
      })
    }
  });
})

app.post("/api/users", function (req, res) {
  let username = req.body["username"];

  let body = new userModel({
    username: username
  });

  body.save((err, data) => {
    if (!err) {
      console.log("success", "User added successfully!");
      return res.json({
        username: data["username"],
        _id: data['_id'],
      });
    } else {
      console.log("Error", err);
      return res.send(err);
    }
  });

});

app.post("/api/users/:_id?/exercises", function (req, res) {
  const id = req.params._id;
  const descrip = req.body['description'];
  const duration = req.body['duration'];
  const logDate = req.body['date'];

  // if (logDate.length !== 0) {
  //   var today = new Date();
  //   console.log(today)
  // }

  const USER = userModel;

  USER.findOne({ _id: id }).then((data) => {
    if (!data) {
      res.json({ message: "User is not found" });
    } else {
      let body = new exerciseModel({
        username: data['username'],
        description: descrip,
        duration: duration,
        ...(logDate.length != 0) && {date: new Date(logDate)},
      })

      body.save((err, exercise) => {
        if (!err) {
          console.log("success", "Exercise added successfully!");
          return res.json({
            username: exercise['username'],
            description: exercise['description'],
            duration: exercise['duration'],
            _id: exercise['_id'],
            date: exercise['date'].toDateString(),
          });
        } else {
          console.log("Error", err);
          return res.send(err);
        }
      });
    }
  });
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
