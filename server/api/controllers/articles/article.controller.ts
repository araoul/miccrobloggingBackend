import { Types as mongooseTypes } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import L from '../../../common/logger';
import * as HttpStatus from 'http-status-codes';
import * as errors from '../../../common/errors';
import { Article, IArticleModel } from '../../models/Article';
import User, { IUserModel} from '../../models/User';
import { Comment, ICommentModel } from '../../models/Comment';


export class ArticleController {
// Preload article objects on routes with ':article'
    async PreloadArticle(req: any, res: Response, next: NextFunction,  slug: any) {
        try {
            L.info(`Preload article with slug ${slug}`);
            await Article
                .findOne({ slug: slug })
                .populate('author')
                .lean()
                .then((article: IArticleModel) => {
                    if (!article) { throw new errors.HttpError(HttpStatus.NOT_FOUND); };
                    req.body.article = article;
                    return res.status(HttpStatus.OK).json({ article: article });
                });
            
        }
        catch(err) {return next(err); }
    }
// Preload article objects on routes with ':comment'
    async PreloadComment(req: any, res: Response, next: NextFunction, id: string) {
        try {
            L.info(`Preload article with comment_id: ${id}`);
        if (!mongooseTypes.ObjectId.isValid(id)) throw new errors.HttpError(HttpStatus.BAD_REQUEST);
             await Comment
                .findById({ _id: id })
                .lean()
                .then((comment: ICommentModel) => {
                    if (!comment) { throw new errors.HttpError(HttpStatus.NOT_FOUND); };
                    req.body.comment = comment;
                    return res.status(HttpStatus.OK).json({comment: comment});
                 });
            
        }
        catch(err) {return next(err); }
    }

    // Get all articles
    async getAllArticles(req: any, res: Response, next: NextFunction) {
        L.info('Get all articles');
        try {
            var query = {};
            var limit = 10;
            var offset = 0;
            if (typeof req.query.limit !== 'undefined') {
                limit=req.query.limit ;
            }
            if (typeof req.query.offset !== 'undefined') {
                offset= req.query.offset ;
            }
            if (typeof req.query.tag !== 'undefined') {
                (query as any).tagList = { "$in": [req.query.tag] };
            }
            
            Promise.all([
                req.query.author ? User.findOne({ username: req.query.author }) : null,
                req.query.favorited ? User.findOne({ username: req.query.favorited }) : null
            ]).then( (results: any)  =>{
                var author = results[0];
                var favoriter = results[1];
                if (author) {
                    (query as any).author = author._id;
                }
                if (favoriter) {
                    (query as any)._id = { $in: favoriter.favorites };
                }
                else if (req.query.favorited) {
                    (query as any)._id = { $in: [] };
                }
                return Promise.all([
                    Article.find(query)
                        .limit(Number(limit))
                        .skip(Number(offset))
                        .sort({ createdAt: 'desc' })
                        .populate('author')
                        .exec(),
                    Article.count(query).exec(),
                    req.payload ? User.findById(req.payload.id) : null,
                ]).then( (results: any)  =>{
                    var articles = results[0];
                    var articlesCount = results[1];
                    var user = results[2];
                    return res.json({
                        articles: articles.map( (article: any)  =>{
                            return article.toJSONFor(user);
                        }),
                        articlesCount: articlesCount
                    });
                });
            })
        }
        catch(err) { return next(err); }
    }

    // Get An User Articles
    async getUserArticle(req: any, res: Response, next: NextFunction) {
        try {
            L.info('Get Aarticles of a Connected User')
            var limit = 20;
            var offset = 0;
            if (typeof req.query.limit !== 'undefined') {
                limit = req.query.limit;
            }
            if (typeof req.query.offset !== 'undefined') {
                offset = req.query.offset;
            }
            User.findById(req.payload.id).then( (user: any) => {
                if (!user) {
                    return res.sendStatus(HttpStatus.UNAUTHORIZED);
                };
                Promise.all([
                    Article.find({ author: { $in: user.isFollowing } })
                        .limit(Number(limit))
                        .skip(Number(offset))
                        .populate('author')
                        .exec(),
                    Article.count({ author: { $in: user.isFollowing } })
                ]).then( (results: any)  =>{
                    var articles = results[0];
                    var articlesCount = results[1];
                    return res.json({
                        articles: articles.map( (article: IArticleModel) => {
                            return article.toJSONFor(user);
                        }),
                        articlesCount: articlesCount
                    });
                });
            });  
        }
        catch (err) {
            return next(err);
        }
    }

    // Creat An Article for User
    async creatArticles(req: any, res: Response, next: NextFunction) {
        try {
            L.info('Creat an article for User');
            if (!mongooseTypes.ObjectId.isValid(req.payload.id)) throw new errors.HttpError(HttpStatus.BAD_REQUEST);
            await User
                .findById(req.payload.id)
                .lean()
                .then((user: IUserModel) => {
                    if (!user) {return res.status(HttpStatus.NOT_FOUND);};
            const article = new Article(req.body.article);
            article.author = user;
            return article.save().then(() => {
                return res.status(HttpStatus.OK).json({ article: article.toJSONFor(user) });
            })
                });
            
        
    }
        catch (err) { return next(err); }
    }

    // return a article
    async getArticle(req: any, res: Response, next: NextFunction) {
        try {
            L.info('Get an article');
            if (!mongooseTypes.ObjectId.isValid(req.payload.id)) throw new errors.HttpError(HttpStatus.BAD_REQUEST);
            Promise.all([
                req.payload ? User.findById(req.payload.id) : null,
                req.article.populate('author').execPopulate()
            ]).then((results: any) => {
                var user = results[0];
                return res.json({ article: req.article.toJSONFor(user) });
            }).catch(next);
        } catch (err) {
            return next(err);
        }
    }

    // update article
    async updateArticle(req: any, res: Response, next: NextFunction) {
        try {
            L.info('Update an article');
            User.findById(req.payload.id).then( (user: IUserModel) => {
                if (req.article.author._id.toString() === req.payload.id.toString()) {
                    if (typeof req.body.article.title !== 'undefined') {
                        req.article.title = req.body.article.title;
                    }
                    if (typeof req.body.article.description !== 'undefined') {
                        req.article.description = req.body.article.description;
                    }
                    if (typeof req.body.article.body !== 'undefined') {
                        req.article.body = req.body.article.body;
                    }
                    if (typeof req.body.article.tagList !== 'undefined') {
                        req.article.tagList = req.body.article.tagList;
                    }
                    req.article.save().then( (article: IArticleModel) => {
                        return res.json({ article: article.toJSONFor(user) });
                    }).catch(next);
                }
                else {
                    return res.status(HttpStatus.FORBIDDEN);
                }
            });
        }
        catch(err) { return next(err); }
    }

// delete article
    async deleteArticle(req: any, res: Response, next: NextFunction) {
        try {
            L.info('Delete an article');
            User.findById(req.payload.id).then( (user: IUserModel) => {
                if (!user) {
                    return res.status(HttpStatus.UNAUTHORIZED);
                }
                if (req.article.author._id.toString() === req.payload.id.toString()) {
                    return req.article.remove().then( ()  => {
                        return res.status(HttpStatus.NO_CONTENT);
                    });
                }
                else {
                    return res.status(HttpStatus.FORBIDDEN);
                }
            });
        } catch (err) {
            return next(err);
        }
    }

// Favorite an article : Like An Article
    async favoriteArticle(req: any, res: Response, next: NextFunction) {
        try {
            L.info('Favorite an article: Like An Article')
            const articleId = req.article._id;
    User.findById(req.payload.id).then( (user: IUserModel)  =>{
        if (!user) {
            return res.status(HttpStatus.UNAUTHORIZED);
        }
        return user.favorite(articleId).then( () => {
            return req.article.updateFavoriteCount().then((article: IArticleModel) => {
                return res.json({ article: article.toJSONFor(user) });
            });
        });
    });
        } catch (err) {
            return next(err);
        }
    }

// Unfavorite an article : Dislike An Article
    async unFavoriteArticle(req: any, res: Response, next: NextFunction) {
        try {
            L.info('Unfavorite an article : Dislike An Article');
            const articleId = req.article._id;
            User.findById(req.payload.id).then((user: IUserModel) => {
                if (!user) {
                    return res.sendStatus(HttpStatus.UNAUTHORIZED);
                }
                return user.unFavorite(articleId).then(() => {
                    return req.article.updateFavoriteCount().then((article: IArticleModel) => {
                        return res.json({ article: article.toJSONFor(user) });
                    });
                });
            });
        }
        catch(err) { return next(err)}
    }
// return an article's comments
    async getArticleComments(req: any, res: Response, next: NextFunction) {
        try {
            L.info('Return comments of an article');
            Promise.resolve(req.payload ? User.findById(req.payload.id) : null).then((user: IUserModel)  => {
                return req.article.populate({
                    path: 'comments',
                    populate: {
                        path: 'author'
                    },
                    options: {
                        sort: {
                            createdAt: 'desc'
                        }
                    }
                }).execPopulate().then( ()  => {
                    return res.json({ comments: req.article.comments.map( (comment: ICommentModel) => {
                            return comment.toJSONFor(user);
                        }) });
                });
            });
        }catch(err) {return next(err);}
    }
// create a new comment for Aticle
    async createComment(req: any, res: Response, next: NextFunction) {
        try {
            L.info('Create a new comment for an article')
            User.findById(req.payload.id).then( (user: IUserModel)=> {
                if (!user) {
                    return res.sendStatus(HttpStatus.UNAUTHORIZED);//401
                }
                const comment = new Comment(req.body.comment);
                comment.article = req.article;
                comment.author = user;
                return comment.save().then( () => {
                    req.article.comments.push(comment);
                    return req.article.save().then( () => {
                        res.json({ comment: comment.toJSONFor(user) });
                    });
                });
            });
        } catch (err) {
            return next(err);
        }
    }
//delete a comment
    async deleteComment(req: any, res: Response, next: NextFunction) {
        try {
            L.info('Delete a comment of an Article');
            if (req.comment.author.toString() === req.payload.id.toString()) {
                req.article.comments.remove(req.comment._id);
                req.article.save()
                    .then(Comment.find({ _id: req.comment._id }).remove().exec())
                    .then( () =>{
                    res.sendStatus(HttpStatus.NO_CONTENT);//204
                });
            }
            else {
                res.sendStatus(HttpStatus.FORBIDDEN);//403
            }
        }catch(err) { return next(err)}
    }

}

export default new ArticleController();