import * as userService from './user.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

// @desc    Create a user (Admin only)
// @route   POST /api/v1/users
// @access  Private/Admin
export const createUser = async (req, res, next) => {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json(new ApiResponse(201, user, 'User created successfully'));
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await userService.getAllUsers(req.query);
        res.status(200).json(new ApiResponse(200, users, 'Users retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin
export const getUser = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.id);
        res.status(200).json(new ApiResponse(200, user, 'User retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
export const updateUser = async (req, res, next) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body);
        res.status(200).json(new ApiResponse(200, user, 'User updated successfully'));
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
    try {
        await userService.deleteUser(req.params.id);
        res.status(200).json(new ApiResponse(200, null, 'User deleted successfully'));
    } catch (error) {
        next(error);
    }
};
