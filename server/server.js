var express = require('express');
var bodyParser = require('body-parser');
var cons = require('consolidate');
//var routes = require('./server/routes.js'); //requesting  my module routes
var path = require('path');

var Node = require("./DB/Node");


var app = express();
app.use(bodyParser());

var __dirname = path.normalize(__dirname + "/../")

app.use(express.static(__dirname + '/'));
app.engine('html', cons.swig);
app.set('view engine', 'html');
app.set('views', __dirname + '/');


//routes.routes(app);



app.post('/node', function(req, res) {
    Node.addNode({
        name: req.body.name,
        data: req.body.data,
        neighbours: [],
        tags: ['d', 'f']
    }).then(function(number) {
        console.log("Node " + number + " was created");
        res.status(201).end();
    }, function(err) {
        console.log("Here");
        console.log(err);
        res.status(400).end();
    });
});



app.listen(3000, function() {
    console.log("App listening on port 3000");
});


/*
// GET All Nodes 
app.get('/nodes', function(req, res) {
	var j = require('./DB/relations.json');
	console.log("getting nodes", j);
    //res.render('helloworld', { title: 'Hello, World!' })
});

//If no Url matches send 'Not found'
app.use('/', function (req, res) {
	console.log('not found');
  	res.send('404', { status: 404, url: req.url });
});
*/