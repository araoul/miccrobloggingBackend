import mongoose, { Schema, Document, Date} from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import slug from 'slug';

import User, { IUserModel} from './User';
import { ICommentModel } from './Comment';

export interface IArticleModel extends Document {
    slug: string,
    title: string,
    description: string,
    body: string,
    favoritesCount: Number,
    comments: ICommentModel[],
    tagList: string[],
    author: IUserModel,
    createdAt: Date,
    updatedAt: Date,
    slugify: () => void,
    updateFavoriteCount: () => Promise<IArticleModel>,
    toJSONFor:(user: any) => object,
};

var ArticleSchema = new Schema<IArticleModel>({
 // _id: String,
  slug: {type: String, lowercase: true, unique: true},
  title: String,
  description: String,
  body: String,
  favoritesCount: {type: Number, default: 0},
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  tagList: [{ type: String }],
  author: { type: Schema.Types.ObjectId, ref: 'User' }
}, {timestamps: true});

ArticleSchema.plugin(uniqueValidator, {message: 'is already taken'});


ArticleSchema.pre('validate', function(this: any, next: any) {
  if(!this.slug)  {
    this.slugify();
  }
  next();
});

ArticleSchema.methods.slugify = function() {
  this.slug = slug(this.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
};

ArticleSchema.methods.updateFavoriteCount = function() {
  var article = this;

  return User.count({favorites: {$in: [article._id]}}).then(function(count: any){
    article.favoritesCount = count;

    return article.save();
  });
};

ArticleSchema.methods.toJSONFor = function(user: any){
  return {
    slug: this.slug,
    title: this.title,
    description: this.description,
    body: this.body,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    tagList: this.tagList,
    favorited: user ? user.isFavorite(this._id) : false,
    favoritesCount: this.favoritesCount,
    author: this.author.toProfileJSONFor(user)
  };
};

export const Article = mongoose.model<IArticleModel>('Article', ArticleSchema);
