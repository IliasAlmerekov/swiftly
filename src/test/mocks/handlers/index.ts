import { ticketHandlers } from './tickets';
import { authHandlers } from './auth';

export const handlers = [...ticketHandlers, ...authHandlers];
