import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice";

const BASE_URL = import.meta.env.VITE_BASE_URL || "https://e-learning-backend-rjwo.onrender.com/api/v1";
const USER_API = `${BASE_URL}/user/`;

const baseQueryWithAuth = fetchBaseQuery({
    baseUrl: USER_API,
    credentials: "include",
    prepareHeaders: (headers) => {
        const token = localStorage.getItem("token");
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        return headers;
    },
});

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: baseQueryWithAuth,
    endpoints: (builder) => ({
        registerUser: builder.mutation({
            query: (inputData) => ({
                url: "register",
                method: "POST",
                body: inputData,
            }),
        }),
        loginUser: builder.mutation({
            query: (inputData) => ({
                url: "login",
                method: "POST",
                body: inputData,
            }),
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                try {
                    const result = await queryFulfilled;
                    const token = result.data.token;
                    if (token) {
                        localStorage.setItem("token", token);
                        dispatch(userLoggedIn({ user: result.data.user }));
                    }
                } catch (error) {
                    console.error("Login Error:", error);
                }
            },
        }),
        logoutUser: builder.mutation({
            query: () => ({
                url: "logout",
                method: "GET",
            }),
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                try {
                    await queryFulfilled;
                    localStorage.removeItem("token");
                    dispatch(userLoggedOut());
                } catch (error) {
                    console.error("Logout Error:", error);
                }
            },
        }),
        loadUser: builder.query({
            query: () => ({
                url: "profile",
                method: "GET",
            }),
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                try {
                    const result = await queryFulfilled;
                    dispatch(userLoggedIn({ user: result.data.user }));
                } catch (error) {
                    console.error("Load User Error:", error);
                }
            },
        }),
        updateUser: builder.mutation({
            query: (formData) => ({
                url: "profile/update",
                method: "PUT",
                body: formData,
            }),
        }),
    }),
});

export const {
    useRegisterUserMutation,
    useLoginUserMutation,
    useLogoutUserMutation,
    useLoadUserQuery,
    useUpdateUserMutation,
} = authApi;
