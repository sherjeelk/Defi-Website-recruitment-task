const HttpException = require('../utils/HttpException.utils');
const UserModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const auth = (...roles) => {
    return async function (req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            const bearer = 'Bearer ';

            console.log('Authorization header:', authHeader);

            if (!authHeader || !authHeader.startsWith(bearer)) {
                console.log('Access denied. No credentials sent!');
                res.status(401).send({ response: false, message: 'Access denied. No credentials sent!', data: null });
                return;
            }

            const token = authHeader.replace(bearer, '');
            const secretKey = process.env.SECRET_JWT || "";

            // Verify Token
            console.log('Verifying token:', token);
            const decoded = jwt.verify(token, secretKey);
            console.log('Decoded token:', decoded);

            const user = await UserModel.findOne({ id: decoded.user_id });
            console.log('User from database:', user);

            if (!user) {
                console.log('Authentication failed!');
                res.status(401).send({ response: false, message: 'Authentication failed!', data: null });
                return;
            }

            // Check if the current user is the owner user
            const ownerAuthorized = req.params.id == user.id;
            console.log('Owner authorized:', ownerAuthorized);

            // If the current user is not the owner and
            // if the user role doesn't have the permission to do this action.
            // The user will get this error
            if (!ownerAuthorized && roles.length && !roles.includes(user.role)) {
                console.log('Unauthorized access!');
                res.status(403).send({ response: false, message: 'Unauthorized', data: null });
                return;
            }

            // If the user has permissions
            req.currentUser = user;
            next();

        } catch (e) {
            console.error('Authorization error:', e);
            e.status = 401;
            next(e);
        }
    }
}

module.exports = auth;
