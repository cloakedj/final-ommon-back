let mongoose = require('mongoose');

// Competition Schema
let compSchema = mongoose.Schema({
  comp:{
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
  participants:[{
    type: String,
    required: true
  }],
  status:{
    type: String,
    required: true
  },
  cover:{
    type: String
  },
  datenow:{
    type: Date,
    default: Date.now()
  },
  tags:{
    type: [],
    required: true
  },
  time:{
    type: String,
    required: true
  },
  imgurl:{
    type: String,
    required: false
  }
});

let Comp = module.exports = mongoose.model('Comp', compSchema);
