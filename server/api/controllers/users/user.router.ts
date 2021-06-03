import express from 'express';
import { auth } from '../../services/auth.service';
import UserController from './user.controller';
export default express.Router()
    .post('/users/login', UserController.logIn)
    .post('/users', UserController.creatUser)
    // .get('/user', auth.required, UserController.getAllUsers)
    .get('/user', auth.required, UserController.getUser)
    .patch('/user', auth.required, UserController.patchUser)

