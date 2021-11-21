const router = require('express').Router();
const UserModel = require('../Models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const passport = require('passport');
const googleVerify = require('./GoogleVerification');
require('./GoogleStrategyConfig');

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
    await user.save();
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
  res.send({ token: token });
});

router.post('/forgetpassword', async (req, res) => {
  const user = await UserModel.findOne({ email: req.body.email });
  const url = req.body.url;

  if (!user) return res.status(400).send({ message: 'Email belum terdaftar' });

  const recoveryToken = jwt.sign(
    {
      password: user.password,
      url: url,
    },
    process.env.TOKEN_SECRET
  );

  await user.updateOne({ recovery_token: recoveryToken });

  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'campusio.autoemail@gmail.com',
      pass: 'campusioadmin',
    },
  });

  transport
    .sendMail({
      from: '"Campusio Admin" <campusio.autoemail@gmail.com>',
      to: req.body.email,
      subject: 'Password Recovery',
      html:
        '<p>klik link di bawah untuk mereset password akun anda</p><p>http://campusio.herokuapp.com/auth/recovery/' +
        recoveryToken +
        '</p>',
    })
    .then((info) => {
      res.send({ info });
    })
    .catch(console.error);
});

router.get('/recovery/:token', async (req, res) => {
  const user = await UserModel.findOne({ recovery_token: req.params.token });

  if (!user) {
    return res
      .statusCode(400)
      .send({ message: 'token expired atau tidak ada' });
  }

  const token = jwt.decode(req.params.token, { complete: true });
  res.redirect(token.payload.url + req.params.token);
});

router.put('/resetpass/:token', async (req, res) => {
  const user = await UserModel.findOne({ recovery_token: req.params.token });

  if (!user) {
    return res
      .statusCode(400)
      .send({ message: 'token expired atau tidak ada' });
  }

  const newHashPassword = await bcrypt.hash(req.body.password, 10);
  user.password = newHashPassword;
  user.recovery_token = '';
  await user.save();
  return res.send({ message: 'ganti password berhasil' });
});

router.get(
  '/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: '/auth/googleAuthSuccess',
    failureRedirect: '/auth/googleAuthFailure',
  })
);

router.get('/googleAuthSuccess', googleVerify, async (req, res) => {
  const existedUser = await UserModel.findOne({ email: req.user.email });
  const url = req.query.url;

  if (!existedUser) {
    console.log('not found');
    const randomPassword = (Math.random() + 1).toString(36).substring(7);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);

    const newUser = new UserModel({
      nama: req.user.displayName,
      email: req.user.email,
      nomor_telepon: '0',
      asal_sekolah: '',
      password: hashedPassword,
    });
    try {
      await newUser.save();
      const findUser = await UserModel.findOne({ email: req.user.email });
      const token = jwt.sign(
        {
          nama: findUser.nama,
          _id: findUser._id,
        },
        process.env.TOKEN_SECRET
      );
      res.redirect(url + token);
    } catch (err) {
      return res.status(400).send(err);
    }
  }

  const token = jwt.sign(
    {
      nama: existedUser.nama,
      _id: existedUser._id,
    },
    process.env.TOKEN_SECRET
  );
  res.redirect(url + token);
});

router.get('/googleAuthFailure', (req, res) => {
  res
    .statusCode(400)
    .send({ message: 'terjadi kesalahan, silahkan coba lagi' });
});

module.exports = router;
