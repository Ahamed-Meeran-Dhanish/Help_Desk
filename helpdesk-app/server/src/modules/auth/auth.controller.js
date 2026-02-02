import * as authService from './auth.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req, res, next) => {
    try {
        const user = await authService.register(req.body);
        const token = user.getSignedJwtToken();

        res.status(201).json(new ApiResponse(201, { token, user }, 'User registered successfully'));
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await authService.login(email, password);
        const token = user.getSignedJwtToken();

        const options = {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            httpOnly: true,
        };

        res
            .status(200)
            .cookie('token', token, options)
            .json(new ApiResponse(200, { token, user }, 'User logged in successfully'));
    } catch (error) {
        next(error);
    }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
    try {
        const user = req.user;
        res.status(200).json(new ApiResponse(200, user, 'User data retrieved'));
    } catch (error) {
        next(error);
    }
};
