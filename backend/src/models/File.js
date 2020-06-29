const mongoose = require('mongoose');

const File = new mongoose.Schema({
  title: {
    type: String,
	  required: true
  },
  path: {
    type: String,
	  required: true
  }
}, {
  timestamps: true,
	toObject: {
	  virtuals: true
  },
  // Anexar virtuals
  toJSON: {
    virtuals: true
  },
});

// Rota virtual póstuma ao envio do arquivo
File.virtual('url').get(function () {
  const url = 'http://localhost:3333'
  return `${url}/files/${encodeURIComponent(this.path)}`;
});

module.exports = mongoose.model('File', File);