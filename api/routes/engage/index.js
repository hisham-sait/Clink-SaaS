const express = require('express');
const router = express.Router();

// Import sub-routes
const formsRouter = require('./forms');
const surveysRouter = require('./surveys');
const dataRouter = require('./data');
const categoriesRouter = require('./categories');
const pagesRouter = require('./pages');
const analyticsRouter = require('./analytics');
const publicRouter = require('./public');
const resolverRouter = require('./resolver');

// Mount sub-routes
router.use('/forms', formsRouter);
router.use('/surveys', surveysRouter);
router.use('/data', dataRouter);
router.use('/categories', categoriesRouter);
router.use('/pages', pagesRouter);
router.use('/analytics', analyticsRouter);
router.use('/public', publicRouter);
router.use('/resolver', resolverRouter);

module.exports = router;
