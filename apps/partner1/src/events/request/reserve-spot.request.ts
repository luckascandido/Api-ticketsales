import { TicketKind } from '@prisma/client';

export class ReserveSpotrRequest {
  spots: string[];
  ticket_kind: TicketKind;
  email: string;
}
