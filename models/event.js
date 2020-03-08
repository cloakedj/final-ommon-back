let mongoose = require('mongoose');

// Event Schema
let eventSchema = mongoose.Schema({
  event:{
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
  date:{
    type: String,
    required: true
  },
  venue:{
    type: String,
    required: true
  },
  attenders:{
    type: [],
    required: false
  },
  status:{
    type: String,
    required: true
  },
  cover:{
    type:String
  },
  datenow:{
    type: Date,
    default: Date.now()
  },
  tags:{
    type: [],
    required: false
  },
  time:{
    type: String,
    required: false
  },
  interested : {
    type: [],
    default: 0
  },
  imgurl:{
    type: String,
    required: false
  }
});

let Event = module.exports = mongoose.model('Event', eventSchema);
