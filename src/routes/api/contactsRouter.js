const express = require("express");

const contactsRouter = express.Router();
const { authMiddleware } = require("../../middlewares/authMiddleware");
const {
  listContacts,
  getContactById,
  addContact,
  updateContact,
  updateStatusContact,
  removeContact,
} = require("../../models/contactsController");

contactsRouter.use(authMiddleware);

contactsRouter.get("/", async (req, res, next) => {
  const contacts = await listContacts();
  res.json({ ...contacts });
});

contactsRouter.get("/:contactId", async (req, res, next) => {
  const contactToFind = await getContactById(req.params.contactId);
  res.json({ ...contactToFind });
});

contactsRouter.post("/", async (req, res, next) => {
  const newContact = await addContact(req.body);
  res.json({ ...newContact });
});

contactsRouter.put("/:contactId", async (req, res, next) => {
  const response = await updateContact(req.params.contactId, req.body);
  res.json({ ...response });
});

contactsRouter.patch("/:contactId/favorite", async (req, res, next) => {
  const response = await updateStatusContact(req.params.contactId, req.body);
  res.json({ ...response });
});

contactsRouter.delete("/:contactId", async (req, res, next) => {
  const response = await removeContact(req.params.contactId);
  res.json({ ...response });
});

module.exports = contactsRouter;
