const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  issue_title: {
    type: String, required: true
  },
  issue_text: {
    type: String, required: true
  },
  created_by: {
    type: String, 
    required: true
  },
  assigned_to: {
    type: String
  },
  status_text: {
    type: String
  },
  created_on: {
    type: Date, 
    required: true
  },
  updated_on: {
    type: Date, 
    required: true
  },
  open: {
    type: Boolean, 
    default: true,
  },
  projectName: {
    type: String, 
    required: true 
  }
});

module.exports = mongoose.model('issue', issueSchema);