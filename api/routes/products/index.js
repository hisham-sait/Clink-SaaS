const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

// Import route modules
const productsRoutes = require('./products');
const categoriesRoutes = require('./categories');
const attributesRoutes = require('./attributes');
const familiesRoutes = require('./families');
const sectionsRoutes = require('./sections');
const mediaRoutes = require('./media');
const importExportRoutes = require('./import-export');
const activityRoutes = require('./activity');

// Apply auth middleware to all routes
router.use(auth);

// Mount routes
router.use('/products', productsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/attributes', attributesRoutes);
router.use('/families', familiesRoutes);
router.use('/sections', sectionsRoutes);
router.use('/media', mediaRoutes);
router.use('/import-export', importExportRoutes);
router.use('/activity', activityRoutes);

module.exports = router;
