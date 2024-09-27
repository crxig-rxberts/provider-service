const { documentClient, TABLE_NAME } = require('../config/dynamodb');
const logger = require('../utils/logger');
const { NotFoundError } = require('../middleware/errors');
const { v4: uuidv4 } = require('uuid');


class ProviderService {
  async createProvider(providerData) {
    const providerServices = providerData.services.map(service => ({
      ...service,
      id: uuidv4()
    }));

    const params = {
      TableName: TABLE_NAME,
      Item: {
        userSub: providerData.userSub,
        providerName: providerData.providerName,
        category: providerData.category,
        availability: providerData.availability,
        timeSlotLength: providerData.timeSlotLength,
        services: providerServices,
        searchId: providerData.searchId,
        providerImage: providerData.providerImage
      }
    };

    try {
      await documentClient.put(params).promise();
      return params.Item;
    } catch (error) {
      logger.error('Error creating provider', {error});
      throw error;
    }
  }

  async getProvider(userSub) {
    const params = {
      TableName: TABLE_NAME,
      Key: { userSub }
    };

    try {
      const result = await documentClient.get(params).promise();
      if (!result.Item) {
        throw new NotFoundError('Provider not found');
      }
      return result.Item;
    } catch (error) {
      logger.error('Error getting provider', { error, userSub });
      throw error;
    }
  }

  async updateProvider(userSub, providerData) {
    const params = {
      TableName: TABLE_NAME,
      Key: { userSub },
      UpdateExpression: 'set providerName = :pn, category = :c, availability = :a, timeSlotLength = :tsl, services = :s, providerImage = :i',
      ExpressionAttributeValues: {
        ':pn': providerData.providerName,
        ':c': providerData.category,
        ':a': providerData.availability,
        ':tsl': providerData.timeSlotLength,
        ':s': providerData.services,
        ':i': providerData.providerImage
      },
      ReturnValues: 'ALL_NEW'
    };

    try {
      const result = await documentClient.update(params).promise();
      return result.Attributes;
    } catch (error) {
      logger.error('Error updating provider', { error, userSub });
      throw error;
    }
  }

  async deleteProvider(userSub) {
    const params = {
      TableName: TABLE_NAME,
      Key: { userSub }
    };

    try {
      await documentClient.delete(params).promise();
    } catch (error) {
      logger.error('Error deleting provider', { error, userSub });
      throw error;
    }
  }
}

module.exports = new ProviderService();
