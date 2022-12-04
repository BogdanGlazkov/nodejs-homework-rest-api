const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const secret = process.env.SECRET;
const User = require("../schemas/usersSchema");
const { deleteOldAvatar } = require("../middlewares/filesMiddleware");

const dbFindUserByEmail = async (email) => {
  const user = await User.findOne({ email });
  return user;
};

const dbRegisterNewUser = async (body) => {
  const { email, password, subscription } = body;
  const avatarUrl = gravatar.url(email);
  const newUser = new User({ email, subscription, avatarUrl });
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

const dbUpdateUser = async (userId, token) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
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

const dbUpdateSubscription = async (userId, body) => {
  const user = await User.findByIdAndUpdate(userId, body);
  if (!user) {
    return null;
  }
  const updatedUser = await User.findById(userId);
  const { email, subscription } = updatedUser;
  return { email, subscription };
};

const dbAvatarUpload = async (avatarUrl, userId) => {
  const user = await User.findById(userId);
  deleteOldAvatar(user);
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { avatarUrl } },
    { returnDocument: "after" }
  ).select({ avatarUrl: 1, _id: 0 });
  return updatedUser;
};

module.exports = {
  dbFindUserByEmail,
  dbRegisterNewUser,
  dbLoginUser,
  dbValidatePassword,
  dbUpdateUser,
  dbLogoutUser,
  dbUpdateSubscription,
  dbAvatarUpload,
};
