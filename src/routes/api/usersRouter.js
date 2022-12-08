const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  registerNewUser,
  loginUser,
  logoutUser,
  updateSubscription,
  avatarUpload,
  verifyNewUser,
} = require("../../models/usersController");
const { authMiddleware } = require("../../middlewares/authMiddleware");
const { imageHandler } = require("../../middlewares/filesMiddleware");

const FILE_DIR = path.resolve("./tmp");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, FILE_DIR);
  },
  filename: (req, file, cb) => {
    const [filename, extension] = file.originalname.split(".");
    cb(null, `${filename}.${extension}`);
  },
});
const uploadMiddleware = multer({ storage });

const usersRouter = express.Router();

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

usersRouter.patch(
  "/avatars",
  authMiddleware,
  uploadMiddleware.single("avatar"),
  imageHandler,
  async (req, res, next) => {
    const { _id: userId } = req.user;
    const { path: avatarUrl } = req.file;
    const response = await avatarUpload(avatarUrl, userId);
    res.json(response);
  }
);

usersRouter.get("/verify/:verificationToken", async (req, res, next) => {
  const { verificationToken } = req.params;
  const response = await verifyNewUser(verificationToken);
  res.json(response);
});

module.exports = usersRouter;
