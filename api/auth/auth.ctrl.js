const Joi = require('joi');
const User = require('../../models/user');

// join
module.exports.register = async (req, res, next) => {
  // validate check
  console.log(req.body);
  const schema = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(20).required(),
    password: Joi.string().required(),
  });
  const result = schema.validate(req.body);
  if (result.error) {
    // validate error
    return res.status(400).json({ code: 400, error: result.error });
  }

  const { username, password } = req.body;
  try {
    // duplicate check
    const exists = await User.findByUsername(username);
    console.log(exists);
    if (exists) {
      // username is duplicated error
      return res
        .status(409)
        .json({ code: 409, error: 'username is duplicated' });
    }

    // save users in database
    const user = new User({
      username,
    });
    await user.setPassword(password);
    await user.save();
    // set access_token cookie
    const token = user.generateToken();
    res.cookie('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7days
      httpOnly: true,
      signed: true,
    });
    // response
    res.json(user.serialize());
  } catch (error) {
    // exeption error
    res.status(500).json({ code: 500, error: error.toString() });
  }
};

// login
module.exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    // emtpy
    return res.status(401).json({ code: 401, error: 'unauthorized' }).end();
  }
  try {
    const user = await User.findByUsername(username);

    if (!user) {
      // user dose not exist
      return res.status(401).json({ code: 401, error: 'unauthorized' });
    }
    const valid = await user.checkPassword(password);
    if (!valid) {
      // password mismatch
      return res.status(401).json({ code: 401, error: 'unauthorized' });
    }

    //set access_token cookie
    const token = user.generateToken();
    res.cookie('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7days
      httpOnly: true,
      signed: true,
    });

    res.json(user.serialize());
  } catch (error) {
    // exeption error
    res.status(500).json({ code: 500, error: error.toString() });
  }
};

// login check
module.exports.check = async (req, res, next) => {
  const user = req.user;
  if (!user) {
    // not login
    return res.status(401).json({ code: 401, error: 'unauthorized' });
  }
  res.json(user);
};

// logout
module.exports.logout = async (req, res, next) => {
  res.cookie('access_token'); // remove cookie
  res.status(204).send(); // no content
};
