const UserModel = require('../Models/UserModel');

module.exports = function (req, res, next) {
  const user = UserModel.findOne({ recovery_token: req.params.token });
  if (!user) {
    return res
      .statusCode(400)
      .send({ message: 'token expired atau tidak ada' });
  }
  res.redirect('/localhost:3000/resetpass/?token=' + req.params.token);
};
