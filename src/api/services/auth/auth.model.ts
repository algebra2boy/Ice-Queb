export interface User {
    email: string;
    password: string;
    isTeacher: boolean;
}

export interface RegisterUser {
    email: string;
    token: string;
    status: string;
    isTeacher: boolean;
}

export interface ResetUser {
    email: string;
    oldPassword: string;
    newPassword: string;
    isTeacher: boolean;
}
