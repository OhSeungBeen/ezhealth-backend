// user
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { Schema } = mongoose;
const jwt = require('jsonwebtoken');

const UserSchema = new Schema({
  username: { type: String, required: true },
  hashedPassword: { type: String, required: true },
});

UserSchema.methods.setPassword = async function (password) {
  const hash = await bcrypt.hash(password, 10);
  this.hashedPassword = hash;
};

UserSchema.methods.checkPassword = async function (password) {
  const reuslt = await bcrypt.compare(password, this.hashedPassword);
  return reuslt;
};

UserSchema.methods.generateToken = function () {
  const token = jwt.sign(
    {
      _id: this.id,
      username: this.username,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );
  return token;
};

// static
UserSchema.statics.findByUsername = function (username) {
  return this.findOne({ username });
};

// serialize
UserSchema.methods.serialize = function () {
  const data = this.toJSON();
  delete data.hashedPassword;
  return data;
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
