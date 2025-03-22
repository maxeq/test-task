import { Task } from "../models/Task";
import { JobResult } from "../types/JobResult";

export interface Job<TInput = never, TOutput = never, TMeta = never> {
  run(task: Task): Promise<JobResult<TInput, TOutput, TMeta>>;
}
