const mongoose = require("mongoose");
require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 3000;
const uriDb = process.env.DB_HOST;

const connection = mongoose.connect(uriDb, {
  // promiseLibrary: global.Promise,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

connection
  .then(() => {
    app.listen(PORT, function () {
      console.log("Database connection successful");
    });
  })
  .catch((error) => {
    console.log("Server not running. Error message:", error.message);
    process.exit(1);
  });
