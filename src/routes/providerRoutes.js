const express = require('express');
const providerController = require('../controller/providerController');
const validateProvider = require('../schemas/providerSchema');
const authFilter = require('../../src/middleware/authFilter');

const router = express.Router();

// No Token Verification:
router.post('/', validateProvider, providerController.createProvider);

// Token Verification Enabled:
router.get('/:userSub', authFilter, providerController.getProvider);
router.put('/:userSub', authFilter, validateProvider, providerController.updateProvider);
router.delete('/:userSub', authFilter, providerController.deleteProvider);

module.exports = router;
