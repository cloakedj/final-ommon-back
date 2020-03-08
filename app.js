const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');
const cors = require("cors");
const morgan = require("morgan");

mongoose.connect(config.database);
let db = mongoose.connection;

// Check connection
db.once('open', function(){
  console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', function(err){
  console.log(err);
});

// Init App
const app = express();

// Bring in Models
let Event = require('./models/event');
let Comp = require('./models/comp');
let Collab = require('./models/collab');

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors({
  origin: 'http://localhost:4200',
  credentials : true
}));

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json({limit:'50mb'}));

// Set Public Folder
app.use(express.static(path.join(__dirname, '/public')));


// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie:{
    maxAge : 6000000
  }
}));

app.use(morgan('tiny'));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  console.log(req.session);
  res.locals.user = req.user || null;
  console.log("id: ",req.user._id);
  next();
});

// Route Files
let events = require('./routes/events');
let comps = require('./routes/comps');
let collabs = require('./routes/collabs');
let users = require('./routes/users');
let chat = require('./routes/chat');
app.use('/events', events);
app.use('/comps', comps);
app.use('/collabs', collabs);
app.use('/users', users);
app.use('/chat',chat);

// Home Route
app.get('/', function(req, res){
  Collab.find({}, function(err, collabs){
  Comp.find({}, function(err, comps){
  Event.find({}, function(err, events){
    if(err){
      console.log(err);
    } else {
      res.render('index', {
        title:'Events',
        events: events,
        comps: comps,
        collabs: collabs
      });
    }
  });
  });
});
});



// Start Server
app.listen(3000, function(){
  console.log('Server started on port 3000...');
});
