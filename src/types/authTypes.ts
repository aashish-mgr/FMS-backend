import { Request } from "express"
export interface UserDetails {
    id: string,
    userName: string,
    userEmail: string,
    userPassword: string
}

export interface AuthRequest extends Request{
    user?: UserDetails
}