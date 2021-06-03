import { Application } from 'express';
import articlesRouter from './api/controllers/articles/article.router';
import usersRouter from './api/controllers/users/user.router';
import tagsRouter from './api/controllers/articles/article.router';
import profilesRouter from './api/controllers/articles/article.router';
export default function routes(app: Application): void {
  app.use('/api', usersRouter);
  app.use('/api', articlesRouter);
  app.use('/api', profilesRouter);
  app.use('/api', tagsRouter);
};

 