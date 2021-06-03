
const jwt = require('express-jwt');

import { secret } from '../../common/env';

const getTokenFromHeader = (req: any) =>{
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token' ||
      req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  }

  return null;
}

export const auth = {
  required: jwt({
    secret: secret,
    algorithms:['HS256'],
    userProperty: 'payload',
    getToken: getTokenFromHeader
  }),
  optional: jwt({
    secret: secret,
    algorithms:['HS256'],
    userProperty: 'payload',
    credentialsRequired: false,
    getToken: getTokenFromHeader
  })
};

