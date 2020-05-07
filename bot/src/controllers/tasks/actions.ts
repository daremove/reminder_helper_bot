import { ContextMessage } from "../../bot";
import asyncWrapper from "../../helpers/asyncWrapper";
import { SessionType } from "../../helpers/sessions";
import { TaskModel } from "../../models";
import { TaskDocument } from "../../models/Task";
import { TimeoutMessageType } from "../../workers/timeout/timeout.types";
import timeoutWorker from "../../workers/timeout/timeout.worker";
import { getEditTaskButtons, getTasks, getTasksButtons } from "./helpers";

export const getEditTaskMenu: () => Promise<void> = asyncWrapper(
  async (ctx: ContextMessage): Promise<void> => {
    const { date, time, title }: TaskDocument = ctx.session[SessionType.EDIT_TASK];

    await ctx.editMessageText(
      `Задача: <b>${title}</b>\nДата и время: <b><i>${date} - ${time}</i></b>`,
      getEditTaskButtons(ctx)
    );
    await ctx.answerCbQuery();
  }
);

export const getBackTasks: () => Promise<void> = asyncWrapper(
  async (ctx: ContextMessage): Promise<void> => {
    const tasks: TaskDocument[] = await getTasks(ctx);

    await ctx.editMessageText(ctx.i18n.t("scenes.tasks.list_of_tasks"), getTasksButtons(tasks));
    await ctx.answerCbQuery();
  }
);

export const removeTask: () => Promise<void> = asyncWrapper(
  async (ctx: ContextMessage): Promise<void> => {
    const task: TaskDocument = ctx.session[SessionType.EDIT_TASK];

    await TaskModel.findOneAndRemove({ _id: task._id });

    timeoutWorker.postMessage(
      JSON.stringify({
        type: TimeoutMessageType.DELETE_TIMER,
        payload: {
          userId: ctx.from!.id,
          timerId: task._id
        }
      })
    );

    const tasks: TaskDocument[] = await getTasks(ctx, true);

    await ctx.editMessageText(ctx.i18n.t("scenes.tasks.list_of_tasks"), getTasksButtons(tasks));
    await ctx.answerCbQuery();
  }
);
