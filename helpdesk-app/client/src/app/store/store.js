import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../modules/auth/authSlice';
import ticketReducer from '../../modules/tickets/ticketSlice';
import usersReducer from '../../modules/users/usersSlice';
import noteReducer from '../../modules/tickets/noteSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        tickets: ticketReducer,
        users: usersReducer,
        notes: noteReducer,
    },
});
