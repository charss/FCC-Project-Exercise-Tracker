const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser')
const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const exercise = {
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: String, required: true }
}

const personSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  count: Number,
  exercise: {
    type: Array,
    value: exercise
  }
});

const Person = mongoose.model('Person', personSchema);
const URL = process.env.ATLAS_URI;
mongoose.connect(URL);

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(bodyParser.urlencoded({ extended: false }));

app.route('/api/users')
  .post((req, res) => {
    let a = req.body.username;
    let person = new Person({ username: a, count: 0 });
    person.save(function(err, data) {
      res.json({ "username": data.username, "_id": data._id });
    })
  })
  .get((req, res) => {
    Person.find((err, data) =>
      res.json(data))
  });

app.post('/api/users/:_id/exercises', (req, res) => {
  Person.findById(req.params._id, (err, data) => {
    let datt = '';
   
    if (!req.body.date) {
      datt = (new Date()).toDateString();
    } else {
      datt = (new Date(req.body.date)).toDateString();
    }
  
    exercise.description = req.body.description;
    exercise.duration = parseInt(req.body.duration);
    exercise.date = datt;
    data.count = data.count + 1;
    data.exercise.unshift(exercise);
    data.save();

    res.send({
      "_id": data._id,
      "username": data.username,
      'date': exercise.date,
      'duration': exercise.duration,
      'description': exercise.description
    });  
  });   
});

app.get('/api/users/:_id/logs', (req, res) => {
  Person.findById(req.params._id, (err, data) => {
    let limit = data.exercise.length;
    let from = '1970-01-01';
    let to = '2038-01-18';
    
    if (typeof req.query.from != 'undefined') {
      from = req.query.from;
    }
    
    if (typeof req.query.to != 'undefined') { 
      to = req.query.to;
    }
    
    if (typeof req.query.limit != 'undefined') { 
      limit = parseInt(req.query.limit);
    }

    let fromF = new Date(from).toDateString();
    let toF = new Date(to).toDateString();

    let ans = data.exercise.filter(q => new Date(q.date).getTime() >= new Date(from).getTime() && new Date(q.date).getTime() < new Date(to).getTime());

    let resp = {
      "_id": req.params._id,
      "username": data.username
    };

    if (from != '1970-01-01') resp.from = fromF;
    if (to != '2038-01-18') resp.to = toF;

    resp.count = ans.slice(0, limit).length;
    resp.log = ans.slice(0, limit);
    
    res.json(resp);
  });    
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})