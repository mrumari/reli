import { BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED, OK } from "http-status-codes";
import bcryptjs from 'bcryptjs';
import userService from "../../services/user.service";
import UserModel from "../../models/user.model";
import { devConfig } from '../../config/config.js';
import { getJWTToken, getEncryptedPassword } from '../../libraries/util';
import { makeApiResponce } from '../../libraries/responce';
import request from "request";
import { Console } from "console";
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
export default {
    async signup(req, res){
        try{
            // VALIDATE THE REQUEST
            const {error, value} = userService.validateSignupSchema(req.body);
            if(error && error.details){
                let result = makeApiResponce(error.message, 0, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }

            const existingUser = await UserModel.findOne({ email: req.body.email });
            if (existingUser) {
                let result = makeApiResponce('Email is Already Exsit', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            const user = new UserModel();
            if (req.files) {
                for (var i = 0; i < req.files.length; i++) {
                  if (req.files[i].fieldname == "profileImage") {
                    user.profileImage =
                      `${devConfig.getImagesPath.userImage}/` + req.files[i].filename;
                  }
                  if (req.files[i].fieldname == "profilePic") {
                    user.profilePic =
                      `${devConfig.getImagesPath.userImage}/` + req.files[i].filename;
                  }
                }
              }
            user.email = req.body.email;
            user.name = req.body.name;
            user.gender = req.body.gender;
            user.country = req.body.country;
            user.city = req.body.city;
            user.state = req.body.state;
            user.skills = req.body.skills;
            user.dateOfbirth = req.body.dateOfbirth;
            const hash = await getEncryptedPassword(req.body.password);
            user.password = hash;
            await user.save();
            let userResponce = {
                name: user.name,
                email: user.email,
            }
            let result = makeApiResponce('User Created Successfully', 1, OK, userResponce);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
},
async login(req, res){
    // console.log("bilal login api");
    return false
        try{
            // VALIDATE THE REQUEST
            const {error, value} = userService.validateLoginSchema(req.body);
            if(error && error.details){
                let result = makeApiResponce(error.message, 0, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            // FETCH THE USER
            const userQuery = { email: req.body.email };
            let user =  await UserModel.findOne(userQuery);
            if(!user){
                let result = makeApiResponce('Invalid Email and Passowrd', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            const matched = await bcryptjs.compare(req.body.password, user.password)
            if(!matched){
                let result = makeApiResponce('invalid Credential', 1, BAD_REQUEST)
                return res.status(BAD_REQUEST).json(result);
            }
            const token = await getJWTToken({id: user._id});
            let userResponce;
                 userResponce = {
                    user_id : user._id,
                    name: user.name,
                    email: user.email,
                    profileImage: user.profileImage,
                    profilePic: user.profilePic,
                    skills: user.skills,
                    country: user.country,
                    state: user.state,
                    city: user.city,
                    token: token
                }
            let result = makeApiResponce('LoggedIn Successfully', 1, OK, userResponce);
            return res.json(result);

        }catch(err){
            console.log(err);
            let result = makeApiResponce('INTERNAL_SERVER_ERROR', 0, INTERNAL_SERVER_ERROR);
            return res.status(INTERNAL_SERVER_ERROR).json(result)
        }
    },
    async test(req, res){
        return res.json(req.currentUser);
},
async logout(req, res){
        // req.logOut(); // remove the session and remove req.currentUser;
         req.logout();
         req.session.destroy();
        return res.json({ success: true });
        // Get rid of the session token. Then call `logout`; it does no harm.
        // req.logout();
        // req.session.destroy(function (err) {
        //     if (err) { return next(err); }
        //     // The response should indicate that the user is no longer authenticated.
        //     return res.send({ authenticated: req.isAuthenticated() });
        // });
    },

};