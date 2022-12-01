const express = require("express");

const usersRouter = express.Router();
const {
  registerNewUser,
  loginUser,
  logoutUser,
  updateSubscription,
} = require("../../models/usersController");
const { authMiddleware } = require("../../middlewares/authMiddleware");

usersRouter.post("/register", async (req, res, next) => {
  const newUser = await registerNewUser(req.body);
  res.json(newUser);
});

usersRouter.post("/login", async (req, res, next) => {
  const response = await loginUser(req.body);
  res.json(response);
});

usersRouter.post("/logout", authMiddleware, async (req, res, next) => {
  const { _id: userId } = req.user;
  const response = await logoutUser(userId);
  res.json(response);
});

usersRouter.post("/current", authMiddleware, async (req, res, next) => {
  res.json({
    data: { email: req.user.email, subscription: req.user.subscription },
  });
});

usersRouter.patch("/", authMiddleware, async (req, res, next) => {
  const { _id: userId } = req.user;
  const { subscription } = req.body;
  const response = await updateSubscription(userId, { subscription });
  res.json(response);
});

module.exports = usersRouter;
