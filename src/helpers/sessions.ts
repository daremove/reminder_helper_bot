import { ContextMessage } from "../bot";
import { TaskDocument } from "../models/Task";

export enum SessionType {
  TASKS = "tasks",
  TASK_TITLE = "task_title",
  TASK_DATE = "task_date",
  TASK_TIME = "task_time",
  EDIT_TASK = "edit_task"
}

export type Sessions = {
  [SessionType.TASKS]: TaskDocument[];
  [SessionType.TASK_TITLE]: string;
  [SessionType.TASK_DATE]: string;
  [SessionType.TASK_TIME]: string;
  [SessionType.EDIT_TASK]: TaskDocument;
};

export function saveToSession(ctx: ContextMessage, type: SessionType, data: any): void {
  ctx.session[type] = data;
}

export function deleteFromSession(ctx: ContextMessage, ...types: SessionType[]): void {
  for (const type of types) {
    delete ctx.session[type];
  }
}
