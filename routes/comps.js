const express = require('express');
const router = express.Router();

// Competition Model
let Comp = require('../models/comp');
// User Model
let User = require('../models/user');
const upload = require('./upload');
const Timeline = require('./timeline');

//All Competitions
router.get('/all', ensureAuthenticated, function(req, res){
  Comp.find({}, function(err, comps){
    if(err){
      console.log(err);
    } else {
      res.status(200).send({
        comps: comps
      });
    }
  });
});

// Add Route
router.get('/add', ensureAuthenticated, function(req, res){
  res.render('add_comp', {
    title:'Add Competition'
  });
});

// Get Attenders
router.get('/attend/:id', ensureAuthenticated, function(req, res){
  Comp.findByIdAndUpdate(req.params.id, 
    { $addToSet: { participants:req.user._id }} , {
    new: true },(err,doc)=>{
      if (err) throw err;
      User.findById(req.user._id,(err,doc)=>{
        if(err) throw err;
        doc.eventsId.id = req.params.id;
        doc.eventsId.type = "competition";
        doc.save();
      });
      Timeline.addTimelineEvent(
        doc._id,
        req.user._id,
        `You Have Successfully Signed Up For A Competition with the name ${doc.comp}`,
        "All The Best!",
        1
      )
      console.log('Attender Added:', req.user._id);
      res.status(200).send({message:"Congratulations! You have successfully signed up for a competition."})
    });
});

// Add Submit POST Route
router.post('/add',ensureAuthenticated, upload.single('cover'),ensureAuthenticated,function(req, res){
    let comp = new Comp();
    comp.comp = req.body.comp;
    comp.organiser = req.user._id;
    comp.info = req.body.info;
    comp.date = req.body.date;
    comp.venue = req.body.venue;
    comp.status = req.body.status;
    comp.time = req.body.time;
    //comp.participants = req.body.participants.split('\n');
    comp.tags = req.body.tags.split(',');
    comp.sponsored = req.body.sponsored;  
    comp.cover = "http://localhost:3000/images/"+req.file.filename;

    comp.save(function(err,doc){
      if(err){
        console.log(err);
        return;
      } else {
        Timeline.addTimelineEvent(
          doc._id,
          req.user._id,
          `You Have Successfully Added A Competition with the name ${comp.comp}`,
          "Congratulations",
          5
        )
        req.flash('success','comp Added');
        res.status(200).send({message :"New Competition Added Successfully"});
      }
    });
});

// Load Edit Form
router.get('/edit/:id', ensureAuthenticated, function(req, res){
  Comp.findById(req.params.id, function(err, comp){
    if(comp.organiser != req.user._id){
      req.flash('danger', 'Not Authorized');
      return res.redirect('/');
    }
    res.render('edit_comp', {
      title:'Edit comp',
      comp:comp
    });
  });
});

// Update Submit POST Route
router.post('/edit/:id',ensureAuthenticated, function(req, res){
  let comp = {};
  comp.comp = req.body.comp;
  comp.info = req.body.info;
  comp.date = req.body.date;
  comp.venue = req.body.venue;
  comp.status = req.body.status;
  comp.time = req.body.time;
  comp.tags = req.body.tags.split(',');
  let user = User.findById(comp.organiser);
  let query = {_id:req.params.id}

  Comp.update(query, comp, function(err){
    if(err){
      console.log(err);
      return;
    } else {
      req.flash('success', 'comp Updated');
      res.redirect('/');
    }
  });
});

// Delete comp
router.delete('/:id',ensureAuthenticated, function(req, res){
  if(!req.user._id){
    res.status(500).send();
  }

  let query = {_id:req.params.id}

  Comp.findById(req.params.id, function(err, comp){
    if(comp.organiser != req.user._id){
      res.status(500).send();
    } else {
      Comp.remove(query, function(err){
        if(err){
          console.log(err);
        }
        res.send('Success');
      });
    }
  });
});
//get Sponsored Competition
router.get('/sponsored',ensureAuthenticated,(req,res)=>{
  var sponsoredComps = [];
  Comp.find({sponsored : true},(err,comp)=>{
    if(err) throw err;
    comp.forEach(elem =>{
      sponsoredComps.push(elem.toObject());
    });
    let randComp = sponsoredComps[Math.floor(Math.random() * sponsoredComps.length)];
    res.status(200).send({sponsoredcomp : randComp});
  });

});
// Get Single comp
router.get('/:id',ensureAuthenticated, function(req, res){
  Comp.findById(req.params.id, function(err, comp){
    User.findById(comp.organiser, function(err, user){
      res.status(200).send({comp : comp,organizer:user})
    });                                                                                          
  });
});

// Access Control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    res.status(401).send("Please Login To Access These Resources!");
  }
}

module.exports = router;
