import { User } from "../models/user.js";

async function getAllUsers(req, res, next) {
    const allUsers = await User.findAll({
        attributes: ['id', 'email']
    });
    res.status(200).send(allUsers);

}

export const usersController = {
    getAllUsers,
}
