const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    default: '',
  },
  nomor_telepon: {
    type: String,
    default: '',
  },
  asal_sekolah: {
    type: String,
    default: '',
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  recovery_token: {
    type: String,
    default: '',
  },
});

module.exports = mongoose.model('Users', userSchema);
