const express = require("express");

const router = express.Router();
const {
  listContacts,
  getContactById,
  addContact,
  updateContact,
  updateStatusContact,
  removeContact,
} = require("../../models/contacts");

router.get("/", async (req, res, next) => {
  const contacts = await listContacts();
  res.json({ ...contacts });
});

router.get("/:contactId", async (req, res, next) => {
  const contactToFind = await getContactById(req.params.contactId);
  res.json({ ...contactToFind });
});

router.post("/", async (req, res, next) => {
  const newContact = await addContact(req.body);
  res.json({ ...newContact });
});

router.put("/:contactId", async (req, res, next) => {
  const response = await updateContact(req.params.contactId, req.body);
  res.json({ ...response });
});

router.patch("/:contactId/favorite", async (req, res, next) => {
  const response = await updateStatusContact(req.params.contactId, req.body);
  res.json({ ...response });
});

router.delete("/:contactId", async (req, res, next) => {
  const response = await removeContact(req.params.contactId);
  res.json({ ...response });
});

module.exports = router;
