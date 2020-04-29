import { BaseScene, Stage } from "telegraf";
import { match } from "telegraf-i18n";
import { ContextMessage, SceneContextMessage } from "../../bot";
import asyncWrapper from "../../helpers/asyncWrapper";
import { getBackKeyboard, getMainKeyboard } from "../../helpers/keyboards";
import { deleteFromSession, SessionType } from "../../helpers/sessions";
import { TaskDocument } from "../../models/Task";
import { getBackTasks, getEditTaskMenu, removeTask } from "./actions";
import { getTasks, getTasksButtons } from "./helpers";
import { exposeTask } from "./middlewares";

const tasksScene: BaseScene<SceneContextMessage> = new BaseScene("tasks");

tasksScene.enter(
  asyncWrapper(
    async (ctx: ContextMessage): Promise<void> => {
      const backKeyboard: object = getBackKeyboard(ctx);
      const tasks: TaskDocument[] = await getTasks(ctx);

      if (tasks.length) {
        await ctx.reply(ctx.i18n.t("scenes.tasks.list_of_tasks_info"), backKeyboard);
        await ctx.reply(ctx.i18n.t("scenes.tasks.list_of_tasks"), getTasksButtons(tasks));
      } else {
        await ctx.reply(ctx.i18n.t("scenes.tasks.no_tasks"), backKeyboard);
      }
    }
  )
);

tasksScene.leave(
  asyncWrapper(
    async (ctx: ContextMessage): Promise<void> => {
      deleteFromSession(ctx, SessionType.EDIT_TASK, SessionType.TASKS);

      const mainKeyboard: object = getMainKeyboard(ctx);

      await ctx.reply(ctx.i18n.t("shared.what_next"), mainKeyboard);
    }
  )
);

tasksScene.hears(match("keyboards.back_keyboard.back"), Stage.leave());

tasksScene.command("reset", Stage.leave());

tasksScene.action(/"a":"task"/, exposeTask, getEditTaskMenu);
tasksScene.action(/"a":"edit_task_back"/, getBackTasks);
tasksScene.action(/"a":"edit_task_remove"/, removeTask);

export default tasksScene;
