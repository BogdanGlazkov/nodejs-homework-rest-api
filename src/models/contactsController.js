const Joi = require("joi");
const {
  apiListContacts,
  apiGetContactById,
  apiAddContact,
  apiUpdateContact,
  apiUpdateStatusContact,
  apiRemoveContact,
} = require("../services/contactsService");

const schema = Joi.object({
  name: Joi.string().min(2).max(40).required(),
  email: Joi.string().email({
    minDomainSegments: 2,
  }),
  phone: Joi.string().min(7).max(20),
});

const listContacts = async (req) => {
  try {
    let { page = 1, limit = 20, favorite = false } = req.query;
    limit = parseInt(limit) > 20 ? 20 : limit;
    const { _id: owner } = req.user;
    const contactList = await apiListContacts(owner, { page, limit, favorite });
    return { status: "OK", code: "200", data: contactList, page, limit };
  } catch (error) {
    return { status: "ERROR", code: "400", message: "Bad request" };
  }
};

const getContactById = async (contactId, owner) => {
  try {
    const contact = await apiGetContactById(contactId, owner);
    if (!contact) {
      throw new Error("Not found");
    }
    return { status: "success", code: "200", data: contact };
  } catch (error) {
    return { status: "ERROR", code: "404", message: "Not found" };
  }
};

const addContact = async (body, owner) => {
  try {
    const { email, phone } = body;

    if (!email && !phone) {
      throw new Error("Missing required field");
    }

    const validationResult = schema.validate(body);
    if (validationResult.error) {
      throw new Error(validationResult.error);
    }

    const newContact = await apiAddContact(body, owner);
    return { status: "created", code: "201", data: newContact };
  } catch (error) {
    return { status: "ERROR", code: "400", message: "Bad request" };
  }
};

const updateContact = async (contactId, body, owner) => {
  try {
    if (!Object.keys(body).length) {
      throw new Error("Missing fields");
    }
    const validationResult = schema.validate(body);
    if (validationResult.error) {
      throw new Error(validationResult.error);
    }
    const contactToUpdate = await apiUpdateContact(contactId, body, owner);
    if (!contactToUpdate) {
      return { status: "ERROR", code: "404", message: "Not found" };
    }
    return { status: "OK", code: "200", data: contactToUpdate };
  } catch (error) {
    return { status: "ERROR", code: "400", message: "Bad request" };
  }
};

const updateStatusContact = async (contactId, body, owner) => {
  try {
    if (!Object.keys(body).length) {
      throw new Error("Missing field favorite");
    }
    const contact = await apiUpdateStatusContact(contactId, body, owner);

    if (!contact) {
      return { status: "ERROR", code: "404", message: "Not found" };
    }
    const updatedContact = await apiGetContactById(contactId, owner);
    return { status: "OK", code: "200", data: updatedContact };
  } catch (error) {
    return { status: "ERROR", code: "400", message: "Bad request" };
  }
};

const removeContact = async (contactId, owner) => {
  try {
    await apiRemoveContact(contactId, owner);
    return { status: "OK", code: "200", message: "Contact deleted" };
  } catch (error) {
    return { status: "ERROR", code: "404", message: "Not found" };
  }
};

module.exports = {
  listContacts,
  getContactById,
  addContact,
  updateContact,
  updateStatusContact,
  removeContact,
};
