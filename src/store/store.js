import { configureStore } from '@reduxjs/toolkit'
import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer } from 'redux-persist';
import { UsersSlice } from './UsersSlice';
import { KakaoSlice } from './KakaoSlice';


const persistConfig = {
  key: 'spring-backend',
  storage,
};

const persistedUserReducer = persistReducer(persistConfig, UsersSlice.reducer);
export const store = configureStore({
  reducer: {
    users: persistedUserReducer,
  }
});

export const persistor = persistStore(store);


