import {
  TumauServer,
  Chemin,
  CheminParam,
  Middleware,
  RouterPackage,
  Route,
  TumauResponse,
  JsonResponse,
  HttpError,
  InvalidResponseToHttpError,
  JsonPackage,
  CorsPackage,
  RouterConsumer,
} from 'tumau';
import { read, Todo, write } from './db';
import { ZodValidator } from './ZodValidator';
import cuid from 'cuid';
import * as z from 'zod';

export function CuidSlugParam<N extends string>(
  name: N
): CheminParam<N, string> {
  const reg = /^[a-z0-9]{7,10}$/;
  return {
    name,
    match: (...all) => {
      if (all[0] && all[0].match(reg)) {
        return { match: true, value: all[0], next: all.slice(1) };
      }
      return { match: false, next: all };
    },
    serialize: value => value,
    stringify: () => `:${name}(cuid.slug)`,
  };
}

const ROUTES = {
  home: Chemin.create(),
  todos: Chemin.create('todos'),
  todo: Chemin.create('todo'),
  todoById: Chemin.create('todo', CuidSlugParam('id')),
};

const newTodoValidator = ZodValidator(
  z.object({
    name: z.string(),
    done: z.boolean().optional(),
  })
);

const updateTodoValidator = ZodValidator(
  z.object({
    name: z.string().optional(),
    done: z.boolean().optional(),
  })
);

export function createServer(
  filePath: string,
  helpContent: string
): TumauServer {
  const server = TumauServer.create({
    handleErrors: false,
    mainMiddleware: Middleware.compose(
      CorsPackage(),
      JsonPackage(),
      InvalidResponseToHttpError,
      RouterPackage([
        Route.GET(ROUTES.home, () => {
          return TumauResponse.withHtml(helpContent);
        }),
        Route.GET(ROUTES.todos, async _tools => {
          const data = await read(filePath);
          return JsonResponse.withJson(data.todos);
        }),
        Route.POST(ROUTES.todo, newTodoValidator.validate, async tools => {
          const { name, done = false } = newTodoValidator.getValue(tools);
          const data = await read(filePath);
          const id = cuid.slug();
          const todo: Todo = {
            id,
            name,
            done,
          };
          data.todos.push(todo);
          await write(filePath, data);
          return JsonResponse.withJson(todo);
        }),
        Route.PUT(
          ROUTES.todoById,
          updateTodoValidator.validate,
          async tools => {
            const id = tools
              .readContextOrFail(RouterConsumer)
              .getOrFail(ROUTES.todoById).id;
            const data = await read(filePath);
            const todo = data.todos.find(t => t.id === id);
            if (!todo) {
              throw new HttpError.NotFound();
            }
            const updated = updateTodoValidator.getValue(tools);
            if (updated.name !== undefined) {
              todo.name = updated.name;
            }
            if (updated.done !== undefined) {
              todo.done = updated.done;
            }
            await write(filePath, data);
            return JsonResponse.withJson(todo);
          }
        ),
        Route.DELETE(ROUTES.todoById, async tools => {
          const id = tools
            .readContextOrFail(RouterConsumer)
            .getOrFail(ROUTES.todoById).id;
          const data = await read(filePath);
          const todoIndex = data.todos.findIndex(t => t.id === id);
          if (todoIndex === -1) {
            throw new HttpError.NotFound();
          }
          data.todos.splice(todoIndex, 1);
          await write(filePath, data);
          return JsonResponse.noContent();
        }),
        Route.all(null, () => {
          throw new HttpError.NotFound();
        }),
      ])
    ),
  });

  return server;
}
