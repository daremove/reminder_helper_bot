import Timeout = NodeJS.Timeout;

export enum TimeoutMessageType {
  SET_TIMER = "SET_TIMER",
  DELETE_TIMER = "DELETE_TIMER",
  TIMER_SUCCESS = "TIMER_SUCCESS",
  TIMER_ERROR = "TIMER_ERROR"
}

export interface TimeoutMessageInPayload {
  userId: string;
  date: string;
  taskId: string;
}

export interface TimeoutMessageOutPayload {
  userId: string;
  taskId: string;
}

export interface TimeoutMessage {
  type: TimeoutMessageType;
  payload: TimeoutMessageInPayload | TimeoutMessageOutPayload | Error;
}

export interface TimersDates {
  [taskIds: string]: Timeout;
}

export interface Timers {
  [userIds: string]: TimersDates;
}
