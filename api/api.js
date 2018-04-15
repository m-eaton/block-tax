var express = require("express");
var bodyParser = require("body-parser");
var api = express();
var https = require("https");

var marketToBaseAsset = {};

api.use(bodyParser.json());
api.use(bodyParser.urlencoded({ extended: true }));




var routes = require("./routes/routes.js")(api, marketToBaseAsset);


function generateMarketToBaseAsset() {
	return (new Promise(function (resolve, reject) {
		var payload = {
			"protocol": "https:",
			"host": "www.binance.com",
			"path": "/api/v1/exchangeInfo"
		}

		var data = [];
		https.get(payload, function (binanceResponse) {
			binanceResponse.on("data", function (chunk) {
				data.push(chunk);
			});
			binanceResponse.on("end", function () {
				var exchangeInfo = JSON.parse(data.join(""));
				if (exchangeInfo && exchangeInfo.symbols) {
					for (var i = 0; i < exchangeInfo.symbols.length; i++) {
						
						marketToBaseAsset[exchangeInfo.symbols[i].symbol] = { base: exchangeInfo.symbols[i].baseAsset, quote: exchangeInfo.symbols[i].quoteAsset };
					}
				}
				resolve();
			});
		});
	}));
}

var server;
generateMarketToBaseAsset().then(function(){
	server = api.listen(8081, function () {
		console.log("api running on port %s", server.address().port);
		console.log("getting all markets");
	});
})

