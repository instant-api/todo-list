import * as RT from 'runtypes';
import {
  Middleware,
  Tools,
  Context,
  JsonParserConsumer,
  HttpError,
} from 'tumau';

export function RuntypesValidator<T>(schema: RT.Runtype<T>) {
  const Ctx = Context.create<T>();

  const validate: Middleware = async tools => {
    const jsonBody = tools.readContextOrFail(JsonParserConsumer);

    const result = schema.validate(jsonBody);
    if (result.success === false) {
      throw new HttpError.BadRequest(result.message);
    }
    return tools.withContext(Ctx.Provider(result.value)).next();
  };

  return {
    validate,
    getValue: (tools: Tools) => tools.readContextOrFail(Ctx.Consumer),
  };
}
