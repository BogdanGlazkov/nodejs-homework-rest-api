const Contacts = require("./schema");

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
  return Contacts.findByIdAndUpdate({ _id: contactId }, body, { new: true });
};
const apiUpdateStatusContact = (contactId, body) => {
  return Contacts.findByIdAndUpdate({ _id: contactId }, body);
};

const apiRemoveContact = (contactId) => {
  return Contacts.findByIdAndRemove({ _id: contactId });
};

module.exports = {
  apiListContacts,
  apiGetContactById,
  apiAddContact,
  apiUpdateContact,
  apiUpdateStatusContact,
  apiRemoveContact,
};
