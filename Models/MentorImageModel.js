const mongoose = require('mongoose');

const MentorImageSchema = new mongoose.Schema({
  image_url: {
    type: String,
    required: true,
  },
  image_name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('mentor_images', MentorImageSchema);
