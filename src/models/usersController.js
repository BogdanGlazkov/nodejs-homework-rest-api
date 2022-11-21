const Joi = require("joi");
const {
  apiFindUserByEmail,
  apiRegisterNewUser,
  apiLoginUser,
  apiValidatePassword,
} = require("../services/usersService");

const schema = Joi.object({
  email: Joi.string().email({
    minDomainSegments: 2,
  }),
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
    return {
      status: "OK",
      code: "200",
      token,
      user: { email, subscription: user.subscription },
    };
  } catch (error) {
    return { status: "Bad Request", code: "400", message: error.message };
  }
};

module.exports = {
  registerNewUser,
  loginUser,
};
