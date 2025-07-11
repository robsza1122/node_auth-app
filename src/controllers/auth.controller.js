import { User } from "../models/user.js";
import { sendActivationMail } from "../services/mail-service.js";
import { consumeActivationToken, findActivatedUserByEmail, generateActivationToken } from "../services/users-service.js";
import { ApiError } from "../exceptions/api-error.js";
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { validateEmail, validatePassword } from "../utils/validation.js";
import { createAccessToken, createRefreshToken, readRefreshToken } from "../services/jwt-service.js";
import { tokenService } from "../services/tokens-service.js";

async function register(req, res, next) {
  const { email, password } = req.body;

      const existedUser = await User.findOne({
        where: {email}
    })

    if (existedUser !== null) {
        throw ApiError.BadRequest("User already exists", {
            email: "This e-mail address is used by another user"
        });
    }

  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  if (emailError) {
    throw ApiError.BadRequest('Bad Request', {
      message: emailError,
    })
  }

  if (passwordError) {
    throw ApiError.BadRequest('Bad Request', {
      message: passwordError,
    }
    )
  }
  const activationToken = generateActivationToken();

  const userLength = await User.count()
    const id = userLength + 1;

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({id, email, password: hashPassword, activationToken}) 

    

    await sendActivationMail(email, activationToken);

    res.status(201).send({
      id: user.id,
      email: user.email,
    })
}

async function logout(req, res, next) {

  const {refreshToken} = req.cookies;

  const userData = readRefreshToken(refreshToken);

  if (userData) {
    await tokenService.remove(userData.id);
  }

  res.status(204)
  
}

async function activate(req, res, next) {
  const {activationToken} = req.params;

  const user = await User.findOne({
    where: {activationToken},
    attributes: ['id', 'email'],
  });

  if (!user) {
    throw ApiError.NotFound();
  }

  await consumeActivationToken(user);

  res.send(`User with id ${user.id} is activated`);
  
}

async function login(req, res, next) {
  const {email, password} = req.body;

  const user = await User.findOne({
    where: {email}
  })

  if (user.activationToken !== null) {
    throw ApiError.BadRequest("User is not activated", {
      email: "Please activate your account first"
    });
  }

  if (!user) {
    throw ApiError.NotFound();
  }

  if (!await bcrypt.compare(password, user.password)) {
    throw ApiError.Unauthorized();
  }

  return sendAuth(user, res);
}

async function sendAuth(user, res) {

    const accessToken = createAccessToken({id: user.id, email: user.email})

  const refreshToken = createRefreshToken({id: user.id, email: user.email});

  await tokenService.save(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24* 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.send({
    accessToken,
    user: {
      email: user.email,
    }
  })
  
}

export async function refresh(req, res, next) {
  const {refreshToken} = req.cookies;

  const userData = readRefreshToken(refreshToken);

  if (userData === null) {
    throw ApiError.Unauthorized();
  }

  const token = tokenService.getByToken(refreshToken);

  if (!token) {
    throw ApiError.Unauthorized();
  }

  const user = await findActivatedUserByEmail(userData.email);

  return sendAuth(user, res);

  
}

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
};
