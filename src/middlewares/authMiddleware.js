const jwt = require("jsonwebtoken");
const secret = process.env.SECRET;
const User = require("../schemas/usersSchema");

const authMiddleware = async (req, res, next) => {
  try {
    const [, token] = await req.headers.authorization.split(" ");
    if (!token) {
      throw new Error();
    }
    const requestedUser = await jwt.decode(token, secret);
    const existedUser = await User.findOne({ email: requestedUser.email });

    if (!existedUser) {
      throw new Error();
    }

    if (existedUser.token !== token) {
      throw new Error();
    }

    req.user = existedUser;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "Unauthorized",
      code: 401,
      message: "Not authorized",
    });
  }
};

module.exports = { authMiddleware };
