const Contacts = require("../schemas/contactsSchema");

const apiListContacts = () => {
  return Contacts.find();
};

const apiGetContactById = (contactId) => {
  return Contacts.findOne({ _id: contactId });
};

const apiAddContact = (body) => {
  return Contacts.create(body);
};

const apiUpdateContact = (contactId, body) => {
  return Contacts.findByIdAndUpdate(contactId, body, { new: true });
};
const apiUpdateStatusContact = (contactId, body) => {
  return Contacts.findByIdAndUpdate(contactId, body);
};

const apiRemoveContact = (contactId) => {
  return Contacts.findByIdAndRemove(contactId);
};

module.exports = {
  apiListContacts,
  apiGetContactById,
  apiAddContact,
  apiUpdateContact,
  apiUpdateStatusContact,
  apiRemoveContact,
};
