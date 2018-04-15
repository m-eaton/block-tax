var http = require("http");
var https = require("https");
var Binance = require('binance-api-node').default;

var apiRouter = function(api, marketToBaseAsset) {

	api.post("/getTransactions", async function(req,res){
		var publicKey = req.body.binancePublic;
		var secretKey = req.body.binanceSecret;

		var payload = {
			"protocol": "https:",
			"host": "www.binance.com",
			"path": "/api/v1/exchangeInfo"
		}
		var binance = Binance({
			"apiKey": publicKey,
			"apiSecret": secretKey
		});

		var markets = Object.keys(marketToBaseAsset)
		console.log("time to make " + markets.length);
		for(var i = 0; i < markets.length; i++){
			console.log(await binance.allOrders({
				symbol: markets[i],
				useServerTime: true
			}))
		}
		
	})

}

module.exports = apiRouter;
