import mongoose, { Schema, Document, Date} from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import crypto from 'crypto';
import { secret } from '../../common/env';
const jwt = require('jsonwebtoken');



export interface IUserModel extends Document {
    username: string;
    email: string;
    bio: string,
    image: string,
    favorites: [{ articleId: string }];
    following: [{ userId: string }];
    hash: string;
    salt: string;
    createdAt: Date;
    updatedAt: Date;
    validPassword(password: any);
    setPassword(password: any);
    generateJWT();
    toAuthJSON();
    toProfileJSONFor(user: any);
    favorite(id: any); // Like An Article
    unFavorite(id: any);  // DisLike An Article
    isFavorite(id: any);
    follow(id: any);
    unFollow(id: any);
    isFollowing(id: any);
};
  
const UserSchema = new Schema<IUserModel>({
    // _id: String,
    username: { type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9]+$/, 'is invalid'], index: true },
    email: { type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true },
    bio: String,
    image: String,
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    hash: String,
    salt: String
}, { timestamps: true });

UserSchema.plugin(uniqueValidator, { message: 'is already taken.' });

UserSchema.methods.validPassword = async function(password: any) {
    const hash = (crypto as any).pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
};

UserSchema.methods.setPassword = async function(password: any) {
    this.salt = (crypto as any).randomBytes(16).toString('hex');
    this.hash  = (crypto as any).pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.generateJWT =  async function() {
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60);
    return jwt.sign({
        id: this._id,
        username: this.username,
        exp: Number(exp.getTime() / 1000),
    }, secret);
};
UserSchema.methods.toAuthJSON = async  function() {
    return {
        username: this.username,
        email: this.email,
        token: this.generateJWT(),
        bio: this.bio,
        image: this.image
    };
};
UserSchema.methods.toProfileJSONFor = async function(user: any) {
    return {
        username: user.username,
        bio: user.bio,
        image: user.image || 'https://static.productionready.io/images/smiley-cyrus.jpg',
        following: user ? user.isFollowing(user._id) : false
    };
};
UserSchema.methods.favorite = async function (id: any) {
    const _id: never = <never>id;
    if (this.favorites.indexOf(_id) === -1) {
        this.favorites.push(_id);
    }
    return this.save();
};
UserSchema.methods.unFavorite = async function (id: any) {
    const _id: never = <never>id;
    if (this.favorites.indexOf(_id) !== -1) {
        this.favorites.splice(_id, 1);
    }
    return this.save();
};
UserSchema.methods.isFavorite = async function(id: any) {
    return this.favorites.some(function (favoriteId: any) {
        return favoriteId.toString() === id.toString();
    });
};
UserSchema.methods.follow = async function (id: any) {
    const _id: never = <never>id;
    if (this.following.indexOf(_id) === -1) {
        this.following.push(_id);
    }
    return this.save();
};
UserSchema.methods.unFollow = async function (id: any) {
    const _id: never = <never>id;
    if (this.following.indexOf(_id) !== -1) {
        this.following.splice(_id, 1);
    }
    return this.save();
};
UserSchema.methods.isFollowing = async function(id: any){
    return this.following.some( (followId: any)  => {
        return followId.toString() === id.toString();
    });
};

const User = mongoose.model<IUserModel>('User', UserSchema);
export default User;