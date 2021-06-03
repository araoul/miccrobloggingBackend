import { Types as mongooseTypes } from 'mongoose';
import { Request , Response, NextFunction } from 'express';
import L from '../../../common/logger';
import * as HttpStatus from 'http-status-codes';
import * as errors from '../../../common/errors';
import User, { IUserModel} from '../../models/User';
import passport from 'passport';
import mongoose from '../../../common/mongoose';

export class UserController {
    async getAllUsers(req: any, res: Response, next: NextFunction) {
      try {
        L.info('Fecth All users');
            const users = await User
            .find()
            .lean()
            .exec() as IUserModel[];
            if (!users) { return res.sendStatus(HttpStatus.UNAUTHORIZED); }
            return res.status(HttpStatus.OK).json(users);
        }
        catch (err) {
            return next(err);
          } 
    }

  //Get Connected User
    async getUser(req: any, res: Response, next: NextFunction) {
      try {
        L.info(`fetch example with id ${req.payload.id}`);
        await User
          .findOne({ _id: req.payload.id })
          .lean()
          .then((user: IUserModel) => {
            if (!user) { return res.status(HttpStatus.NOT_FOUND); }
            return res.status(HttpStatus.OK).json({ user: user.toAuthJSON() });
          });
            
        }
        catch(err) {return next(err); }
    }

    async creatUser(req: any, res: Response, next: NextFunction) {
      try {
        L.info(`create example with user ${req.body.user}`);
            const user = new User();
            user.username = req.body.user.username;
            user.email = req.body.user.email;
            user.setPassword(req.body.user.password);
        await user
          .save()
          .then((user: IUserModel) => {
            return res.status(HttpStatus.CREATED).json({user : user.toAuthJSON()});
          }); 
          }
          catch (err) {
            return next(err);
          }
    }

    async patchUser(req: any, res: Response, next: NextFunction) {
      try {
        L.info(`update user with id ${req.payload.id} with data ${req.body.user}`);
        const user = await User
          .findOneAndUpdate({ _id: req.payload.id }, { $set: req.body }, { new: true })
          .lean()
          .then((user: IUserModel) => {
            if (!user) { return res.status(HttpStatus.NOT_FOUND); }
            // only update fields that were actually passed...
            if(typeof req.body.user.username !== 'undefined'){
              user.username = req.body.user.username;
            }
            if(typeof req.body.user.email !== 'undefined'){
              user.email = req.body.user.email;
            }
            if(typeof req.body.user.bio !== 'undefined'){
              user.bio = req.body.user.bio;
            }
            if(typeof req.body.user.image !== 'undefined'){
              user.image = req.body.user.image;
            }
            if(typeof req.body.user.password !== 'undefined'){
              user.setPassword(req.body.user.password);
                }
            return user.save().then(() => {
              return res.status(HttpStatus.OK).json({ user: user.toAuthJSON() });
            });
            
                  });
        }
        catch (err) {
          return next(err);
        }
    }
    
    async logIn(req: any, res: Response, next: NextFunction) {
        try {
          L.info(`login user with email ${req.body.user.email}`);
            if(!req.body.user.email){
                return res.status(HttpStatus.BAD_REQUEST).json({errors: {email: "can't be blank"}});
              }
            
              if(!req.body.user.password){
                return res.status(HttpStatus.BAD_REQUEST).json({errors: {password: "can't be blank"}});
              }
              
           await User.findOne({ email: req.body.user.email }).then((user: any) => {
            if (!user || !user.validPassword(req.body.user.password)) {
              return res.status(HttpStatus.BAD_REQUEST).json({ errors: { 'email or password': 'is invalid' } });
            }
            if (user) {
              user.token = user.generateJWT();
        
              return res.status(HttpStatus.OK).json({ user: user.toAuthJSON() });
            } else {
              return res.status(HttpStatus.NOT_FOUND).json({ info: "User not found" });
            }
          });  

        }
        catch (err) {
          return next(err);
        }
        
  }

}

export default new UserController();