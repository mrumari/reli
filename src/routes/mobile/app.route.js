import express from 'express';
import appController from '../../controllers/mobile/app.controller';
import passport from 'passport'; 

export const appRouter =  express.Router();

appRouter.post('/login', appController.login);
appRouter.post('/signup', appController.signup);
appRouter.post('/logout', appController.logout);
appRouter.post('/test', passport.authenticate('mobilejwt', {session: false, failureRedirect: '/failure'}),  appController.test);