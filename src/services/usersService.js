const jwt = require("jsonwebtoken");
const bCrypt = require("bcryptjs");
require("dotenv").config();
const gravatar = require("gravatar");
const { v4: uuidv4 } = require("uuid");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const secret = process.env.SECRET;
const User = require("../schemas/usersSchema");
const { deleteOldAvatar } = require("../middlewares/filesMiddleware");

const dbFindUserByEmail = async (email) => {
  const user = await User.findOne({ email, verify: true });
  return user;
};

const dbRegisterNewUser = async (body) => {
  const { email, password, subscription } = body;
  const avatarUrl = gravatar.url(email);
  const verificationToken = uuidv4();
  const sender = process.env.SEND_EMAIL;
  const host = process.env.API_HOST;

  const msg = {
    to: sender,
    from: sender,
    subject: "Thank you for registration!",
    text: `Please confirm your email address ${host}/users/verify/${verificationToken}`,
    html: `<h2>Please, <a href="${host}/users/verify/${verificationToken}">confirm</a> your email address</h2>`,
  };
  await sgMail
    .send(msg)
    .then(() => console.log("Email sent"))
    .catch((error) => console.error(error.message));

  const newUser = new User({
    email,
    subscription,
    avatarUrl,
    verificationToken,
  });
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
  const isPasswordValid = bCrypt.compareSync(password, user.password);
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

const dbVerifyNewUser = async (verificationToken) => {
  const user = await User.findOneAndUpdate(
    { verificationToken },
    { verificationToken: null, verify: true }
  );
  if (!user) {
    return null;
  }
  return user;
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
  dbVerifyNewUser,
};
