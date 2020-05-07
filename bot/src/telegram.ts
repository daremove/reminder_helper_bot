import { config } from "dotenv";
import createSocksProxyAgent from "socks-proxy-agent";
import Telegraf from "telegraf";
import { ContextMessage } from "./bot";

config();

if (process.env.TELEGRAM_TOKEN === undefined) {
  throw new Error("Token isn't defined");
}

const socksAgent: any = createSocksProxyAgent({
  host: "96.96.33.133",
  port: "1080"
});

const bot: Telegraf<ContextMessage> = new Telegraf(process.env.TELEGRAM_TOKEN, {
  telegram: {
    agent: socksAgent
  }
});

export default bot;
