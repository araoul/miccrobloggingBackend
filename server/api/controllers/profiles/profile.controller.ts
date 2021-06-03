import { Types as mongooseTypes } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import L from '../../../common/logger';
import * as HttpStatus from 'http-status-codes';
import * as errors from '../../../common/errors';
import User, { IUserModel} from '../../models/User';

export class ProfileController {
  // Preload user profile on routes with ':username'
  async PreloadUserProfile(req: any, res: Response, next: NextFunction, username: any) {
    try {
      L.info('Preload an User By username');
      User.findOne({username: username}).lean().then((user: IUserModel)=>{
        if (!user) { return res.sendStatus(HttpStatus.NOT_FOUND); }
    
        req.profile = user;
    
        return next();
      });
    }
    catch(err){ return next(err);}
    }
    
  async getUserProfile(req: any, res: Response, next: NextFunction) {
    try {
      L.info('Get an User Profile');
      if (req.payload) {
        User.findById(req.payload.id).then((user: IUserModel) =>{
          if(!user){ return res.json({profile: req.profile.toProfileJSONFor(false)}); }
    
          return res.json({profile: req.profile.toProfileJSONFor(user)});
        });
      } else {
        return res.json({profile: req.profile.toProfileJSONFor(false)});
      }
    } catch (err) {return next(err)
      
    }
  }
  
  async followUserByUsername(req: any, res: Response, next: NextFunction) {
    try {
      L.info('Follow an User By username');
      const profileId = req.profile._id;

      User.findById(req.payload.id).then((user: IUserModel) =>{
        if (!user) { return res.sendStatus(HttpStatus.UNAUTHORIZED); }
    
        return user.follow(profileId).then(() =>{
          return res.json({profile: req.profile.toProfileJSONFor(user)});
        });
      }).catch(next);
    } catch (err) { return next(err)
      
    }
  }

  async unFollowUserByUsername(req: any, res: Response, next: NextFunction) {
    try {
      L.info('Unfollow an User By username');
      const profileId = req.profile._id;

  User.findById(req.payload.id).then((user: IUserModel) =>{
    if (!user) { return res.sendStatus(401); }

    return user.unFollow(profileId).then(() =>{
      return res.json({profile: req.profile.toProfileJSONFor(user)});
    });
  }).catch(next);
    } catch (err) {
      return next(err);
      
    }
}


  
}

export default new ProfileController();