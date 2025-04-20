const express = require('express');
const router = express.Router();

// Import sub-routes
const formsRouter = require('./forms');
const surveysRouter = require('./surveys');
const dataRouter = require('./data');

// Mount sub-routes
router.use('/forms', formsRouter);
router.use('/surveys', surveysRouter);
router.use('/data', dataRouter);

module.exports = router;
