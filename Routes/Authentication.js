const router = require('express').Router();
const UserModel = require('../Models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  const emailExist = await UserModel.findOne({ email: req.body.email });
  if (emailExist)
    return res.status(400).send({ message: 'Email Sudah Digunakan' });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new UserModel({
    nama: req.body.nama,
    email: req.body.email,
    nomor_telepon: req.body.nomor_telepon,
    asal_sekolah: req.body.asal_sekolah,
    password: hashedPassword,
  });
  try {
    const savedUser = await user.save();
    res.send({ user: user._id });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post('/login', async (req, res) => {
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) return res.status(400).send({ message: 'Akun tidak ditemukan' });

  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send({ message: 'Password salah' });

  const token = jwt.sign(
    { nama: user.nama, _id: user._id },
    process.env.TOKEN_SECRET
  );
  res.header('auth-token', token).send(token);
});

module.exports = router;
