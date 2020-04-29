import { ContextMessage } from "../../bot";
import { saveToSession, SessionType } from "../../helpers/sessions";
import {
  convertDateErrorToMessage,
  convertTimeErrorToMessage,
  getDateAndTimeFromDate,
  validationDateFormat,
  validationDateLogical,
  ValidationDateLogicalErrors,
  validationTimeLogical,
  ValidationTimeLogicalErrors
} from "./helpers";

export async function validationTitle(ctx: ContextMessage, next: () => void): Promise<void> {
  const title: string | undefined = ctx?.message?.text;

  if (ctx.session[SessionType.TASK_TITLE]) {
    return next();
  }

  if (title === undefined) {
    await ctx.reply(ctx.i18n.t("scenes.shared.something_went_wrong"));
    return;
  }

  if (title.length > 60) {
    await ctx.reply(ctx.i18n.t("scenes.add_task.error_length"));
    return;
  }

  saveToSession(ctx, SessionType.TASK_TITLE, title);

  await ctx.replyWithHTML(
    `${ctx.i18n.t("scenes.add_task.date_welcome")}
<i><b>${ctx.i18n.t("scenes.add_task.date_format")}</b></i>`
  );
}

export async function validationDate(ctx: ContextMessage, next: () => void): Promise<void> {
  const dateText: string | undefined = ctx?.message?.text;
  const currentDate: Date = new Date();

  if (ctx.session[SessionType.TASK_DATE] && ctx.session[SessionType.TASK_TIME]) {
    return next();
  }

  if (dateText === undefined) {
    await ctx.reply(ctx.i18n.t("scenes.shared.something_went_wrong"));
    return;
  }

  if (!validationDateFormat(dateText)) {
    await ctx.reply(ctx.i18n.t("scenes.add_task.error_date"));
    return;
  }

  const { date, time }: { [key: string]: string } = getDateAndTimeFromDate(dateText);
  const resultValidationDate: ValidationDateLogicalErrors = validationDateLogical(date, currentDate);
  const resultValidationTime: ValidationTimeLogicalErrors = validationTimeLogical(date, time, currentDate);

  if (resultValidationDate !== ValidationDateLogicalErrors.NONE) {
    return await convertDateErrorToMessage(ctx, resultValidationDate);
  }

  if (resultValidationTime !== ValidationTimeLogicalErrors.NONE) {
    return await convertTimeErrorToMessage(ctx, resultValidationTime);
  }

  saveToSession(ctx, SessionType.TASK_DATE, date);
  saveToSession(ctx, SessionType.TASK_TIME, time);

  return next();
}
