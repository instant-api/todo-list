import * as z from 'zod';
import {
  Middleware,
  createContext,
  JsonParserConsumer,
  HttpError,
  ContextStack,
} from 'tumau';

export function ZodValidator<T>(schema: z.Schema<T>) {
  const Ctx = createContext<T>({ name: 'ZodValidator' });

  const validate: Middleware = async (ctx, next) => {
    const jsonBody = ctx.getOrFail(JsonParserConsumer);

    try {
      const result = schema.parse(jsonBody);
      return next(ctx.with(Ctx.Provider(result)));
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors.map(
          err => `${err.path.join('.')}: ${err.message}`
        );
        throw new HttpError.BadRequest(`Scheùa validation failed:\n${message}`);
      }
      throw error;
    }
  };

  return {
    validate,
    getValue: (ctx: ContextStack) => ctx.getOrFail(Ctx.Consumer),
  };
}
