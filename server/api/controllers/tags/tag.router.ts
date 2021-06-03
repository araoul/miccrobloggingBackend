import express from 'express';
import  TagController  from './tag.controller';
export default express.Router()
.get('/tags', TagController.getAllTags)