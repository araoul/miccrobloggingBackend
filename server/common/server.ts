import express from 'express';
import { Application } from 'express';
import path from 'path';
import http from 'http';
import os from 'os';
import swaggerify from './swagger';
import l from './logger';
import Mongoose from './mongoose'
import cors from 'cors';
//const router= express.Router();
const app = express();
const mongoose = new Mongoose;


export default class ExpressServer {
  constructor() {
    app.use(cors());
    app.options('*', cors());
    const root = path.normalize(__dirname + '/../..');
    app.set('appPath', root + 'client');
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
  //app.use(session({ secret: process.env.SESSION_SECRET, cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));
    app.use(express.static(`${root}/public`));
    
  }
 
 router(routes: (app: Application) => void): ExpressServer {
    swaggerify(app, routes);
    return this;
  }

  listen(p: string | number = process.env.PORT): Application {
    const welcome = port => () => l.info(`up and running in ${process.env.NODE_ENV || 'development'} @: ${os.hostname() } on port: ${port}}`);
    http.createServer(app).listen(p, welcome(p));
    mongoose.init();
    return app;
  }
}


