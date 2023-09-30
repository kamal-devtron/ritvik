const express = require('express');
const sheetsRouter = express();
sheetsRouter.use(express.json());
const sheetsController = require('../controllers/sheets.controller');
const tokenMiddleware = require('../middlewares/token.middleware');
const passport = require('passport');
const session = require('express-session');
sheetsRouter.use(session({
	secret: 'keyboard cat',
	// resave: true,
	// saveUninitialized: true,
	// cookie: { secure: true }
}));
sheetsRouter.use(passport.initialize());
sheetsRouter.use(passport.session());


sheetsRouter.get('/auth',passport.authenticate('google',
	{ scope: ['profile', 'email','https://www.googleapis.com/auth/spreadsheets'] },
));
sheetsRouter.get('/auth/callback', passport.authenticate('google', {
	successRedirect:'/leetsheet/add-question'
}));

sheetsRouter.get('/add-question',tokenMiddleware.isUser, sheetsController.addQuestion);



module.exports = sheetsRouter;