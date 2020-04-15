const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const url = "mongodb://vasanth:vasanth123@ds241288.mlab.com:41288";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;

app.set('PORT',process.env.PORT)

app.use(cors());
app.use(bodyParser.json());
function authenticate(req, res, next) {
  var incomingToken = req.header("Authorization");
  jwt.verify(incomingToken, "csgfuygfbhdgfhdcgfndshg", function(err, decoded) {
    if (decoded !== undefined) {
      next();
    } else {
      res.status(401).json({
        message: "Not authenticated"
      });
    }
  });
}

app.post("/saveData", function(req, res) {
  mongoClient.connect(url, function(err, client) {
    if (err) throw err;
    var db = client.db("exampleDB");
    db.collection("user").insertOne(req.body, function(err, data) {
      if (err) throw err;
      res.json({ message: "Success" });
    });
    client.close();
  });
});

app.post("/product", function(req, res) {
  mongoClient.connect(url, function(err, client) {
    if (err) throw err;
    var db = client.db("node-demo-db");
    db.collection("product").insertOne(req.body, function(err, data) {
      if (err) throw err;
      res.json({ message: "Success" });
    });
    client.close();
  });
});

app.get("/product", function(req, res) {
  mongoClient.connect(url, function(err, client) {
    if (err) throw err;
    var db = client.db("node-demo-db");
    var userCursor = db
      .collection("product")
      .find()
      .toArray();
    userCursor.then(function(data) {
      console.log(data);
      res.json(data);
      client.close();
    });
  });
});

app.get("/userData", authenticate, function(req, res) {
  mongoClient.connect(url, function(err, client) {
    if (err) throw err;
    var db = client.db("exampleDB");
    var userCursor = db
      .collection("user")
      .find()
      .toArray();
    userCursor.then(function(data) {
      console.log(data);
      res.json(data);
      client.close();
    });
  });
});

app.post("/register", function(req, res) {
  mongoClient.connect(url, function(err, client) {
    if (err) throw err;
    var db = client.db("exampleDB");
    bcrypt.genSalt(saltRounds, function(err, salt) {
      bcrypt.hash(req.body.password, salt, function(err, hash) {
        db.collection("user").insertOne(
          { email: req.body.email, password: hash,name : req.body.name },
          function(err, data) {
            if (err) throw err;
            res.status(200).json({
              message: "Successfully Registered"
            });
            client.close();
          }
        );
      });
    });
  });
});

app.post("/login", function(req, res) {
  mongoClient.connect(url, function(err, client) {
    if (err) throw err;
    var db = client.db("exampleDB");
    var result = db.collection("user").findOne({ email: req.body.email });
    result.then(function(userdata) {
      if (userdata !== null) {
        bcrypt.compare(req.body.password, userdata.password, function(
          err,
          hasResult
        ) {
          if (hasResult == true) {
            jwt.sign(
              {
                exp: Math.floor(Date.now() / 1000) + 60 * 60,
                data: "foobar"
              },
              "csgfuygfbhdgfhdcgfndshg",
              function(err, token) {
                if (err) throw err;
                res.json({
                  message: "Success",
                  token: token
                });
              }
            );
          } else {
            res.status(403).json({
              message: "Wrong Password"
            });
          }
        });
        client.close();
      } else {
        res.json({
          message: "No E-Mail Match"
        });
      }
    });
  });
});

app.listen(app.get('PORT'),function(){
  console.log(app.get('PORT'))
});
