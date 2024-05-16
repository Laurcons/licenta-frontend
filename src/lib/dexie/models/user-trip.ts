import { TicketUtil } from '../../ticket.util';

export interface UserTrip {
  id?: number;
  date: string;
  trackStartedAt: Date;
  trainNum: string;
  destinationId?: string;
  ticketSerial?: string;
  ticketDecodedInfo?: ReturnType<(typeof TicketUtil)['decodeQrCode']>;
}
