export interface AccountClass {
    email: string;
    classes: [Class];
}

export interface Class {
    className: string;
    sessionNumber: string;
}

export interface OfficeHour {
    id: number;
    facultyName: string;
    day: 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday - Saturday: 0 - 6
    startTime: string;
    endTime: string;
    initialDate: string;
    terminalDate: string;
    courseDepartment: string;
    courseNumber: number;
}

export interface StudentOfficeHour {
    studenEmail: string;
    officeHour: [OfficeHour];
}
