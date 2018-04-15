var http = require("http");
var https = require("https");
var Binance = require('binance-api-node').default;
var axios = require('axios')
var moment = require('moment')
const Gdax = require('gdax');
const GdaxPublicClient = new Gdax.PublicClient();

var SUPPORTED_MARKETS = ["LTCBTC", "BNBBTC", "BTCLTC", "BTCETH", "ETHBTC", "BTCBNB"];
var SUPPORTED_TRADE_TYPES = ["MARKET", "LIMIT"];

function getBTCUSD(inputs) {
	return Math.random() * (9000 - 7000) + 7000;
}

function getBTC(toGet) {
	var theMap = {
		"LTC": { min: 0.0150, max: 0.0159 },
		"ETH": { min: 0.05, max: 0.07 },
		"XRP": { min: 0.00007, max: 0.00010 },
		"BCH": { min: 0.08, max: 0.09 },
		"BNB": { min: 0.0013, max: 0.0017 }
	}
	return Math.random() * (theMap[toGet].max - theMap[toGet].min) + theMap[toGet].min;
}

function binanceToTransactions(transactions, marketToBaseAsset) {
	var output = {
		buys: {},
		sells: {}
	};

	transactions.forEach((transaction) => {

		var buyCoin;
		var sellCoin;
		var qtyAquired;
		var qtySold;
		var pricePerUnit;
		var BTCPerUnit;
		var USDPerUnit;
		if (transaction.side === "BUY") {
			buyCoin = marketToBaseAsset[transaction.symbol].quote;
			sellCoin = marketToBaseAsset[transaction.symbol].base;
			qtyAquired = transaction.executedQty;
			qtySold = qtyAquired / transaction.price;
			BTCPerUnit = getBTC(buyCoin);
			USDPerUnit = getBTCUSD();
		} else {
			sellCoin = marketToBaseAsset[transaction.symbol].quote;
			buyCoin = marketToBaseAsset[transaction.symbol].base;
			qtySold = transaction.executedQty
			qtyAquired = qtySold / transaction.price;
			BTCPerUnit = getBTC(sellCoin);
			USDPerUnit = getBTCUSD();
		}

		if (SUPPORTED_TRADE_TYPES.indexOf(transaction.type) !== -1) {
			var mappedTransaction = {
				timestamp: transaction.time,
				aquired: buyCoin,
				sold: sellCoin,
				qtyAquired: qtyAquired,
				qtySold: qtySold,
				pricePerUnit: transaction.price,
				BTCPerUnit: BTCPerUnit,
				USDPerUnit: USDPerUnit
			};

			if (transaction.side === "BUY") {
				if (output.buys[mappedTransaction.aquired] == null) {
					output.buys[mappedTransaction.aquired] = [];
				}
				output.buys[mappedTransaction.aquired].push(mappedTransaction);
			} else {
				if (output.sells[mappedTransaction.sold] == null) {
					output.sells[mappedTransaction.sold] = [];
				}
				output.sells[mappedTransaction.sold].push(mappedTransaction);
			}
		}
	})
	return output;
}

function sortTransactions(transactions) {
	transactions.sort(function (a, b) {
		return b.timestamp - a.timestamp;
	})
}

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

function calculateSummary(buys, sells) {
	let summary = []
	function writeRowToSummary(buy, sell) {
		summary.push({
			"Description": `${buy.qtyAquired} ${buy.aquired}`,
			"DateAquired": buy.timestamp,
			"DateSoldDisposed": sell.timestamp,
			"SalesPriceUsd": sell.USDPerUnit * sell.qtyAquired,
			"CostBasis": buy.USDPerUnit * buy.qtyAquired,
			"GainLoss": (sell.USDPerUnit * sell.qtyAquired) - (buy.USDPerUnit * buy.qtyAquired)
		})
	}



	function deepCopy(obj) {
		return JSON.parse(JSON.stringify(obj))
	}

	Object.keys(sells).forEach((coin) => {
		console.log(coin)
		while (sells[coin].length > 0 &&
			// this is FOR DEMO PURPOSES ONLY and should never happen we will need to figure this out later
			buys[coin].length > 0) {
			console.log(`buy: ${buys[coin][0].qtyAquired} sell: ${sells[coin][0].qtySold}`)
			if (buys[coin][0].qtyAquired > sells[coin][0].qtySold) {
				console.log("buy greater")

				let buyCopy = deepCopy(buys[coin][0])
				buyCopy.qtyAquired = sells[coin][0].qtySold
				writeRowToSummary(buyCopy, deepCopy(sells[coin][0]))
				buys[coin][0].qtyAquired -= sells[coin][0].qtySold
				sells[coin].shift()
			} else if (buys[coin][0].qtyAquired < sells[coin][0].qtySold) {
				console.log("buy less")
				let sellCopy = deepCopy(sells[coin][0])
				sellCopy.qtySold = buys[coin][0].qtyAquired

				sells[coin][0].qtySold -= buys[coin][0].qtyAquired
				console.log(sells[coin][0].qtySold)
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
		promises.push(Promise.all([binance.depositHistory({ 'recvWindow': 10000000 }), binance.withdrawHistory({ 'recvWindow': 10000000 })]).then(function (responses) {
			return (new Promise(function (resolve, reject) {
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
			for (var i = 0; i < currentTransactions.length; i++) {
				binanceTransactions = binanceTransactions.concat(currentTransactions[i]);
			}
		}).then(function () {

			if(req.body.trades != null){
				req.body.trades.forEach(function(thing){
					binanceTransactions.push(thing);
				});
			}

			var objs = binanceToTransactions(binanceTransactions, marketToBaseAsset);
			var buyKeys = Object.keys(objs.buys);
			var sellKeys = Object.keys(objs.sells);
			buyKeys.forEach(function (k) {
				sortTransactions(obj.buys[k]);
			});
			sellKeys.forEach(function (k) {
				sortTransactions(obj.sells[k]);
			});
			res.json(calculateSummary(objs.buys, objs.sells));
			res.end();
		})
	});
}



module.exports = apiRouter;