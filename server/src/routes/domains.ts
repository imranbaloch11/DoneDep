import express from 'express';
import { createError } from '../middleware/errorHandler';

const router = express.Router();

// Search available domains
router.post('/search', async (req, res, next) => {
  try {
    const { domain, tlds } = req.body;

    if (!domain) {
      throw createError('Domain name is required', 400);
    }

    // Mock domain search results
    const searchResults = (tlds || ['com', 'net', 'org']).map((tld: string) => ({
      domain: `${domain}.${tld}`,
      available: Math.random() > 0.5,
      price: Math.floor(Math.random() * 20) + 10,
      currency: 'USD'
    }));

    res.json({
      success: true,
      data: {
        searchTerm: domain,
        results: searchResults
      }
    });

  } catch (error) {
    next(error);
  }
});

// Register domain
router.post('/register', async (req, res, next) => {
  try {
    const { domain, registrant } = req.body;

    if (!domain || !registrant) {
      throw createError('Domain and registrant information are required', 400);
    }

    // Mock domain registration
    const orderId = `order_${Date.now()}`;

    res.json({
      success: true,
      data: {
        orderId,
        domain,
        status: 'pending',
        message: 'Domain registration initiated'
      }
    });

  } catch (error) {
    next(error);
  }
});

// Get user domains
router.get('/user-domains', async (req, res, next) => {
  try {
    // Mock user domains
    const domains = [
      {
        domain: 'example.com',
        status: 'active',
        expiryDate: '2024-12-31',
        autoRenew: true
      }
    ];

    res.json({
      success: true,
      data: { domains }
    });

  } catch (error) {
    next(error);
  }
});

export default router;
