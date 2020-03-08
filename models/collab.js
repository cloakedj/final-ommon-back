let mongoose = require('mongoose');

// Competition Schema
let collabSchema = mongoose.Schema({
  collab:{
    type: String,
    required: true
  },
  organiser:{
    type: String,
    required: true
  },
  info:{
    type: String,
    required: true
  },
  datenow:{
    type: Date,
    default: Date.now()
  },
  collaborators:[{
    type: String,
    required: true
  }],
  status:{
    type: String,
    required: true
  },
  tags:{
    type: [],
    required: true
  }
});

let collab = module.exports = mongoose.model('Collab', collabSchema);
