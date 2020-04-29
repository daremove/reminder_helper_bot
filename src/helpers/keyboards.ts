import { Markup } from "telegraf";
import { ContextMessage } from "../bot";

export const getMainKeyboard: (ctx: ContextMessage) => object = (ctx: ContextMessage): object => {
  const mainKeyboardAddTask: string = ctx.i18n.t("keyboards.main_keyboard.add_task");
  const mainKeyboardTasks: string = ctx.i18n.t("keyboards.main_keyboard.tasks");

  return Markup.keyboard([mainKeyboardAddTask, mainKeyboardTasks]).resize().extra();
};

export const getBackKeyboard: (ctx: ContextMessage) => object = (ctx: ContextMessage): object => {
  const backKeyboardBack: string = ctx.i18n.t("keyboards.back_keyboard.back");

  return Markup.keyboard([backKeyboardBack]).resize().extra();
};
