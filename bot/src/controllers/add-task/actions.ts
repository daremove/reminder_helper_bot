import { ContextMessage } from "../../bot";
import asyncWrapper from "../../helpers/asyncWrapper";
import { deleteFromSession, SessionType } from "../../helpers/sessions";
import { TaskModel, UserModel } from "../../models";
import { TaskDocument } from "../../models/Task";
import { TimeoutMessageType } from "../../workers/timeout/timeout.types";
import timeoutWorker from "../../workers/timeout/timeout.worker";

export const removeTaskAction: () => Promise<void> = asyncWrapper(
  async (ctx: ContextMessage): Promise<void> => {
    deleteFromSession(ctx, SessionType.TASK_TITLE, SessionType.TASK_DATE, SessionType.TASK_TIME);

    await ctx.editMessageText(ctx.i18n.t("scenes.add_task.continue"));
    await ctx.answerCbQuery();
  }
);

export const acceptTaskAction: () => Promise<void> = asyncWrapper(
  async (ctx: ContextMessage): Promise<void> => {
    if (
      !ctx.session[SessionType.TASK_TITLE] ||
      !ctx.session[SessionType.TASK_DATE] ||
      !ctx.session[SessionType.TASK_TIME] ||
      !ctx.from!.id
    ) {
      throw new Error("Task data isn't defined");
    }

    const title: string = ctx.session[SessionType.TASK_TITLE];
    const date: string = ctx.session[SessionType.TASK_DATE];
    const time: string = ctx.session[SessionType.TASK_TIME];

    const task: TaskDocument = new TaskModel({
      title,
      date,
      time
    });
    await task.save();

    await UserModel.findOneAndUpdate(
      {
        _id: String(ctx.from!.id)
      },
      {
        $addToSet: { tasks: task._id }
      },
      {
        new: true
      }
    );

    deleteFromSession(ctx, SessionType.TASK_TITLE, SessionType.TASK_DATE, SessionType.TASK_TIME);

    timeoutWorker.postMessage(
      JSON.stringify({
        type: TimeoutMessageType.SET_TIMER,
        payload: {
          userId: ctx.from!.id,
          taskId: task._id,
          date: `${date}-${time}`
        }
      })
    );
    await ctx.editMessageText(`${ctx.i18n.t("scenes.add_task.success")}${title} <i><b>${date} - ${time}</b></i>`, {
      parse_mode: "HTML"
    });
    await ctx.reply(ctx.i18n.t("scenes.add_task.success_continue"));
    await ctx.answerCbQuery();
  }
);
