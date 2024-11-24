const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class Contact {
  static async findExistingContacts(data) {
    return prisma.contact.findMany({
      where: {
        OR: [
          { email: data.email || undefined },
          { phoneNumber: data.phoneNumber || undefined }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  static async createPrimaryContact(data) {
    return prisma.contact.create({
      data: {
        email: data.email || null,
        phoneNumber: data.phoneNumber || null,
        linkPrecedence: 'primary'
      }
    });
  }

  static async updateToPrimary(id) {
    return prisma.contact.update({
      where: { id },
      data: { linkPrecedence: 'primary' }
    });
  }
  //update to secondary contact from primary contact
  static async updateToSecondary(id, linkedId) {
    return prisma.contact.update({
      where: { id },
      data: { linkPrecedence:'secondary', linkedId }
    });
  }


  static async createSecondaryContact(data, linkedId) {
    return prisma.contact.create({
      data: {
        email: data.email || null,
        phoneNumber: data.phoneNumber || null,
        linkedId,
        linkPrecedence: 'secondary'
      }
    });
  }

//find all the contact that related to the primary contact either itself it is primer or secondary
  static async findRelatedContacts(primaryId) {
    return prisma.contact.findMany({
      where: {
        OR: [
          { id: primaryId },
          { linkedId: primaryId }
        ]
      }
    });
  }
  static async findById(contactId) {
    return prisma.contact.findUnique({
      where: { id: contactId }
    });
  }

}

module.exports = { Contact };

