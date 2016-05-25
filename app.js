var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var createHello = 'INSERT INTO heroku.hello(value, id) VALUES(?, ?)';
var getHello = 'SELECT * FROM heroku.hello WHERE id=?';
var updateHello = 'UPDATE heroku.gumball SET value=? WHERE id=?';
const cassandra = require('cassandra-driver');
const client=new cassandra.Client({contactPoints : ['52.9.221.48:9042']});
/*
CREATE KEYSPACE "heroku" WITH REPLICATION = { 'class' : 'SimpleStrategy' , 'replication_factor' :3 };
CREATE TABLE hello(value text, id int, PRIMARY KEY(id));
*/
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
  next();
});

app.post('/heroku', function(req, res) {
  var value = req.body.value;
  var id = req.body.id;
  client.execute(createHello,[value, id],{ prepare: true }, function(err, getresult){
    if(err) {
      res.json(err);
    }
    else {
      res.json({"message":"successful"});
    }
  });
});

app.get('/heroku/:id', function(req, res) {
  var id = req.params.id;
  client.execute(getHello,[id],{ prepare: true }, function(err, getresult) {
    if(err) {
      res.json(err);
    }
    else {
      res.json({rows:getresult.rows});
    }
  });
});

app.put('/heroku/:id', function(req, res) {
  var name = req.body.name;
  var value = req.body.value;
  var id = req.params.id;
  client.execute(updateHello,[value, id],{ prepare: true }, function(err, getresult) {
    if(err) {
      res.json(err);
    }
    else {
      res.json({"message":"successful"});
    }
  });
});

app.set('port', process.env.PORT || 3000);
 
var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

module.exports = app;