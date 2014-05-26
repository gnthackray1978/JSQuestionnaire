module.exports = function(app, passport,express,FB) {


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
 