const jwt = require("jsonwebtoken");
const secret = process.env.SECRET;
const User = require("../schemas/usersSchema");

const dbFindUserByEmail = async (email) => {
  const user = await User.findOne({ email });
  return user;
};

const dbRegisterNewUser = async (body) => {
  const { email, password, subscription } = body;
  const newUser = new User({ email, subscription });
  newUser.setPassword(password);
  await newUser.save();
  return { email, subscription: newUser.subscription };
};

const dbLoginUser = async (body) => {
  const token = jwt.sign(body, secret, { expiresIn: "2h" });
  return token;
};

const dbValidatePassword = async (email, password) => {
  const user = await dbFindUserByEmail(email);
  if (!user) {
    return null;
  }
  const isPasswordValid = await user.validPassword(password);
  return isPasswordValid;
};

const dbUpdateUser = async (id, token) => {
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { $set: { token } },
    { returnDocument: "after" }
  );
  return updatedUser;
};

const dbLogoutUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    return null;
  }
  await User.findByIdAndUpdate(userId, { $set: { token: null } });
};

const dbGetCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    return null;
  }
  const { email, subscription } = user;
  return { email, subscription };
};

const dbUpdateSubscription = async (userId, body) => {
  const user = await User.findByIdAndUpdate(userId, body);
  if (!user) {
    return null;
  }
  const updatedUser = await User.findById(userId);
  const { email, subscription } = updatedUser;
  return { email, subscription };
};

module.exports = {
  dbFindUserByEmail,
  dbRegisterNewUser,
  dbLoginUser,
  dbValidatePassword,
  dbUpdateUser,
  dbLogoutUser,
  dbGetCurrentUser,
  dbUpdateSubscription,
};
