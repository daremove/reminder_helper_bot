import * as mongoose from "mongoose";
import { TaskDocument } from "./Task";

export interface UserDocument extends mongoose.Document {
  _id: string;
  nickname: string;
  first_name: string;
  last_name: string;
  tasks: TaskDocument[];
}

const UserSchema: mongoose.Schema<UserDocument> = new mongoose.Schema(
  {
    _id: String,
    nickname: String,
    first_name: String,
    last_name: String,
    tasks: [
      {
        type: String,
        ref: "Task"
      }
    ]
  },
  {
    _id: false
  }
);

UserSchema.pre("findOne", function (): void {
  this.populate("tasks");
});

export default mongoose.model<UserDocument>("User", UserSchema);
