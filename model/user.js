const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema ({
  email: {type: String, unique: true, required: true},
  password: {type: String, required: true},
  isVerified: {type: Boolean, required: true, default: false},
  fullName: {type: String, required: true},
  telephoneNumber: {type: String},
  address: {type: String},
  creditUser:{type: Boolean, required: true, default: false},
  organization: {type: String},
  avatarImage: {type: String},
  passwordResetToken: {type: String},
  passwordResetExpires: {type: Date},
  userType: {type: String},
  roles: [{type: String}],
  createDate: { type: Date, default: Date.now, required: true },
});

module.exports = mongoose.model("User", UserSchema);
