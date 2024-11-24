const { Contact } = require("../models/contact");

class IdentityController {
  static async identify(req, res) {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      return res
        .status(400)
        .json({ error: "Email or phone number is required" });
    }

    try {
      // Finding  existing contacts matching email or phoneNumber
      let existingContacts = [];
      if (email && phoneNumber === "null") {
        existingContacts = await Contact.findExistingContacts({ email });
      } else if (!email && phoneNumber) {
        existingContacts = await Contact.findExistingContacts({ phoneNumber });
      } else {
        existingContacts = await Contact.findExistingContacts({
          email,
          phoneNumber,
        });
      }

      // If no existing contacts, create a new primary contact
      if (existingContacts.length === 0) {
        if (phoneNumber === "null") {
          return res
            .status(404)
            .json({ error: "No matching contact found based on email" });
        }

        if (email === "null") {
          return res
            .status(404)
            .json({ error: "No matching contact found based on phone number" });
        }

        const newContact = await Contact.createPrimaryContact({
          email,
          phoneNumber,
        });
        return res.json(IdentityController.formatResponse(newContact));
      }

      // Separate contacts into primary and secondary
      const primaryContacts = existingContacts.filter(
        (c) => c.linkPrecedence === "primary"
      );
      let secondaryContacts = existingContacts.filter(
        (c) => c.linkPrecedence === "secondary"
      );

      // Determine the earliest primary contact
      let earliestPrimaryContact;

      if (primaryContacts.length > 0) {
        earliestPrimaryContact = primaryContacts.reduce((earliest, current) => {
          return current.createdAt < earliest.createdAt ? current : earliest;
        });
      } else if (secondaryContacts.length > 0) {
        const primaryId = secondaryContacts[0].linkedId;
        earliestPrimaryContact = await Contact.findById(primaryId);
      } else {
        return res.status(400).json({ error: "No contacts found" });
      }

      // Convert other primary contacts and their secondaries to secondary
      await Promise.all(
        primaryContacts.map(async (contact) => {
          if (contact.id !== earliestPrimaryContact.id) {
            await Contact.updateToSecondary(
              contact.id,
              earliestPrimaryContact.id
            );
          }
        })
      );

      // Refresh secondary contacts after updating
      secondaryContacts = await Contact.findRelatedContacts(
        earliestPrimaryContact.id
      );

      // Handle creating new secondary contact
      if (
        (email && email !== "null" && email !== earliestPrimaryContact.email) ||
        (phoneNumber &&
          phoneNumber !== "null" &&
          phoneNumber !== earliestPrimaryContact.phoneNumber)
      ) {
        // Check across all contacts to prevent duplicates
        const allEmails = new Set([
          earliestPrimaryContact.email,
          ...secondaryContacts.map((c) => c.email),
        ]);
        const allPhoneNumbers = new Set([
          earliestPrimaryContact.phoneNumber,
          ...secondaryContacts.map((c) => c.phoneNumber),
        ]);

        if (
          (!allEmails.has(email) && email !== "null") ||
          (!allPhoneNumbers.has(phoneNumber) && phoneNumber !== "null")
        ) {
          await Contact.createSecondaryContact(
            { email, phoneNumber },
            earliestPrimaryContact.id
          );
        }
      }

      // Fetch all related contacts
      const allContacts = await Contact.findRelatedContacts(
        earliestPrimaryContact.id
      );

      // Return the formatted response
      return res.json(
        IdentityController.formatResponse(earliestPrimaryContact, allContacts)
      );
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static formatResponse(primaryContact, allContacts = []) {
    const emails = [
      ...new Set(
        [primaryContact.email, ...allContacts.map((c) => c.email)].filter(
          Boolean
        )
      ),
    ];
    const phoneNumbers = [
      ...new Set(
        [
          primaryContact.phoneNumber,
          ...allContacts.map((c) => c.phoneNumber),
        ].filter(Boolean)
      ),
    ];
    const secondaryContactIds = allContacts
      .filter((c) => c.id !== primaryContact.id)
      .map((c) => c.id);

    return {
      contact: {
        primaryContactId: primaryContact.id,
        emails,
        phoneNumbers,
        secondaryContactIds,
      },
    };
  }
}

module.exports = IdentityController;
