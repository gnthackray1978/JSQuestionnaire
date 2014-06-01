// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
 
var http     = require('http');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash 	 = require('connect-flash');

var configDB = require('./config/database.js');
var configFB = require('./config/auth.js');


// configuration ===============================================================
mongoose.connect(configDB.settings.url, function (err, res) {
  if (err) {
	console.log ('ERROR connecting to: ' + configD.settings.url + '. ' + err);
  } else {
	console.log ('Succeeded connected to: ' + configDB.settings.url);
	 
	//console.log(mongoose.connection.db.collection); 
	 
	mongoose.connection.db.collectionNames(function (err, names) {
       // console.log(names); // [{ name: 'dbname.myCollection' }]
		
    });
	
	
	
	//var action = function (err, collection) {
	//	// Locate all the entries using find
	//	collection.find({}).toArray(function(err, results) {
	//		
	//		console.log(results);
	//	});
	//	
	//};

	//mongoose.connection.db.collection('ques', action);


  }
});
  
require('./config/passport')(passport); // pass passport for configuration

var config = {
  ns: 'thackraynotes',
  id:  '205401136237103',
  secret:  'e2bae4f7b2ffa301366c119107df79b1',
  scope:      'email'
};

var fbsdk = require('./libs/facebook/facebook.js').init(config);

var Ques = mongoose.model('ques', configDB.ques);

var Cats = mongoose.model('cats', configDB.cats);


app.configure(function() {

	var oneDay = 86400000;

	app.use(express.compress());

	console.log('static contents at: ' + __dirname + '/public');

	app.use(express.static(__dirname + '/public', { maxAge: oneDay }));
	// set up our express application
	app.use(express.logger('dev')); // log every request to the console
	app.use(express.cookieParser()); // read cookies (needed for auth)
	app.use(express.bodyParser()); // get information from html forms

	app.set('view engine', 'ejs'); // set up ejs for templating

	// required for passport
	app.use(express.session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
	app.use(express.bodyParser());
    app.use(express.methodOverride());
	
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session
		
	// Make our db accessible to our router
	app.use(function(req,res,next){
		req.ques = Ques;
		req.cats = Cats;	 
		next();
	});
	
	
	app.use(fbsdk.auth);
//console.log('fb details');
//console.log(FB.options);
//console.log(config.facebookAuth.clientID);
	//console.log(FB.options.appId);
	//console.log(FB.options.clientSecret);
	//console.log(FB.options.callbackURL);
});


/*
app.all('/', function(req, res) {
  var facebook = req.facebook;
  
  console.log("faceobook", facebook);
  
  if (facebook && facebook.signedRequest && facebook.signedRequest.user_id) {
    facebook.api('me', function(er, me) {
      res.render('index', {config: config, me: me});
    });
  } else {
    res.redirect(fbsdk.loginURL(fbsdk.canvasURL));
  }
  
  
});
*/

//Demo making API calls using App Access Token
fbsdk.appApi(config.id + '?fields=id,name,canvas_url', function(e, result) {
  console.log("Got app info using app access token", result);
});




console.log('routing...');


// routes ======================================================================
require('./app/routes.js')(app,passport,express); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);