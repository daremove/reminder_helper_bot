import { ContextMessage } from "../bot";

const asyncWrapper: (fn: any) => any = (fn: any): any => {
  return async (ctx: ContextMessage, next?: () => void): Promise<void> => {
    try {
      return await fn(ctx, next);
    } catch (error) {
      console.error("Async wrapper error", error);
      await ctx.reply(ctx.i18n.t("shared.something_went_wrong"));
      return;
    }
  };
};

export default asyncWrapper;
