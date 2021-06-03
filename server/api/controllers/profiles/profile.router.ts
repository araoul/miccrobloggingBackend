import express from 'express';
import { auth } from '../../services/auth.service';
import ProfileController from './profile.controller';
export default express.Router()
    .param('username', ProfileController.PreloadUserProfile)
    .get('/profiles/:username', auth.optional, ProfileController.getUserProfile)
    .post('/profiles/:username/follow', auth.required, ProfileController.followUserByUsername)
    .delete('/profiles/:username/follow', auth.required, ProfileController.unFollowUserByUsername)