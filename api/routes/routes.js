var http = require("http");
var https = require("https");
var Binance = require('binance-api-node').default;
var axios = require('axios')
var moment = require('moment')

var SUPPORTED_MARKETS = ["LTCBTC", "BNBBTC", "BTCLTC", "BTCETH", "ETHBTC", "BTCBNB"];

function depositsToTransactions(deposits) {
	var output = [];
	for (var i = 0; i < deposits.length; i++) {
		if (deposits[i].status === 1) {
			output.push({
				symbol: "USD" + deposits[i].asset,
				orderId: null,
				price: null,
				origQty: deposits[i].amount,
				executedQty: deposits[i].amount,
				time: deposits[i].insertTime,
				type: "LIMIT",
				side: "BUY",
			})
		}
	}
	return output;
}
function withdrawsToTransactions(withdraws) {
	var output = [];
	for (var i = 0; i < withdraws.length; i++) {
		if (withdraws[i].status === 6) {
			output.push({
				symbol: withdraws[i].asset + "USD",
				orderId: null,
				price: null,
				origQty: withdraws[i].amount,
				executedQty: withdraws[i].amount,
				time: withdraws[i].insertTime,
				type: "LIMIT",
				side: "BUY",
			})
		}
	}
	return output;
}

function calculateSummary() {
	let summary = []
	function writeRowToSummary(buy, sell) {
		summary.push({
			buy: buy,
			sell: sell
		})
	}



	let sells = {
		"BTC": [
			{
				amount: 10
			}, {
				amount: 5
			}
		]
	}

	let buys = {
		"BTC": [
			{
				amount: 5
			},
			{
				amount: 5
			}
		]
	}


	function deepCopy(obj) {
		return JSON.parse(JSON.stringify(obj))
	}

	Object.keys(sells).forEach((coin) => {
		console.log(coin)
		while (sells[coin].length > 0 &&
		// this is FOR DEMO PURPOSES ONLY and should never happen we will need to figure this out later
		buys[coin].length > 0) {
			console.log(`buy: ${buys[coin][0].amount} sell: ${sells[coin][0].amount}`)
			if (buys[coin][0].amount > sells[coin][0].amount) {
				console.log("buy greater")

				let buyCopy = deepCopy(buys[coin][0])
				buyCopy.amount = sells[coin][0].amount
				writeRowToSummary(buyCopy, deepCopy(sells[coin][0]))
				buys[coin][0].amount -= sells[coin][0].amount
				sells[coin].shift()
			} else if (buys[coin][0].amount < sells[coin][0].amount) {
				console.log("buy less")
				let sellCopy = deepCopy(sells[coin][0])
				sellCopy.amount = buys[coin][0].amount

				sells[coin][0].amount -= buys[coin][0].amount
				console.log(sells[coin][0].amount)
				writeRowToSummary(deepCopy(buys[coin][0]), sellCopy)
				buys[coin].shift()
			} else {
				console.log("equal")

				writeRowToSummary(deepCopy(buys[coin][0]), deepCopy(sells[coin][0]))
				sells[coin].shift()
				buys[coin].shift()
			}
		}
	})

	return summary
}

var apiRouter = function (api, marketToBaseAsset) {

	api.post("/getSummary", async function (req, res) {
		var publicKey = req.body.binancePublic;
		var secretKey = req.body.binanceSecret;
		var binanceTransactions = [];
		var promises = [];
		var payload = {
			"protocol": "https:",
			"host": "www.binance.com",
			"path": "/api/v1/exchangeInfo"
		}
		var binance = Binance({
			"apiKey": publicKey,
			"apiSecret": secretKey
		});
		promises.push(Promise.all([binance.depositHistory(), binance.withdrawHistory()]).then(function(responses){
			return (new Promise(function(resolve, reject){
				var output = depositsToTransactions(responses[0].depositList);
				output = output.concat(withdrawsToTransactions(responses[1].withdrawList));
				resolve(output);
			}));
		}));

		var markets = Object.keys(marketToBaseAsset).filter(function (a) {
			return (SUPPORTED_MARKETS.indexOf(a) !== -1);
		});
		for (var i = 0; i < markets.length; i++) {
			console.log("Getting transactions for  : " + markets[i]);
			promises.push(binance.allOrders({
				symbol: markets[i],
				useServerTime: true
			}));
		}

		Promise.all(promises).then(function (currentTransactions) {
			for(var i = 0; i < currentTransactions.length; i++){
				binanceTransactions = binanceTransactions.concat(currentTransactions[i]);
			}
		});
	});
}



module.exports = apiRouter;
