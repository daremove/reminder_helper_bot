import { BaseScene } from "telegraf";
import { ContextMessage, SceneContextMessage } from "../../bot";
import asyncWrapper from "../../helpers/asyncWrapper";
import { getMainKeyboard } from "../../helpers/keyboards";
import { UserModel } from "../../models";
import { UserDocument } from "../../models/User";

const startScene: BaseScene<SceneContextMessage> = new BaseScene("start");

startScene.enter(
  asyncWrapper(
    async (ctx: ContextMessage): Promise<void> => {
      if (ctx.from === undefined) {
        throw new Error("ctx.from isn't defined");
      }

      const id: string = String(ctx.from.id);
      let user: UserDocument | null = await UserModel.findOne({
        _id: id
      });
      const mainKeyboard: object = getMainKeyboard(ctx);

      if (user) {
        await ctx.reply(ctx.i18n.t("scenes.start.welcome_back", mainKeyboard));
      } else {
        user = new UserModel({
          _id: id,
          nickname: ctx.from.username,
          first_name: ctx.from.first_name,
          last_name: ctx.from.last_name,
          tasks: []
        });

        await user.save();
        await ctx.reply(ctx.i18n.t("scenes.start.new_account"), mainKeyboard);
      }
    }
  )
);

export default startScene;
