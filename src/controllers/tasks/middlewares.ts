import { ContextMessage } from "../../bot";
import asyncWrapper from "../../helpers/asyncWrapper";
import { saveToSession, SessionType } from "../../helpers/sessions";
import { TaskDocument } from "../../models/Task";
import { Action } from "../../types/actions";
import { getTasks } from "./helpers";

export const exposeTask: () => Promise<void> = asyncWrapper(
  async (ctx: ContextMessage, next: () => void): Promise<void> => {
    const tasks: TaskDocument[] = await getTasks(ctx);

    if (tasks.length === 0) {
      throw new Error("Tasks aren't defined in expose task");
    }

    const action: Action = JSON.parse(ctx.callbackQuery.data);
    const task: TaskDocument | undefined = tasks.find(
      (taskItem: TaskDocument): boolean => taskItem._id.toString() === action.p
    );

    if (!task) {
      throw new Error("Task isn't defined in expose task");
    }

    saveToSession(ctx, SessionType.EDIT_TASK, task);

    return next();
  }
);
