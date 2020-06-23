import * as z from 'zod';
import {
  Middleware,
  Tools,
  Context,
  JsonParserConsumer,
  HttpError,
} from 'tumau';

export function ZodValidator<T>(schema: z.Schema<T>) {
  const Ctx = Context.create<T>();

  const validate: Middleware = async tools => {
    const jsonBody = tools.readContextOrFail(JsonParserConsumer);

    try {
      const result = schema.parse(jsonBody);
      return tools.withContext(Ctx.Provider(result)).next();
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
    getValue: (tools: Tools) => tools.readContextOrFail(Ctx.Consumer),
  };
}
