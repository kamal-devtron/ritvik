const express = require('express');
const sheetsRouter = express();
sheetsRouter.use(express.json());
const sheetsController = require('../controllers/sheets.controller');
const tokenMiddleware = require('../middlewares/token.middleware');

sheetsRouter.get('/auth', sheetsController.getAuthUrl);
sheetsRouter.get('/oauth2callback', sheetsController.getToken);
sheetsRouter.get('/callToken', sheetsController.callToken);

sheetsRouter.post('/create',tokenMiddleware.tokenValidator , sheetsController.createSheet);
sheetsRouter.put('/update',tokenMiddleware.tokenValidator, sheetsController.updateSheet);



module.exports = sheetsRouter;