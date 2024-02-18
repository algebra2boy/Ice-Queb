export interface User {
    email: string;
    password: string;
    isTeacher: boolean;
}

export interface RegisterUser {
    email: string;
    isTeacher: boolean;
    token: string;
}
