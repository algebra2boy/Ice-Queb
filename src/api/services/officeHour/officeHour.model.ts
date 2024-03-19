export type OfficeHourId = string;

export interface StudentOfficeHourList {
    email: string;
    officeHour: [OfficeHourId];
}

export interface OfficeHour {
    id: OfficeHour;
    facultyName: string;
    day: number;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    courseDepartment: string;
    courseNumber: string;
}
