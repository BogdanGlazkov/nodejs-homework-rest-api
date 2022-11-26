const Joi = require("joi");
const {
  apiFindUserByEmail,
  apiRegisterNewUser,
  apiLoginUser,
  apiValidatePassword,
  apiUpdateUser,
  apiLogoutUser,
  apiGetCurrentUser,
} = require("../services/usersService");

const schema = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
    })
    .required(),
  password: Joi.string().min(6).max(30).required(),
});

const registerNewUser = async (body) => {
  try {
    const { email } = body;
    const userExists = await apiFindUserByEmail(email);
    if (userExists) {
      return {
        status: "Conflict",
        code: "209",
        message: "Email in use",
      };
    }

    const validationResult = schema.validate(body);
    if (validationResult.error) {
      throw new Error(validationResult.error);
    }

    const newUser = await apiRegisterNewUser(body);
    return {
      status: "Created",
      code: "201",
      user: newUser,
    };
  } catch (error) {
    return { status: "Bad Request", code: "400", message: error.message };
  }
};

const loginUser = async (body) => {
  try {
    const validationResult = schema.validate(body);
    if (validationResult.error) {
      throw new Error(validationResult.error);
    }

    const { email, password } = body;
    const user = await apiFindUserByEmail(email);
    const isPasswordValid = await apiValidatePassword(email, password);
    if (!user || !isPasswordValid) {
      return {
        status: "Unauthorized",
        code: "401",
        message: "Email or password is wrong",
      };
    }

    const token = await apiLoginUser(body);
    const updatedUser = await apiUpdateUser(user._id, token);
    return {
      status: "OK",
      code: "200",
      token,
      user: { email, subscription: updatedUser.subscription },
    };
  } catch (error) {
    return { status: "Bad Request", code: "400", message: error.message };
  }
};

const logoutUser = async (userId) => {
  try {
    await apiLogoutUser(userId);
    return { status: "No content", code: "204" };
  } catch (error) {
    return { status: "Unauthorized", code: "401", message: "Not authorized" };
  }
};

const getCurrentUser = async (userId) => {
  try {
    const currentUser = await apiGetCurrentUser(userId);
    return { status: "OK", code: "200", currentUser };
  } catch (error) {
    return { status: "Unauthorized", code: "401", message: "Not authorized" };
  }
};

module.exports = {
  registerNewUser,
  loginUser,
  logoutUser,
  getCurrentUser,
};
