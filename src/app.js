const express = require("express");
const logger = require("morgan");
const cors = require("cors");

const contactsRouter = require("./routes/api/contactsRouter");
const usersRouter = require("./routes/api/usersRouter");
const { downloadPath } = require("./middlewares/filesMiddleware");

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/api/contacts", contactsRouter);
app.use("/api/users", usersRouter);
app.use("/api/avatars", express.static(downloadPath));

app.use((req, res) => {
  res.status(404).json({
    message: "Not found",
  });
});

app.use((err, _, res, __) => {
  res.status(500).json({ message: err.message });
});

module.exports = app;
