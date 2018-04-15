var crypto = require("crypto");

var auth = {

    "getApiKey": function getApiKey(uri, secret){
        return crypto.createHmac("sha512", secret).update(uri).digest("hex");
    }
}

module.exports = auth;
