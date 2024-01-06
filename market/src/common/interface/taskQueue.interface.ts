export interface TaskQueue<T> {
  runTask(task: Task<T>): Promise<T>;
}

export type Task<T> = () => Promise<T>;