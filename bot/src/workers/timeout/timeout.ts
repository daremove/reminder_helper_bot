import { parentPort } from "worker_threads";
import { TimeoutMessage, TimeoutMessageInPayload, TimeoutMessageType, Timers, TimersDates } from "./timeout.types";

const userTimers: Timers = {};

function setTimer({ userId, date, taskId }: TimeoutMessageInPayload): void {
  const user: TimersDates = userTimers[userId] || {};

  if (user[taskId] !== undefined) {
    clearTimeout(user[taskId]);
  }

  const [year, time]: string[] = date.split("-");
  const [d, m, y]: string[] = year.split(".");

  user[taskId] = setTimeout((): void => {
    parentPort!.postMessage(
      JSON.stringify({
        type: TimeoutMessageType.TIMER_SUCCESS,
        payload: {
          userId,
          taskId
        }
      })
    );

    delete user[taskId];
  }, new Date(`${y}.${m}.${d} ${time}`).getTime() - new Date().getTime());
}

function deleteTimer({ userId, taskId }: TimeoutMessageInPayload): void {
  const user: TimersDates = userTimers[userId];

  if (user === undefined) {
    return;
  }

  clearTimeout(user[taskId]);
  delete user[taskId];
}

parentPort!.on("message", (message: string): void => {
  try {
    const { type, payload }: TimeoutMessage = JSON.parse(message);

    switch (type) {
      case TimeoutMessageType.SET_TIMER:
        setTimer(payload as TimeoutMessageInPayload);
        break;
      case TimeoutMessageType.DELETE_TIMER:
        deleteTimer(payload as TimeoutMessageInPayload);
        break;
      default:
        throw new Error(`Timeout message type ${type} isn't defined`);
    }
  } catch (e) {
    parentPort!.postMessage(
      JSON.stringify({
        type: TimeoutMessageType.TIMER_ERROR,
        payload: e
      })
    );
  }
});
