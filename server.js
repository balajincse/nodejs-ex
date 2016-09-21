//  OpenShift sample Node application
var express = require('express'),
    fs      = require('fs'),
    app     = express(),
    eps     = require('ejs'),
    path    = require('path'),
    bodyParser = require('body-parser'),
    request = require('request'),
    morgan  = require('morgan');
    
Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0'; //,
    //mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    //mongoURLLabel = "";

var env = { baseURL: '', accessKey: '' };

var services = JSON.parse(process.env.SERVICES || "{}");
var service = (services['pm-20'][0] || "{}");
var credentials = service.credentials;
if (credentials != null) {
		env.baseURL = credentials.url;
		env.accessKey = credentials.access_key;
}

// Only  URL paths prefixed by /score will be handled by our router 
var rootPath = '/score';

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 	// get an instance of the express Router

// configure router to use bodyParser()
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());


// middleware to use for all requests
router.use(function(req, res, next) {
 	next(); // make sure we go to the next routes and don't stop here
});

// env request
// Echoes the URL and access key of the scoring service - useful for debugging
router.get('/', function(req, res) {
	res.json(env);
});

// score request
// Calls the PM Service instance 
router.post('/', function(req, res) {
	var scoreURI = env.baseURL + '/score/' + req.body.context + '?accesskey=' + env.accessKey;
console.log('=== SCORE ===');
console.log('  URI  : ' + scoreURI);
console.log('  Input: ' + JSON.stringify(req.body.input));
console.log(' ');
	try {
		var r = request({	uri: scoreURI, method: "POST", json: req.body.input });
		req.pipe(r);
		r.pipe(res);
	} catch (e) {
		console.log('Score exception ' + JSON.stringify(e));
    var msg = '';
    if (e instanceof String) {
    	msg = e;
    } else if (e instanceof Object) {
      msg = JSON.stringify(e);
    }
    res.status(200);
    return res.send(JSON.stringify({
        flag: false,
        message: msg
  	}));
	}
	
	process.on('uncaughtException', function (err) {
    console.log(err);
	}); 
});
        
// Register Service routes and SPA route ---------------

// all of our service routes will be prefixed with rootPath
app.use(rootPath, router);


// SPA AngularJS application served from the root
app.use(express.static(path.join(__dirname, 'public')));


// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});


app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
