export interface StudentInQueue {
    socketId: string;
    email: string;
    joinTime: Date;
    position: number;
}

export interface Queue {
    queueId: string;
    studentList: StudentInQueue[];
}
