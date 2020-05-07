import * as mongoose from "mongoose";

export interface TaskDocument extends mongoose.Document {
  title: string;
  date: string;
  time: string;
}

const TaskSchema: mongoose.Schema<TaskDocument> = new mongoose.Schema({
  title: String,
  date: String,
  time: String
});

export default mongoose.model<TaskDocument>("Task", TaskSchema);
