import { TaskModel } from "../../models";
import { TaskDocument } from "../../models/Task";
import bot from "../../telegram";
import { TimeoutMessage, TimeoutMessageOutPayload, TimeoutMessageType } from "../../workers/timeout/timeout.types";

async function timeoutController(message: string): Promise<void> {
  try {
    const { type, payload }: TimeoutMessage = JSON.parse(message);

    switch (type) {
      case TimeoutMessageType.TIMER_SUCCESS:
        const { userId, taskId }: TimeoutMessageOutPayload = payload as TimeoutMessageOutPayload;

        const task: TaskDocument | null = await TaskModel.findOne({
          _id: taskId
        });

        if (!task) {
          throw new Error("Task is null");
        }

        await bot.telegram.sendMessage(userId, `Пора приступать к задаче - ${task.title}`);
        await task.remove();

        break;
      case TimeoutMessageType.TIMER_ERROR:
        console.error(payload);
        break;
      default:
        throw new Error(`Message controller: message ${type} isn't defined`);
    }
  } catch (e) {
    console.error(e);
  }
}

export default timeoutController;
