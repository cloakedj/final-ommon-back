const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const upload = require('./upload');
const Timeline = require('./timeline');

// Bring in User Model
let User = require('../models/user');

// Register Form
router.get('/register', function(req, res){
  res.render('register');
});

// Register Proccess
router.post('/register', upload.single('logo'),function(req, res){
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  let institution = req.body.institution;
  let course = req.body.course;
  let interests = req.body.interests.split(",");
    let newUser = new User({
      name:name,
      email:email,
      username:username,
      password:password,
      institution:institution,
      course:course,
      logo: "http://localhost:3000/images/" +req.file.filename, 
      interests:interests,
    });

    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(newUser.password, salt, function(err, hash){
        if(err){
          console.log(err);
        }
        newUser.password = hash;
        newUser.save(function(err,doc){
          if(err){
            console.log(err);
            return;
          } else {
            req.flash('success','You are now registered and can log in');
            res.status(200).send({message: "Successfully Created user"});
          }
        });
      });
    });
});

// // Login Form
// router.get('/login', function(req, res){
//   res.render('login');
// });

// Login Process
router.post('/login' ,function(req, res, next){
  passport.authenticate('local',(err,user,info)=>{
    if (err) { return next(err); }
    if (!user) { return res.status(401).send({message:"Unable To Login With Provided Credentials"}) }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      res.status(200).send({user:user});
    });
  })(req, res, next);
});

router.get('/timeline/:id',ensureAuthenticated, async function(req,res){
  let timeline = [];
  try
  {
    console.log(req.params.id);
  const user = await User.findById(req.params.id);
  user.timeline.forEach(element => {
    timeline.push(element._doc);
  });
  res.status(200).send({timeline : timeline});
  }
  catch(err){
    console.log(err);
  }
});

router.get('/add-tie/:id',ensureAuthenticated,function(req,res){
  User.findByIdAndUpdate(req.user._id, 
    { $addToSet: { tiesId:req.params.id }} , {
    new: true },async (err,doc)=>{
      const user = await User.findById(req.params.id);
      if (err) throw err;
      Timeline.addTimelineEvent(
        doc._id,
        req.user._id,
        `You Have Successfully Built A Tie With @${user.username}`,
        "Congratulations!",
        3
      )
      res.status(200).send({message:"Congratulations! You have successfully built a new tie."})
    });
});

router.get('/remove-tie/:id',ensureAuthenticated,async function(req,res){
  User.findByIdAndUpdate(req.user._id, 
    { $pull: { tiesId:req.params.id }} , {
    new: true },async (err,doc)=>{
      const user = await User.findById(req.params.id);
      if (err) throw err;
      Timeline.addTimelineEvent(
        doc._id,
        req.user._id,
        `You Have Successfully Cut The Tie With @${user.username}`,
        "Sorry To Hear!",
        0
      )
      res.status(200).send({message:"Successfully cut the tie."})
    });
});

router.get('/myEvents',ensureAuthenticated,(req,res)=>{
  User.findById(req.user._id,(err,user)=>{
    if(err) throw err;
    res.status(200).send({myevents : user.eventsId});
  });
});

router.get('/ties',ensureAuthenticated,(req,res)=>{
  User.findById(req.user._id,(err,user)=>{
    if(err) throw err;
    res.status(200).send({ties:user.tiesId})
  });
});
// logout
router.get('/logout',ensureAuthenticated, function(req, res){
  req.logout();
  res.status(200).send({message:"Logged Out Successfully!"})
});

router.get('/:id', ensureAuthenticated, (req,res)=>{
  User.findById(req.params.id,(err,user)=>{
    if (err) throw err;
    else
    res.status(200).send({user:user});
  })
});

// Access Control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    res.status(401).send({message: "Please Login To Access These Resources!"});
  }
}
module.exports = router;
