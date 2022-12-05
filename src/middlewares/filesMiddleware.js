const path = require("path");
const { v4: uuidv4 } = require("uuid");
const Jimp = require("jimp");
const fs = require("fs/promises");

const FILE_DOWNLOAD_DIR = "./public/avatars";
const AVATAR_ROUTE = "http://localhost:3000/api/avatars";

const fileExtension = (name) => {
  const [, extension] = name.split(".");
  return extension;
};

const nameMaker = (originalName) => {
  return `${uuidv4()}.${fileExtension(originalName)}`;
};

const downloadPath = path.resolve(`${FILE_DOWNLOAD_DIR}`);

const pathCombine = (name) => {
  const fileName = nameMaker(name);
  const avatarUrl = path.join(`${AVATAR_ROUTE}`, `${fileName}`);
  const newPath = path.join(`${downloadPath}`, `${fileName}`);
  return [newPath, avatarUrl];
};

const deleteOldAvatar = async (user) => {
  if (!user.avatarUrl) return null;
  if (user.avatarUrl.slice(0, 18) === "//www.gravatar.com") return null;
  const newPath = "public" + user.avatarUrl.slice(24);
  await fs.unlink(`${newPath}`, (error) => {
    if (error) throw new Error();
  });
};

const pictureConverter = (oldPath, newPath) => {
  Jimp.read(oldPath)
    .then((avatar) => {
      return avatar.resize(250, 250).write(newPath);
    })
    .catch((error) => console.error(error));

  fs.unlink(`${oldPath}`, (error) => {
    if (error) throw new Error();
  });
};

const imageHandler = (req, res, next) => {
  const { path: oldPath, originalname } = req.file;
  const [newPath, avatarUrl] = pathCombine(originalname);
  pictureConverter(oldPath, newPath);
  req.file.path = avatarUrl;
  next();
};

module.exports = {
  downloadPath,
  deleteOldAvatar,
  imageHandler,
};
