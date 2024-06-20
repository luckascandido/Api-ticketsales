// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { MulterModule } from '@nestjs/platform-express';

export class CreateEventDto {
  name: string;
  descrioption: string;
  date: string;
  price: number;
}
