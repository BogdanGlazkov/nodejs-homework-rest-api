const express = require("express");

const usersRouter = express.Router();
const { registerNewUser, loginUser } = require("../../models/usersController");

usersRouter.post("/register", async (req, res, next) => {
  const newUser = await registerNewUser(req.body);
  res.json({ ...newUser });
});

usersRouter.post("/login", async (req, res, next) => {
  const response = await loginUser(req.body);
  res.json({ ...response });
});

module.exports = usersRouter;
