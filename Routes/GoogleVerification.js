module.exports = function isLoggedIn(req, res, next) {
  req.user ? next() : res.status(400).send({ message: 'login gagal' });
};
