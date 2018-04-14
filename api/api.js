var express = require("express");
var bodyParser = require("body-parser");
var api = express();

api.use(bodyParser.json());
api.use(bodyParser.urlencoded({ extended: true }));

var routes = require("./routes/routes.js")(api);

var server = api.listen(8081, function(){
	console.log("api running on port %s", server.address().port); 

});
