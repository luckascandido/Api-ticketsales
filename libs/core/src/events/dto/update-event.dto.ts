import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  name: string;
  descrioption: string;
  date: string;
  price: number;
}
