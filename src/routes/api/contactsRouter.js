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
  const contacts = await listContacts(req);
  res.json(contacts);
});

contactsRouter.get("/:contactId", async (req, res, next) => {
  const { _id: owner } = req.user;
  const { contactId } = req.params;
  const contactToFind = await getContactById(contactId, owner);
  res.json(contactToFind);
});

contactsRouter.post("/", async (req, res, next) => {
  const { _id: owner } = req.user;
  const newContact = await addContact(req.body, owner);
  res.json(newContact);
});

contactsRouter.put("/:contactId", async (req, res, next) => {
  const { _id: owner } = req.user;
  const response = await updateContact(req.params.contactId, req.body, owner);
  res.json(response);
});

contactsRouter.patch("/:contactId/favorite", async (req, res, next) => {
  const { _id: owner } = req.user;
  const response = await updateStatusContact(
    req.params.contactId,
    req.body,
    owner
  );
  res.json(response);
});

contactsRouter.delete("/:contactId", async (req, res, next) => {
  const { _id: owner } = req.user;
  const response = await removeContact(req.params.contactId, owner);
  res.json(response);
});

module.exports = contactsRouter;
