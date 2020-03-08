const express = require('express');
const router = express.Router();

// collabetition Model
let Collab = require('../models/collab');
// User Model
let User = require('../models/user');

// Add Route
router.get('/add', ensureAuthenticated, function(req, res){
  res.render('add_collab', {
    title:'Add Collaboration'
  });
});

// Add Submit POST Route
router.post('/add', function(req, res){
  req.checkBody('collab','Name is required').notEmpty();
  //req.checkBody('organiser','organiser is required').notEmpty();
  req.checkBody('info','Information is required').notEmpty();

  // Get Errors
  let errors = req.validationErrors();

  if(errors){
    res.render('add_collab', {
      title:'Add Collaboration',
      errors:errors
    });
  } else {
    let collab = new Collab();
    collab.collab = req.body.collab;
    collab.organiser = req.user._id;
    collab.info = req.body.info;
    collab.status = req.body.status;
    collab.tags = req.body.tags.split(',');

    collab.save(function(err){
      if(err){
        console.log(err);
        return;
      } else {
        req.flash('success','collab Added');
        res.redirect('/');
      }
    });
  }
});

// Load Edit Form
router.get('/edit/:id', ensureAuthenticated, function(req, res){
  Collab.findById(req.params.id, function(err, collab){
    if(collab.organiser != req.user._id){
      req.flash('danger', 'Not Authorized');
      return res.redirect('/');
    }
    res.render('edit_collab', {
      title:'Edit collab',
      collab:collab
    });
  });
});

// Update Submit POST Route
router.post('/edit/:id', function(req, res){
  let collab = {};
  collab.collab = req.body.collab;
  collab.info = req.body.info;
  collab.status = req.body.status;
  collab.tags = req.body.tags.split(',');
  let user = User.findById(collab.organiser);
  let query = {_id:req.params.id}

  Collab.update(query, collab, function(err){
    if(err){
      console.log(err);
      return;
    } else {
      req.flash('success', 'collab Updated');
      res.redirect('/');
    }
  });
});

// Delete collab
router.delete('/:id', function(req, res){
  if(!req.user._id){
    res.status(500).send();
  }

  let query = {_id:req.params.id}

  Collab.findById(req.params.data-id, function(err, collab){
    if(collab.organiser != req.user._id){
      res.status(500).send();
    } else {
      Collab.remove(query, function(err){
        if(err){
          console.log(err);
        }
        res.send('Success');
        //console.log('Hell');
      });
    }
  });
});

// Get Single collab
router.get('/:id', function(req, res){
  Collab.findById(req.params.id, function(err, collab){
    User.findById(collab.organiser, function(err, user){
      res.render('collab', {
        collab:collab,
        organiser: user.name
      });
    });
  });
});

// Access Control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
}

module.exports = router;
