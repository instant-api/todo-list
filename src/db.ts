import fse from 'fs-extra';

export interface Todo {
  id: string;
  name: string;
  done: boolean;
}

export interface Data {
  todos: Array<Todo>;
}

export const DEFAULT_CONTENT: Data = {
  todos: [
    { id: 'qr0u1q1', name: 'Learn JS', done: true },
    { id: 'jt0v1bu', name: 'Learn React', done: true },
    { id: '5e0x1bt', name: 'Learn JSX', done: false },
    { id: 'on0z1fl', name: 'Rule the world', done: false },
  ],
};

export async function read(file: string): Promise<Data> {
  return fse.readJSON(file);
}

export async function write(file: string, data: Data): Promise<void> {
  return fse.writeJSON(file, data);
}
