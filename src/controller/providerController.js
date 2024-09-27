const providerService = require('../service/providerService');
const {formatResponse} = require('../utils/formatResponse');

class ProviderController {
  async createProvider(req, res, next) {
    try {
      const providerData = req.body;
      const result = await providerService.createProvider(providerData);
      res.status(201).json(formatResponse('Provider created successfully', result));
    } catch (error) {
      next(error);
    }
  }

  async getProvider(req, res, next) {
    try {
      const { userSub } = req.params;
      const result = await providerService.getProvider(userSub);
      res.json(formatResponse('Provider retrieved successfully', result));
    } catch (error) {
      next(error);
    }
  }

  async updateProvider(req, res, next) {
    try {
      const { userSub } = req.params;
      const providerData = req.body;
      const result = await providerService.updateProvider(userSub, providerData);
      res.json(formatResponse('Provider updated successfully', result));
    } catch (error) {
      next(error);
    }
  }

  async deleteProvider(req, res, next) {
    try {
      const { userSub } = req.params;
      await providerService.deleteProvider(userSub);
      res.json(formatResponse('Provider deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProviderController();
