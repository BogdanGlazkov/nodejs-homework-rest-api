const Joi = require("joi");
const {
  dbFindUserByEmail,
  dbRegisterNewUser,
  dbLoginUser,
  dbValidatePassword,
  dbUpdateUser,
  dbLogoutUser,
  dbUpdateSubscription,
  dbAvatarUpload,
  dbVerifyNewUser,
  dbExtraVerifyNewUser,
} = require("../services/usersService");

const schema = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
    })
    .required(),
  password: Joi.string().min(6).max(30).required(),
});

const schemaSubscription = Joi.object({
  subscription: Joi.string().valid("starter", "pro", "business").required(),
});

const registerNewUser = async (body) => {
  try {
    const { email } = body;
    const userExists = await dbFindUserByEmail(email);
    if (userExists) {
      return {
        status: "Conflict",
        code: 409,
        message: "Email in use",
      };
    }

    const validationResult = schema.validate(body);
    if (validationResult.error) {
      throw new Error(validationResult.error.message);
    }

    const newUser = await dbRegisterNewUser(body);
    return {
      status: "Created",
      code: 201,
      user: newUser,
    };
  } catch (error) {
    return { status: "Bad Request", code: 400, message: error.message };
  }
};

const loginUser = async (body) => {
  try {
    const validationResult = schema.validate(body);
    if (validationResult.error) {
      throw new Error(validationResult.error.message);
    }

    const { email, password } = body;
    const user = await dbFindUserByEmail(email);
    const isPasswordValid = await dbValidatePassword(email, password);
    if (!user || !isPasswordValid) {
      return {
        status: "Unauthorized",
        code: 401,
        message: "Email or password is wrong",
      };
    }

    const token = await dbLoginUser(body);
    const updatedUser = await dbUpdateUser(user._id, token);
    return {
      status: "OK",
      code: 200,
      token,
      user: { email, subscription: updatedUser.subscription },
    };
  } catch (error) {
    return { status: "Bad Request", code: 400, message: error.message };
  }
};

const logoutUser = async (userId) => {
  try {
    await dbLogoutUser(userId);
    return { status: "No content", code: 204 };
  } catch (error) {
    return { status: "Unauthorized", code: 401, message: "Not authorized" };
  }
};

const updateSubscription = async (userId, subscription) => {
  try {
    const validationResult = schemaSubscription.validate(subscription);
    if (validationResult.error) {
      return {
        status: "Bad Request",
        code: 400,
        message: validationResult.error.message,
      };
    }

    const user = await dbUpdateSubscription(userId, subscription);
    return { status: "OK", code: 200, user };
  } catch (error) {
    return { status: "Unauthorized", code: 401, message: "Not authorized" };
  }
};

const avatarUpload = async (avatarUrl, userId) => {
  try {
    const response = await dbAvatarUpload(avatarUrl, userId);
    return { status: "OK", code: 200, response };
  } catch (error) {
    return { status: "Unauthorized", code: 401, message: "Not authorized" };
  }
};

const verifyNewUser = async (verificationToken) => {
  try {
    const response = await dbVerifyNewUser(verificationToken);
    if (!response) {
      throw new Error();
    }
    return { status: "OK", code: 200, message: "Verification successful" };
  } catch (error) {
    return { status: "Not found", code: 404, message: "User not found" };
  }
};

const extraVerifyNewUser = async (email) => {
  try {
    if (!email) {
      throw new Error("Missing requered field email");
    }

    const user = await dbExtraVerifyNewUser(email);
    if (!user) {
      throw new Error("User not found");
    }
    if (user.verify === true) {
      throw new Error("Verification has already been passed");
    }

    return { status: "OK", code: 200, message: "Verification email sent" };
  } catch (error) {
    return {
      status: "Bad Request",
      code: 400,
      message: error.message,
    };
  }
};

module.exports = {
  registerNewUser,
  loginUser,
  logoutUser,
  updateSubscription,
  avatarUpload,
  verifyNewUser,
  extraVerifyNewUser,
};
