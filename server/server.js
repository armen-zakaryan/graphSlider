var express = require('express');
//var dbPath = "./server/DB/";
var Node = require("./DB/Node");
var app = express();

//SetTimeout for testing porposes
setTimeout(function() {
    Node.addNode({
        name: 'User 1',
        url: 'http://something....',
        tags: ['d', 'f']
    }).then(function() {
        console.log("Item was created");
    }, function(err) {
        console.log(err);
    });
}, 3000);



app.listen(3000, function() {
    console.log("App listening on port 3000");
});



/*
app.get('/', function (req, res) {
	res.send('Hello World')
});

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