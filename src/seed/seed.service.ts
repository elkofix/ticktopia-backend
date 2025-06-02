import { Injectable } from '@nestjs/common';
import { initialData } from './data/seed-data';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/entities/user.entity';
import { EventService } from '../event/event.service';
import { Event } from '../event/entities/event.entity';
import { Presentation } from '../presentation/entities/presentation.entity';
import { PresentationService } from '../presentation/presentation.service';
import { TicketService } from '../ticket/ticket.service';
import { Ticket } from '../ticket/entities/ticket.entity';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
@Injectable()
export class SeedService {

  constructor(private readonly userService: AuthService, private readonly eventService: EventService, private readonly presentationService: PresentationService, private readonly ticketService: TicketService) { }


  async runSeed() {

    const users = await this.insertNewUsers();
    const donneyUser = await this.insertNewUser("donneys@gmail.com");
    const donneyUserId = donneyUser!.user.id;
    const cristianUser = await this.insertNewUser("guarros@gmail.com");
    await this.insertNewUser("emptyuser@gmail.com");
    await this.insertNewUser("delete@gmail.com");
    await this.insertNewUser("edit@gmail.com");
    await this.insertNewUserManager("noevents@gmail.com");
    const deletePresentation = await this.insertNewUserManager("deletepresentation@gmail.com");
    const deletePresentationId = deletePresentation!.user.id;
    const cristianUserId = cristianUser?.user.id;
    const eventManagers = users.filter(result => result?.user.roles.includes(ValidRoles.eventManager))
    const eventManagerIds = eventManagers.map((eventManager) => eventManager!.user.id);
    const events = await this.insertNewEvents(eventManagerIds);
    const eventsIds = events.map((event) => event.id);
    const presentations = await this.insertNewPresentations(eventsIds);
    const presentationIds = presentations.map((presentation) => presentation.idPresentation);
    const clients = users.filter(result => result?.user.roles.includes(ValidRoles.client))
    const clientsIds = clients.map((client) => client!.user.id);
    const tickets = await this.insertNewTickets(presentationIds, clientsIds);
    const activeTicketIds = tickets
      .filter(ticket => ticket.isActive)
      .map(ticket => ticket.id);
    const unactiveTicketIds = tickets
      .filter(ticket => !ticket.isActive)
      .map(ticket => ticket.id);
    const presentationId = await this.insertPresentationTicketAvailable(eventsIds[0]);
    const presentationId2 = await this.insertPresentationTicketUnavailable(eventsIds[0]);
    await this.insertNewTicket(presentationId, donneyUserId!);
    await this.insertNewTicket(presentationId2, cristianUserId!);
    await this.insertNewTicketHistoric(presentationId, donneyUserId!);
    console.log(deletePresentationId)
    const eventId = await this.insertEvent(deletePresentationId!);
    console.log(eventId);

    await this.insertPresentationAlone(eventId);
    return { message: "SEED EXECUTED", activeTicketIds, unactiveTicketIds };
  }

  async insertNewUsers() {
    await this.ticketService.deleteAll();
    await this.presentationService.deleteAll();
    await this.eventService.deleteAll();
    await this.userService.deleteAllUsers();
    const users = initialData.users;
    const insertPromises: Promise<{ user: User, token: string } | undefined>[] = [];
    users.forEach(user => {
      insertPromises.push(this.userService.create(user))
    });
    return await Promise.all(insertPromises);;
  }

  async insertNewUser(email: string) {
    return await this.userService.create({ email, password: "Hola1597!!!", lastname: "any", name: "any" });
  }

  async insertNewUserManager(email: string) {
    return await this.userService.create({ email, password: "Hola1597!!!", lastname: "any", name: "any", roles: [ValidRoles.eventManager] });
  }


  async insertNewEvents(eventManagerIds: string[]) {
    await this.eventService.deleteAll();
    const events = initialData.events;
    const insertPromises: Promise<Event>[] = [];

    let managerIndex = 0;
    const totalManagers = eventManagerIds.length;

    events.forEach(event => {
      const managerId = eventManagerIds[managerIndex];
      managerIndex = (managerIndex + 1) % totalManagers;

      insertPromises.push(
        this.eventService.create({ ...event, userId: managerId }) as Promise<Event>
      );
    });

    return await Promise.all(insertPromises);
  }


  async insertNewPresentations(eventIds: string[]) {
    await this.presentationService.deleteAll();
    const presentations = initialData.presentations;
    const insertPromises: Promise<Presentation>[] = [];

    let eventIndex = 0;

    presentations.forEach(presentation => {
      const eventId = eventIds[eventIndex];
      insertPromises.push(this.presentationService.create({ ...presentation, eventId }));
      eventIndex = (eventIndex + 1) % eventIds.length;
    });

    return await Promise.all(insertPromises);
  }

  async insertNewTicket(presentationId: string, userId: string) {
    await this.ticketService.create({
      userId,
      presentationId: presentationId,
      ...{ isActive: true, isRedeemed: false }
    })
  }


  async insertNewTicketHistoric(presentationId: string, userId: string) {
    await this.ticketService.create({
      userId,
      presentationId: presentationId,
      ...{ isActive: true, isRedeemed: true }
    })
  }


  async insertNewTickets(presentationIds: string[], userIds: string[]) {
    await this.ticketService.deleteAll();
    const insertPromises: Promise<Ticket>[] = [];

    const combinations = [
      { isActive: false, isRedeemed: false },
      { isActive: true, isRedeemed: false },
      { isActive: true, isRedeemed: true }
    ];

    let comboIndex = 0;

    for (let i = 0; i < userIds.length && i * 2 < presentationIds.length * 2; i++) {
      const userId = userIds[i];

      const pres1 = presentationIds[(i * 2) % presentationIds.length];
      const pres2 = presentationIds[(i * 2 + 1) % presentationIds.length];

      insertPromises.push(this.ticketService.create({
        userId,
        presentationId: pres1,
        ...combinations[comboIndex % 4]
      }));

      comboIndex++;

      insertPromises.push(this.ticketService.create({
        userId,
        presentationId: pres2,
        ...combinations[comboIndex % 4]
      }));

      comboIndex++;
    }

    return await Promise.all(insertPromises);
  }


  async insertEvent(userId: string): Promise<string> {
    const { name, bannerPhotoUrl, isPublic } = initialData.events[0];
    const { id } = await this.eventService.create({ name, bannerPhotoUrl, userId, isPublic });
    return id;
  }

  async insertPresentationAlone(eventId: string): Promise<string> {
    const {
      ticketSaleAvailabilityDate,
      ticketAvailabilityDate,
      openDate,
      startDate
    } = await this.generateDatesForCurrentTicket();
    const { place,
      capacity,
      latitude,
      longitude,
      price,
      description,
      city,
    } = initialData.presentations[0];
    const { idPresentation } = await this.presentationService.create({ place, eventId, capacity, latitude, longitude, price, description, city, ticketAvailabilityDate, ticketSaleAvailabilityDate, openDate, startDate, });
    return idPresentation;
  }

  async insertPresentationTicketAvailable(eventId: string): Promise<string> {
    const {
      ticketSaleAvailabilityDate,
      ticketAvailabilityDate,
      openDate,
      startDate
    } = await this.generateDatesForCurrentTicket();
    const { place,
      capacity,
      latitude,
      longitude,
      price,
      description,
      city,
    } = initialData.presentations[0];
    const { idPresentation } = await this.presentationService.create({ place, eventId, capacity, latitude, longitude, price, description, city, ticketAvailabilityDate, ticketSaleAvailabilityDate, openDate, startDate, });
    return idPresentation;
  }

  async insertPresentationTicketUnavailable(eventId: string): Promise<string> {
    const {
      ticketSaleAvailabilityDate,
      ticketAvailabilityDate,
      openDate,
      startDate
    } = await this.generateDatesForFutureTicket();
    const { place,
      capacity,
      latitude,
      longitude,
      price,
      description,
      city,
    } = initialData.presentations[0];
    const { idPresentation } = await this.presentationService.create({ place, eventId, capacity, latitude, longitude, price, description, city, ticketAvailabilityDate, ticketSaleAvailabilityDate, openDate, startDate, });
    return idPresentation;
  }

  toColombiaDateString(date: Date): string {
    // Colombia está en UTC-5, así que restamos 5 horas
    const colombiaTime = new Date(date.getTime() - 5 * 60 * 60 * 1000);

    const year = colombiaTime.getFullYear();
    const month = String(colombiaTime.getMonth() + 1).padStart(2, '0');
    const day = String(colombiaTime.getDate()).padStart(2, '0');
    const hours = '07'; // fija a las 07:00:00 como pediste
    const minutes = '00';
    const seconds = '00';

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  async generateDatesForCurrentTicket() {
    const now = new Date();

    const ticketSaleAvailabilityDate = this.toColombiaDateString(new Date(now.getTime() - 2 * 86400000)); // hace 2 días
    const ticketAvailabilityDate = this.toColombiaDateString(new Date(now.getTime() - 1 * 86400000)); // ayer
    const openDate = this.toColombiaDateString(new Date(now.getTime() + 1 * 86400000)); // mañana
    const startDate = this.toColombiaDateString(new Date(now.getTime() + 2 * 86400000)); // pasado mañana

    return {
      ticketSaleAvailabilityDate,
      ticketAvailabilityDate,
      openDate,
      startDate
    };
  }


  async generateDatesForFutureTicket() {
    const now = new Date();

    const oneDayMs = 86400000;

    const ticketAvailabilityDate = this.toColombiaDateString(new Date(now.getTime() + 1 * oneDayMs)); // mañana
    const ticketSaleAvailabilityDate = this.toColombiaDateString(new Date(now.getTime())); // hoy
    const openDate = this.toColombiaDateString(new Date(now.getTime() + 2 * oneDayMs)); // pasado mañana
    const startDate = this.toColombiaDateString(new Date(now.getTime() + 3 * oneDayMs)); // en tres días

    return {
      ticketSaleAvailabilityDate,
      ticketAvailabilityDate,
      openDate,
      startDate
    };
  }


}
