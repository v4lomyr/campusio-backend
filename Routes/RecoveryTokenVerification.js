const UserModel = require('../Models/UserModel');

module.exports = function (req, res, next) {
  const user = UserModel.findOne({ recovery_token: req.params.token });
  if (!user) {
    return res
      .statusCode(400)
      .send({ message: 'token expired atau tidak ada' });
  }
  req.user = user;
  res.redirect('/campusioedu.com/resetpass/?token=' + req.params.token);
};
