const Contacts = require("../schemas/contactsSchema");

const apiListContacts = async (owner, { page, limit, favorite }) => {
  const skip = (page - 1) * limit;
  const contacts = await Contacts.find({ owner })
    .select({ owner: 0 })
    .skip(skip)
    .limit(limit);
  if (favorite) {
    return contacts.filter((contact) => Boolean(contact.favorite));
  }
  return contacts;
};

const apiGetContactById = async (contactId, owner) => {
  const contact = await Contacts.findById(contactId);
  if (contact.owner.toString() !== owner.toString()) {
    return null;
  }
  return contact;
};

const apiAddContact = async (body, owner) => {
  const newContact = await Contacts.create({ ...body, owner });
  return newContact;
};

const apiUpdateContact = async (contactId, body, owner) => {
  const contact = await Contacts.findById(contactId);
  if (contact.owner.toString() !== owner.toString()) {
    return null;
  }
  return Contacts.findByIdAndUpdate(contactId, body, { new: true });
};

const apiUpdateStatusContact = async (contactId, body, owner) => {
  const contact = await Contacts.findById(contactId);
  if (contact.owner.toString() !== owner.toString()) {
    return null;
  }
  const updatedContact = await Contacts.findByIdAndUpdate(contactId, body);
  return updatedContact;
};

const apiRemoveContact = async (contactId, owner) => {
  const contact = await Contacts.findById(contactId);
  if (contact.owner.toString() !== owner.toString()) {
    return null;
  }
  return Contacts.findOneAndDelete({ _id: contactId, owner });
};

module.exports = {
  apiListContacts,
  apiGetContactById,
  apiAddContact,
  apiUpdateContact,
  apiUpdateStatusContact,
  apiRemoveContact,
};
