import * as Yup from 'yup';
import {
  Middleware,
  Tools,
  Context,
  JsonParserConsumer,
  HttpError,
} from 'tumau';

export function YupValidator<T>(schema: Yup.Schema<T>) {
  const Ctx = Context.create<T>();

  const validate: Middleware = async tools => {
    const jsonBody = tools.readContextOrFail(JsonParserConsumer);
    const body = await schema.validate(jsonBody).catch((e): never => {
      if (e instanceof Yup.ValidationError) {
        throw new HttpError.BadRequest(e.message);
      }
      throw e;
    });
    return tools.withContext(Ctx.Provider(body)).next();
  };

  return {
    validate,
    getValue: (tools: Tools) => tools.readContextOrFail(Ctx.Consumer),
  };
}
