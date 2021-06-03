import express from 'express';
import { auth } from '../../services/auth.service';
import ArticleController from './article.controller';
export default express.Router()
    .param('article', ArticleController.PreloadArticle)
    .param('comment', ArticleController.PreloadComment)
    .get('/articles', auth.optional, ArticleController.getAllArticles)
    .get('/articles/feed', auth.required, ArticleController.getUserArticle)
    .post('/articles', auth.required, ArticleController.creatArticles)
    .get('/articles/:article', auth.optional, ArticleController.getArticle)
    .put('/articles/:article', auth.required, ArticleController.updateArticle)
    .delete('/articles/:article', auth.required, ArticleController.deleteArticle)
    .post('/articles/:article/favorite', auth.required, ArticleController.favoriteArticle)
    .delete('/articles/:article/favorite', auth.required, ArticleController.unFavoriteArticle)
    .get('/articles/:article/comments', auth.optional, ArticleController.getArticleComments)
    .post('/articles/:article/comments', auth.required, ArticleController.createComment)
    .delete('/articles/:article/comments/:comment', auth.required, ArticleController.deleteComment)
