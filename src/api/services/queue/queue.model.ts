export interface Queue {
    className: string;
    sessionNumber: string;
    day: string;
    startTime: string;
    studentList: StudentInQueue[];
}

export interface StudentInQueue {
    socketId: string;
    email: string;
    joinTime: Date;
    position: number;
}
