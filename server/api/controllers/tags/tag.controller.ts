import {  Response, NextFunction } from 'express';
import L from '../../../common/logger';
import { Article} from '../../models/Article';


// Get All Tags
export class TagController {
    async getAllTags(req: any, res: Response, next: NextFunction) {
    try {
        L.info('Get All Tags');
        Article.find().distinct('tagList').then((tags: any) =>{
            return res.json({tags: tags});
          }).catch(next);
    } catch (err) {
        return next(err);
    }
}
}

export default new TagController();