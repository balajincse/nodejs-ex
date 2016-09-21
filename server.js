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



//if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
//  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
//      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
//      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
//      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
//      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
//      mongoUser = process.env[mongoServiceName + '_USER'];

//  if (mongoHost && mongoPort && mongoDatabase) {
//    mongoURLLabel = mongoURL = 'mongodb://';
//    if (mongoUser && mongoPassword) {
//      mongoURL += mongoUser + ':' + mongoPassword + '@';
//    }
    // Provide UI label that excludes user id and pw
//    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
//    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

//  }
//}
//var db = null,
//    dbDetails = new Object();

//var initDb = function(callback) {
//  if (mongoURL == null) return;

//  var mongodb = require('mongodb');
//  if (mongodb == null) return;

//  mongodb.connect(mongoURL, function(err, conn) {
//   if (err) {
//      callback(err);
//      return;
//    }

//    db = conn;
//    dbDetails.databaseName = db.databaseName;
//    dbDetails.url = mongoURLLabel;
//    dbDetails.type = 'MongoDB';

//    console.log('Connected to MongoDB at: %s', mongoURL);
//  });
//};

//app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
//  if (!db) {
//    initDb(function(err){});
//  }
//  if (db) {
//    var col = db.collection('counts');
    // Create a document with request IP and current time of request
//    col.insert({ip: req.ip, date: Date.now()});
//    col.count(function(err, count){
//      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
//    });
//  } else {
//    res.render('index.html', { pageCountMessage : null});
//  }
//});

//app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
//  if (!db) {
//    initDb(function(err){});
//  }
//  if (db) {
//    db.collection('counts').count(function(err, count ){
//      res.send('{ pageCount: ' + count + '}');
//    });
//  } else {
//    res.send('{ pageCount: -1 }');
//  }
//});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

//initDb(function(err){
//  console.log('Error connecting to Mongo. Message:\n'+err);
//});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
