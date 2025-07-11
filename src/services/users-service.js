import { ApiError } from "../exceptions/api-error.js";
import { User } from "../models/user.js";
import {v4} from 'uuid'
import bcrypt from "bcrypt";

export const generateActivationToken = () => {
    return v4();
}

export const createUser = async ({id, email, password, activationToken}) => {
    const existedUser = await User.findOne({
        where: {email}
    })

    if (existedUser !== null) {
        throw ApiError.BadRequest("User already exists", {
            email: "This e-mail address is used by another user"
        });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({id, email, hashPassword, activationToken});

    return {
        id: user.id,
        email: user.email,
    }
}

export const findUserByActivationToken = (activationToken) => {
    return User.findOne({
        where: {activationToken},
        attributes: ['id', 'email']
    })
}

export const consumeActivationToken = async (user) => {
    user.activationToken = null;
    user.save()

    return user;
}

export const findActivatedUserByEmail = async (email) => {
    return await User.findOne({
    where: {email, activationToken: null},

  })
}
