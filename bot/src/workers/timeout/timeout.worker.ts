import { config } from "dotenv";
import { resolve } from "path";
import { Worker } from "worker_threads";

config();

const timeoutWorkerName: string = process.env.NODE_ENV === "production" ? "timeout.js" : "worker.import.js";
const timeoutWorker: Worker = new Worker(resolve(__dirname, timeoutWorkerName));

export default timeoutWorker;
