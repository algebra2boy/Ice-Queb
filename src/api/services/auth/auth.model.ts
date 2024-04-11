export interface User {
    email: string;
    password: string;
}

export interface RegisterUser {
    email: string;
    token: string;
    status: string;
}

export interface ResetUser{
    email: string;
    oldPassword: string;
    newPassword: string;
}
