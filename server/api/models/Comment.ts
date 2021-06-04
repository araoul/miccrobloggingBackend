import mongoose, { Schema, Document, Date } from 'mongoose';

import { IUserModel } from './User';
import { IArticleModel } from './Article'

export interface ICommentModel extends Document {
        body: string,
        author: IUserModel,
        article: IArticleModel;
        createdAt: Date,
        updatedAt: Date,
        toJSONFor:  (user: any) => object
}

var CommentSchema = new Schema<ICommentModel>({
 // _id: String,
  body: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' }
}, {timestamps: true});

// Requires population of author
CommentSchema.methods.toJSONFor = function(user: any){
  return {
    id: this._id,
    body: this.body,
    createdAt: this.createdAt,
    author: this.author.toProfileJSONFor(user)
  };
};

export const Comment = mongoose.model<ICommentModel>('Comment', CommentSchema);
