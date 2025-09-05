import { createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../../services/API";
import toast from 'react-hot-toast';


export const userLogin = createAsyncThunk(
    'auth/login',
    async ({role, email, password}, {rejectWithValue}) => {
        try {
            const {data} = await API.post('/auth/login',{role,email,password})
            if(data.success){
                localStorage.setItem('token', data.token);
                toast.success(data.message)
            }
            return data;
        } catch (error) {
            if(error.response && error.response.data.message){
                return rejectWithValue(error.response.data.message)
            }else{
                return rejectWithValue(error.message)
            }
        }
    }
);

export const userRegister = createAsyncThunk(
    'auth/register',
    async ({
        name,
        role,
        email,
        password,
        organisationName,
        hospitalName,
        website,
        address,
        phone,
        age,
        gender,
        weight,
        bloodGroup}, {rejectWithValue}) => {
            try{
                const {data}=await API.post('/auth/register',{
                    name,
                    role,
                    email,
                    password,
                    organisationName,
                    hospitalName,
                    website,
                    address,
                    phone,
                    age,
                    gender,
                    weight,
                    bloodGroup
                })
                
                if(data.success){
                    toast.success(data.message);
                    window.location.replace('/login');
                    return data;
                }else{
                    toast.error(data.message,{position:"top-left"});
                    return rejectWithValue(data.message);
                }

            }catch(error){
                if(error.response && error.response.data.message){
                    toast.error(error.response.data.message)
                    return rejectWithValue(error.response.data.message)
                }else{
                    toast.error(error.response.data.message)
                    return rejectWithValue(error.message)
                }
            }
    }
)

export const getCurrentUser = createAsyncThunk(
    'auth/getCurrentUser',
    async(_, {rejectWithValue})=>{
        try{
            const res = await API.get('/auth/current-user');
            if(res?.data?.success){
                return res?.data;
            }else{
                return rejectWithValue('Failed to get user data');
            }
        }catch(error){
            if(error.response && error.response.data.message){
                toast.error(error.response.data.message)
                return rejectWithValue(error.response.data.message)
            }else{
                toast.error('Failed to get user data')
                return rejectWithValue(error.message)
            }
        }
    }
)
