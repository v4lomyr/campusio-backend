const mongoose = require('mongoose');

const MentorImageSchema = mongoose.Schema({
  image_url: String,
});

module.exports = mongoose.model('mentor_image', MentorImageSchema);
