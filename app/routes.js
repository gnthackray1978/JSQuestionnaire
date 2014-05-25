module.exports = function(app,express) {

	app.get('/TestLogin', isLoggedIn, function(req, res) {	 
	  if (!err) {
		// handle result
		console.log (req.user);		
		res.json(req.user);		
	  } else {
		console.log (err);
	  };			
	});
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
 