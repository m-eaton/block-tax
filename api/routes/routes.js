var apiRouter = function(api) {

	api.get("/test", function(req,res){
		res.send("hi there");	
	})

}

module.exports = apiRouter;
