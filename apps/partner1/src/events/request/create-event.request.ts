// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { MulterModule } from '@nestjs/platform-express';

export class CreateEventRequest {
  name: string;
  descrioption: string;
  date: string;
  price: number;
}
