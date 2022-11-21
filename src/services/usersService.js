const User = require("../schemas/usersSchema");

const apiFindUserByEmail = async (email) => {
  const userExist = await User.findOne({ email });
  return userExist;
};

const apiRegisterNewUser = async (body) => {
  const { email, password, subscription } = body;
  const newUser = new User({ email, subscription });
  newUser.setPassword(password);
  await newUser.save();
  return { email, subscription: newUser.subscription };
};

const apiLoginUser = (body) => {
  // const { email, password } = body;
  // return Contacts.findByIdAndRemove(contactId);
};

module.exports = {
  apiFindUserByEmail,
  apiRegisterNewUser,
  apiLoginUser,
};
