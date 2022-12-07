const { loginUser } = require("../models/usersController");
const User = require("../schemas/usersSchema");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bCrypt = require("bcryptjs");

describe("Login test", () => {
  it("Should return token, object user with email and subscription", async () => {
    const mReq = {
      body: {
        email: "test@gmail.com",
        password: "qwertyui",
      },
    };
    const token = jwt.sign(mReq.body, process.env.SECRET);
    const hashPassword = await bCrypt.hashSync(
      mReq.body.password,
      bCrypt.genSaltSync(6)
    );
    const user = {
      _id: "1",
      email: mReq.body.email,
      password: hashPassword,
      subscription: "starter",
    };
    const mRes = {
      status: "OK",
      code: "200",
      token,
      user: { email: user.email, subscription: user.subscription },
    };

    jest.spyOn(User, "findOne").mockImplementationOnce(async () => mReq);
    jest
      .spyOn(User, "findByIdAndUpdate")
      .mockImplementationOnce(async () => user._id, token);

    expect(mRes.status).toEqual("OK");
    expect(mRes.code).toEqual("200");
    expect(mRes.token).toEqual(token);
    expect(mRes.user.email).toEqual(user.email);
    expect(mRes.user.subscription).toEqual(user.subscription);
  });

  it("Should return validation result error", async () => {
    const mReq = {
      email: "",
      password: "",
    };
    const response = await loginUser(mReq);

    expect(response.status).toEqual("Bad Request");
    expect(response.code).toEqual("400");
    expect(response.message).toBeDefined();
  });

  it("Should return error when email or password is wrong", async () => {
    const mReq = {
      email: "1test@gmail.com",
      password: "qwerty",
    };

    jest.spyOn(User, "findOne").mockImplementationOnce(async () => {});
    const response = await loginUser(mReq);

    expect(response.status).toEqual("Unauthorized");
    expect(response.code).toEqual("401");
    expect(response.message).toEqual("Email or password is wrong");
  });
});
