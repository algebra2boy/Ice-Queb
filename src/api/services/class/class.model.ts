export interface AccountClass {
    email: string;
    classes: [Class];
}

export interface Class {
    className: string;
    sessionNumber: string;
}
