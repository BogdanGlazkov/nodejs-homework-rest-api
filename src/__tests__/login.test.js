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
    const token = jwt.sign(mReq.body, process.env.SECRET, { expiresIn: "2h" });
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

    jest.spyOn(User, "findOne").mockImplementation(async () => user);
    jest
      .spyOn(User, "findByIdAndUpdate")
      .mockImplementationOnce(async () => user);

    const response = await loginUser(mReq.body);

    expect(response.status).toEqual("OK");
    expect(response.code).toEqual("200");
    expect(response.token).toEqual(token);
    expect(response.user.email).toEqual(user.email);
    expect(response.user.subscription).toEqual(user.subscription);
  });

  it("Should return validation fields error", async () => {
    const mReq = {
      email: "",
      password: "",
    };
    const response = await loginUser(mReq);

    expect(response.status).toEqual("Bad Request");
    expect(response.code).toEqual("400");
    expect(response.message).toBeDefined();
  });

  it("Should return error when email is wrong", async () => {
    const mReq = {
      email: "1test@gmail.com",
      password: "qwertyui",
    };

    jest.spyOn(User, "findOne").mockImplementation(async () => {});
    const response = await loginUser(mReq);

    expect(response.status).toEqual("Unauthorized");
    expect(response.code).toEqual("401");
    expect(response.message).toEqual("Email or password is wrong");
  });

  it("Should return error when password is wrong", async () => {
    const mReq = {
      email: "test@gmail.com",
      password: "qwertyui",
    };
    const wrongPassword = "qwerty";

    const hashPassword = await bCrypt.hashSync(
      mReq.password,
      bCrypt.genSaltSync(6)
    );
    const user = {
      _id: "1",
      email: mReq.email,
      password: hashPassword,
      subscription: "starter",
    };

    jest.spyOn(User, "findOne").mockImplementation(async () => user);
    jest
      .spyOn(User, "findByIdAndUpdate")
      .mockImplementationOnce(async () => user);

    const response = await loginUser({ ...mReq, password: wrongPassword });

    expect(response.status).toEqual("Unauthorized");
    expect(response.code).toEqual("401");
    expect(response.message).toEqual("Email or password is wrong");
  });
});
