const jwt = require("jsonwebtoken");
const secret = process.env.SECRET;
const User = require("../schemas/usersSchema");

const apiFindUserByEmail = async (email) => {
  const user = await User.findOne({ email });
  return user;
};

const apiRegisterNewUser = async (body) => {
  const { email, password, subscription } = body;
  const newUser = new User({ email, subscription });
  newUser.setPassword(password);
  await newUser.save();
  return { email, subscription: newUser.subscription };
};

const apiLoginUser = async (body) => {
  const token = jwt.sign(body, secret, { expiresIn: "2h" });
  return token;
};

const apiValidatePassword = async (email, password) => {
  const user = await apiFindUserByEmail(email);
  if (!user) {
    return null;
  }
  const isPasswordValid = await user.validPassword(password);
  return isPasswordValid;
};

const apiUpdateUser = async (id, token) => {
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { $set: { token } },
    { returnDocument: "after" }
  );
  return updatedUser;
};

const apiLogoutUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    return null;
  }
  await User.findByIdAndUpdate(userId, { $set: { token: null } });
};

const apiGetCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    return null;
  }
  const { email, subscription } = user;
  return { email, subscription };
};

module.exports = {
  apiFindUserByEmail,
  apiRegisterNewUser,
  apiLoginUser,
  apiValidatePassword,
  apiUpdateUser,
  apiLogoutUser,
  apiGetCurrentUser,
};
