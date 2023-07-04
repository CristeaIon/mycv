const cookieSession = require('cookie-session');
import { ValidationPipe } from '@nestjs/common';

export function setupApp(app: any) {
  app.use(
    cookieSession({
      keys: ['asdsga'],
    }),
  );
  app.useGlobalPipes(new ValidationPipe());
}
