import mongoose, { Schema, Document } from "mongoose";

interface StudentInQueue {
    socketId: string;
    email: string;
    joinTime: Date;
    position: number;
}

export interface QueueDocument extends Document {
    className: string;
    sessionNumber: string;
    day: string;
    startTime: string;
    studentList: StudentInQueue[];
}

const StudentInQueueSchema: Schema = new Schema({
    socketId: { type: String, required: true },
    email: { type: String, required: true },
    joinTime: { type: Date, required: true },
    position: { type: Number, required: true }
});

const QueueSchema: Schema = new Schema({
    className: { type: String, required: true },
    sessionNumber: { type: String, required: true },
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    studentList: [StudentInQueueSchema]
});

const Queue = mongoose.model<QueueDocument>("Queue", QueueSchema);

export default Queue;
