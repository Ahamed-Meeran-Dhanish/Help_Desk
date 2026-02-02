import User from '../users/user.model.js';
import { ApiError } from '../../utils/apiResponse.js';

export const register = async (userData) => {
    const { name, email, password, role } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, 'User already exists');
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role: role || 'user',
    });

    return user;
};

export const login = async (email, password) => {
    // Validate email & password
    if (!email || !password) {
        throw new ApiError(400, 'Please provide an email and password');
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new ApiError(401, 'Invalid credentials');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        throw new ApiError(401, 'Invalid credentials');
    }

    return user;
};
