import { config } from "dotenv";
import mongoose, { ConnectionOptions, Mongoose } from "mongoose";
import { resolve } from "path";
import { ContextMessageUpdate, SceneContext, session, Stage } from "telegraf";
import I18n, { match } from "telegraf-i18n";
import { Worker } from "worker_threads";
import addTaskScene from "./controllers/add-task";
import startScene from "./controllers/start";
import tasksScene from "./controllers/tasks";
import timeoutController from "./controllers/timeout";
import asyncWrapper from "./helpers/asyncWrapper";
import { getMainKeyboard } from "./helpers/keyboards";
import { Sessions } from "./helpers/sessions";
import bot from "./telegram";
import timeoutWorker from "./workers/timeout/timeout.worker";

config();

export interface ContextMessage extends ContextMessageUpdate {
  i18n: I18n;
  scene: SceneContext<this>;
  session: Sessions;
  callbackQuery: any;
  timer: Worker;
}

export interface SceneContextMessage extends ContextMessageUpdate {
  i18n: I18n;
  scene: SceneContext<this>;
}

const { MONGO_USERNAME, MONGO_PASSWORD, MONGO_DB, MONGO_PORT, MONGO_HOSTNAME }: any = process.env;

if (
  MONGO_USERNAME === undefined ||
  MONGO_PASSWORD === undefined ||
  MONGO_DB === undefined ||
  MONGO_PORT === undefined ||
  MONGO_HOSTNAME === undefined
) {
  throw new Error("Mongo URI isn't set.");
}

const MONGO_URI: string = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;
const MONGO_OPTIONS: ConnectionOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  connectTimeoutMS: 10000
};

mongoose
  .connect(MONGO_URI, MONGO_OPTIONS)
  .then((mongo: Mongoose): void => {
    // tslint:disable-next-line:no-console
    console.log(`MongoDB Connected: ${mongo.connection.host}`);

    timeoutWorker.on("message", timeoutController);

    const stage: Stage<SceneContextMessage> = new Stage([startScene, tasksScene, addTaskScene]);
    const i18n: I18n = new I18n({
      defaultLanguage: "ru",
      directory: resolve(__dirname, "locales"),
      useSession: true,
      allowMissing: false,
      sessionName: "session"
    });

    bot.use(session());
    bot.use(i18n.middleware());
    bot.use(stage.middleware());

    bot.command(
      "reset",
      async (ctx: ContextMessage): Promise<void> => {
        const mainKeyboard: object = getMainKeyboard(ctx);

        await ctx.reply(ctx.i18n.t("shared.what_next"), mainKeyboard);
      }
    );

    bot.start(asyncWrapper(async (ctx: ContextMessage): Promise<void> => await ctx.scene.enter("start")));
    bot.hears(
      match("keyboards.main_keyboard.tasks"),
      asyncWrapper(async (ctx: ContextMessage): Promise<void> => await ctx.scene.enter("tasks"))
    );
    bot.hears(
      match("keyboards.main_keyboard.add_task"),
      asyncWrapper(async (ctx: ContextMessage): Promise<void> => await ctx.scene.enter("add_task"))
    );
    bot.hears(
      match("keyboards.back_keyboard.back"),
      asyncWrapper(
        async (ctx: ContextMessage): Promise<void> => {
          const mainKeyboard: object = getMainKeyboard(ctx);

          await ctx.reply(ctx.i18n.t("shared.what_next"), mainKeyboard);
        }
      )
    );

    bot.command(
      "reset",
      asyncWrapper(
        async (ctx: ContextMessage): Promise<void> => {
          const mainKeyboard: object = getMainKeyboard(ctx);

          await ctx.reply(ctx.i18n.t("shared.what_next"), mainKeyboard);
        }
      )
    );

    bot.catch((error: any): void => {
      console.error(`Catch global error ${error}`);
    });

    bot.startPolling();
  })
  .catch((err: Error): void => {
    console.error(err);
  });
