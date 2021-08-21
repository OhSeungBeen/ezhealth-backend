const jwt = require('jsonwebtoken');
const User = require('../models/user');

const jwtMiddleware = async (req, res, next) => {
  const token = req.signedCookies.access_token;
  console.log(token);
  if (!token) return next(); // null
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      _id: decoded._id,
      username: decoded.username,
    };
    console.log(req.user);
    // exp <= 3.5day token reissue
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp - now < 60 * 60 * 24 * 3.5) {
      const user = await User.findById(decoded._id);
      const token = user.generateToken();
      res.cookie('access_token', token, {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7days
        httpOnly: true,
        signed: true,
      });
    }
    console.log(decoded);
    return next();
  } catch (err) {
    // token verify fail
    return next();
  }
};

module.exports = jwtMiddleware;
