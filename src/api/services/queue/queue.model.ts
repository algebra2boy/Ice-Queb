export interface Queue {
  className: string,
  sessionNumber: string,
  day: string,
  startTime: string
}

export interface StudentInQueue {
  email: string,
  joinTime: Date
}