import { BaseScene, Stage } from "telegraf";
import { match } from "telegraf-i18n";
import { ContextMessage, SceneContextMessage } from "../../bot";
import asyncWrapper from "../../helpers/asyncWrapper";
import { getBackKeyboard, getMainKeyboard } from "../../helpers/keyboards";
import { deleteFromSession, SessionType } from "../../helpers/sessions";
import { acceptTaskAction, removeTaskAction } from "./actions";
import { getCreateTaskButtons } from "./helpers";
import { validationDate, validationTitle } from "./middlewares";

const addTaskScene: BaseScene<SceneContextMessage> = new BaseScene("add_task");

addTaskScene.enter(
  asyncWrapper(
    async (ctx: ContextMessage): Promise<void> => {
      const backKeyboard: object = getBackKeyboard(ctx);

      await ctx.reply(ctx.i18n.t("scenes.add_task.welcome"), backKeyboard);
      await ctx.reply(ctx.i18n.t("scenes.add_task.continue"));
    }
  )
);

addTaskScene.leave(
  asyncWrapper(
    async (ctx: ContextMessage): Promise<void> => {
      deleteFromSession(ctx, SessionType.TASK_TITLE, SessionType.TASK_DATE, SessionType.TASK_TIME);

      const mainKeyboard: object = getMainKeyboard(ctx);

      await ctx.reply(ctx.i18n.t("shared.what_next"), mainKeyboard);
    }
  )
);

addTaskScene.hears(match("keyboards.back_keyboard.back"), Stage.leave());

addTaskScene.command("reset", Stage.leave());

addTaskScene.on(
  "message",
  validationTitle,
  validationDate,
  asyncWrapper(
    async (ctx: ContextMessage): Promise<void> => {
      await ctx.replyWithHTML(
        `<b>${ctx.session[SessionType.TASK_TITLE]}</b> <i>${ctx.session[SessionType.TASK_DATE]} - ${
          ctx.session[SessionType.TASK_TIME]
        }</i>`,
        getCreateTaskButtons(ctx)
      );
    }
  )
);

addTaskScene.action(/"a":"task_remove"/, removeTaskAction);
addTaskScene.action(/"a":"task_accept"/, acceptTaskAction);

export default addTaskScene;
