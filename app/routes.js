module.exports = function(app,FB,express) {


	app.get('/TestLogin', isLoggedIn, function(req, res) {	 
	
		console.log ('/TestLogin hit');
		
		var facebook = req.facebook;
	  
		 //755685067
	 // console.log ('/TestLogin hit: ' + req.user);
	
	
		if (facebook && facebook.signedRequest && facebook.signedRequest.user_id) {
			facebook.api(facebook.signedRequest.user_id, function(er, me) {
				res.json(me.username);		
			});
		} 
   
		//res.json(facebook.signedRequest.user_id);			 	 
	});
	
	app.get('/ques', function(req, res) {			
		var db = req.ques;	
		
		var catid = req.param("cat");
		
		db.find({ category: catid }).exec(function(err, result) {
			  if (!err) {
				// handle result
				console.log (result);		
				res.json(result);		
			  } else {
				console.log (err);
			  };
			});
	});
	
	
	
	app.get('/cats',  function(req, res) {			
		var db = req.cats;
	
		console.log( req.param("v"));
	
		db.find({}).exec(function(err, result) {
			  if (!err) {
				// handle result
				console.log (result);		
				res.json(result);		
			  } else {
				console.log (err);
			  };
			});
	});
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	//console.log ('isLoggedIn: ' + req.isAuthenticated());	
	// if user is authenticated in the session, carry on 

	if ( req.facebook.signedRequest.user_id)
		return next();

	// if they aren't redirect them to the home page
	res.json('auth failed');
}
 