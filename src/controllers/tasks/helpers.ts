import { CallbackButton, Extra, Markup } from "telegraf";
import { ExtraEditMessage, InlineKeyboardMarkup } from "telegraf/typings/telegram-types";
import { ContextMessage } from "../../bot";
import asyncWrapper from "../../helpers/asyncWrapper";
import { saveToSession, SessionType } from "../../helpers/sessions";
import { UserModel } from "../../models";
import { TaskDocument } from "../../models/Task";
import { UserDocument } from "../../models/User";

export function getTasksButtons(tasks: TaskDocument[]): ExtraEditMessage {
  return Extra.HTML().markup(
    (m: Markup): InlineKeyboardMarkup =>
      m.inlineKeyboard(
        tasks.map((item: TaskDocument): CallbackButton[] => [
          m.callbackButton(
            `${item.title} ${item.date} - ${item.time}`,
            JSON.stringify({ a: "task", p: item._id }),
            false
          )
        ]),
        {}
      )
  );
}

export const getTasks: (ctx: ContextMessage, isUpdated?: boolean) => Promise<TaskDocument[]> = asyncWrapper(
  async (ctx: ContextMessage, isUpdated: boolean = false): Promise<TaskDocument[]> => {
    if (ctx.from === undefined) {
      throw new Error("ctx.from isn't defined");
    }

    if (ctx.session[SessionType.TASKS] && !isUpdated) {
      return ctx.session[SessionType.TASKS];
    }

    const user: UserDocument | null = await UserModel.findOne({
      _id: String(ctx.from.id)
    });
    const tasks: TaskDocument[] = user!.tasks;

    saveToSession(ctx, SessionType.TASKS, tasks);

    return tasks;
  }
);

export function getEditTaskButtons(ctx: ContextMessage): ExtraEditMessage {
  return Extra.HTML().markup(
    (m: Markup): Markup =>
      m.inlineKeyboard(
        [
          m.callbackButton(ctx.i18n.t("scenes.tasks.edit_task_back"), JSON.stringify({ a: "edit_task_back" }), false),
          m.callbackButton(
            ctx.i18n.t("scenes.tasks.edit_task_remove"),
            JSON.stringify({ a: "edit_task_remove" }),
            false
          )
        ],
        {}
      )
  );
}
