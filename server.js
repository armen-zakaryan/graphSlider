var express = require('express')
var app = express()

app.use('/', function (req, res) {
  res.send('Hello World')
})

app.listen(3000, function(){
	console.log("App listening on port 3000");
})

/* GET Hello World page. */
app.get('/helloworld', function(req, res) {
    res.render('helloworld', { title: 'Hello, World!' })
});