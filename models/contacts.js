const Joi = require("joi");
const {
  apiListContacts,
  apiGetContactById,
  apiAddContact,
  apiUpdateContact,
  apiUpdateStatusContact,
  apiRemoveContact,
} = require("../services/apiService");

const schema = Joi.object({
  name: Joi.string().min(2).max(40).required(),
  email: Joi.string().email({
    minDomainSegments: 2,
  }),
  phone: Joi.string()
    .min(7)
    .max(20)
    .pattern(/^[0-9]+$/),
});

const listContacts = async () => {
  try {
    const contactList = await apiListContacts();
    return { status: "OK", code: "200", data: contactList };
  } catch (error) {
    return { status: "ERROR", response: error.message };
  }
};

const getContactById = async (contactId) => {
  try {
    const contact = await apiGetContactById(contactId);
    if (!contact) {
      throw new Error("Not found");
    }
    return { status: "success", code: "200", data: contact };
  } catch (error) {
    return { status: "ERROR", code: "404", message: error.message };
  }
};

const addContact = async (body) => {
  try {
    const { email, phone } = body;

    if (!email && !phone) {
      throw new Error("Missing required field");
    }

    const validationResult = schema.validate(body);
    if (validationResult.error) {
      throw new Error(validationResult.error);
    }

    const newContact = await apiAddContact(body);
    return { status: "created", code: "201", data: newContact };
  } catch (error) {
    return { status: "ERROR", code: "400", message: error.message };
  }
};

const updateContact = async (contactId, body) => {
  try {
    if (!Object.keys(body).length) {
      throw new Error("Missing fields");
    }
    const validationResult = schema.validate(body);
    if (validationResult.error) {
      throw new Error(validationResult.error);
    }
    const contactToUpdate = await apiUpdateContact(contactId, body);
    if (!contactToUpdate) {
      return { status: "ERROR", code: "404", message: "Not found" };
    }
    return { status: "OK", code: "200", data: contactToUpdate };
  } catch (error) {
    return { status: "ERROR", code: "400", message: error.message };
  }
};

const updateStatusContact = async (contactId, body) => {
  try {
    if (!Object.keys(body).length) {
      throw new Error("Missing field favorite");
    }
    const statusContactToUpdate = await apiUpdateStatusContact(contactId, body);

    if (!statusContactToUpdate) {
      return { status: "ERROR", code: "404", message: "Not found" };
    }
    const updatedContact = await apiGetContactById(contactId);
    return { status: "OK", code: "200", data: updatedContact };
  } catch (error) {
    return { status: "ERROR", code: "400", message: error.message };
  }
};

const removeContact = async (contactId) => {
  try {
    await apiRemoveContact(contactId);
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
