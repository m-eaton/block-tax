var http = require("http");
var https = require("https");
var Binance = require('binance-api-node').default;

var SUPPORTED_MARKETS = ["LTCBTC", "BNBBTC", "BTCLTC", "BTCETH" , "ETHBTC", "BTCBNB"];

var apiRouter = function(api, marketToBaseAsset) {

	api.post("/getSummary", async function(req,res){
		var publicKey = req.body.binancePublic;
		var secretKey = req.body.binanceSecret;
		var binanceTransactions = [];
		var payload = {
			"protocol": "https:",
			"host": "www.binance.com",
			"path": "/api/v1/exchangeInfo"
		}
		var binance = Binance({
			"apiKey": publicKey,
			"apiSecret": secretKey
		});

		var deposits = (await binance.depositHistory()).depositList;
		console.log(deposits);

		var markets = Object.keys(marketToBaseAsset).filter(function(a){
			return (SUPPORTED_MARKETS.indexOf(a) !== -1);
		});
		console.log(markets);
		for(var i = 0; i < markets.length; i++){
			console.log("Getting transactions for  : " + markets[i] );
			binanceTransactions = binanceTransactions.concat(await binance.allOrders({
				symbol: markets[i],
				useServerTime: true
			}));
		}

	})

}

module.exports = apiRouter;
