import { Extra, Markup } from "telegraf";
import { ExtraEditMessage } from "telegraf/typings/telegram-types";
import { ContextMessage } from "../../bot";

export function getCreateTaskButtons(ctx: ContextMessage): ExtraEditMessage {
  return Extra.HTML().markup(
    (m: Markup): Markup =>
      m.inlineKeyboard(
        [
          m.callbackButton(ctx.i18n.t("scenes.add_task.remove"), JSON.stringify({ a: "task_remove" }), false),
          m.callbackButton(ctx.i18n.t("scenes.add_task.accept"), JSON.stringify({ a: "task_accept" }), false)
        ],
        {}
      )
  );
}

const FORMAT_DATE: RegExp = /^(?<date>\d{2}\.\d{2}\.\d{4}) - (?<time>\d{2}:\d{2})$/;
const MAX_YEAR: number = 2022;

export function validationDateFormat(date: string): boolean {
  return FORMAT_DATE.test(date);
}

export function getDateAndTimeFromDate(date: string): { [key: string]: string } {
  return date.match(FORMAT_DATE)!.groups as { [key: string]: string };
}

export enum ValidationDateLogicalErrors {
  MAX_YEAR = "MAX_YEAR",
  INCORRECT_DAY = "INCORRECT_DAY",
  INCORRECT_MONTH = "INCORRECT_MONTH",
  PAST_DAY = "PAST_DAY",
  PAST_MONTH = "PAST_MONTH",
  PAST_YEAR = "PAST_YEAR",
  NONE = "NONE"
}

export function validationDateLogical(date: string, currentDate: Date): ValidationDateLogicalErrors {
  const [d, m, y]: string[] = date.split(".");
  const day: number = Number(d);
  const month: number = Number(m);
  const year: number = Number(y);

  if (year > MAX_YEAR) {
    return ValidationDateLogicalErrors.MAX_YEAR;
  }

  if (month <= 0 || month > 12) {
    return ValidationDateLogicalErrors.INCORRECT_MONTH;
  }

  if (day <= 0 || day > new Date(year, month, 0).getDate()) {
    return ValidationDateLogicalErrors.INCORRECT_DAY;
  }

  if (year === currentDate.getFullYear() && month < currentDate.getMonth() + 1) {
    return ValidationDateLogicalErrors.PAST_MONTH;
  } else if (
    year === currentDate.getFullYear() &&
    month === currentDate.getMonth() + 1 &&
    day < currentDate.getDate()
  ) {
    return ValidationDateLogicalErrors.PAST_DAY;
  } else if (year < currentDate.getFullYear()) {
    return ValidationDateLogicalErrors.PAST_YEAR;
  }

  return ValidationDateLogicalErrors.NONE;
}

export enum ValidationTimeLogicalErrors {
  INCORRECT_HOURS = "INCORRECT_HOURS",
  INCORRECT_MIN = "INCORRECT_MIN",
  PAST_HOURS = "PAST_HOURS",
  PAST_MIN = "PAST_MIN",
  NONE = "NONE"
}

export function validationTimeLogical(date: string, time: string, currentDate: Date): ValidationTimeLogicalErrors {
  const [d, m, y]: string[] = date.split(".");
  const [h, min]: string[] = time.split(":");
  const day: number = Number(d);
  const month: number = Number(m);
  const year: number = Number(y);
  const hours: number = Number(h);
  const minutes: number = Number(min);

  if (hours < 0 || hours > 23) {
    return ValidationTimeLogicalErrors.INCORRECT_HOURS;
  }

  if (minutes < 0 || minutes > 59) {
    return ValidationTimeLogicalErrors.INCORRECT_MIN;
  }

  if (currentDate.getFullYear() === year && currentDate.getMonth() + 1 === month && currentDate.getDate() === day) {
    if (hours < currentDate.getHours()) {
      return ValidationTimeLogicalErrors.PAST_HOURS;
    } else if (hours === currentDate.getHours() && minutes <= currentDate.getMinutes()) {
      return ValidationTimeLogicalErrors.PAST_MIN;
    }
  }

  return ValidationTimeLogicalErrors.NONE;
}

export async function convertDateErrorToMessage(
  ctx: ContextMessage,
  error: ValidationDateLogicalErrors
): Promise<void> {
  switch (error) {
    case ValidationDateLogicalErrors.MAX_YEAR:
      await ctx.reply(`${ctx.i18n.t("scenes.add_task.error_date_max_year")}${MAX_YEAR}`);
      break;
    case ValidationDateLogicalErrors.INCORRECT_DAY:
      await ctx.reply(ctx.i18n.t("scenes.add_task.error_date_incorrect_day"));
      break;
    case ValidationDateLogicalErrors.INCORRECT_MONTH:
      await ctx.reply(ctx.i18n.t("scenes.add_task.error_date_incorrect_month"));
      break;
    case ValidationDateLogicalErrors.PAST_DAY:
      await ctx.reply(ctx.i18n.t("scenes.add_task.error_date_past_day"));
      break;
    case ValidationDateLogicalErrors.PAST_MONTH:
      await ctx.reply(ctx.i18n.t("scenes.add_task.error_date_past_month"));
      break;
    case ValidationDateLogicalErrors.PAST_YEAR:
      await ctx.reply(ctx.i18n.t("scenes.add_task.error_date_past_year"));
      break;
  }
}

export async function convertTimeErrorToMessage(
  ctx: ContextMessage,
  error: ValidationTimeLogicalErrors
): Promise<void> {
  switch (error) {
    case ValidationTimeLogicalErrors.INCORRECT_HOURS:
      await ctx.reply(ctx.i18n.t("scenes.add_task.error_time_incorrect_hours"));
      break;
    case ValidationTimeLogicalErrors.INCORRECT_MIN:
      await ctx.reply(ctx.i18n.t("scenes.add_task.error_time_incorrect_min"));
      break;
    case ValidationTimeLogicalErrors.PAST_HOURS:
      await ctx.reply(ctx.i18n.t("scenes.add_task.error_time_past_hours"));
      break;
    case ValidationTimeLogicalErrors.PAST_MIN:
      await ctx.reply(ctx.i18n.t("scenes.add_task.error_time_past_min"));
      break;
  }
}
