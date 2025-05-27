import { Injectable, Logger, NotFoundException, InternalServerErrorException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { User } from '../auth/entities/user.entity';
import { DataSource, DeepPartial, Repository } from 'typeorm';
// Removed duplicate import of CreateEventDto
import { isUUID } from 'class-validator';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class EventService {
  private readonly logger = new Logger('EventService');

  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

  ) { }

  async create(createEventDto: CreateEventDto & { userId: string }) {
    try {
      const user = await this.userRepository.findOneBy({ id: createEventDto.userId });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const allowedRoles = [ValidRoles.eventManager, ValidRoles.admin];
      const hasPermission = user.roles.some(role => allowedRoles.includes(role as ValidRoles));

      if (!hasPermission) {
        throw new ForbiddenException('User does not have permission to create an event');
      }

      const newEvent = this.eventRepository.create(createEventDto);
      const createdEvent = await this.eventRepository.save({ ...newEvent, user });

      // 🧹 Eliminar manualmente el password antes de enviar la respuesta
      if (createdEvent.user) {
        delete createdEvent.user.password;
      }

      // 🧾 Transformar el objeto en uno plano si usas class-transformer
      return instanceToPlain(createdEvent);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error('Error creating event', error.stack);
      throw new InternalServerErrorException('Error creating event');
    }
  }


  async update(id: string, updateEventDto: UpdateEventDto, user: User) {
    try {
      const event = await this.eventRepository.findOne({
        where: { id },
        relations: { user: true }
      });

      if (!event) {
        throw new NotFoundException(`Event with ID ${id} not found`);
      }

      if (event.user.id !== user.id) {
        throw new ForbiddenException('You can only update your own events');
      }
      const hasTickets = await this.hasAnyPresentationWithTickets(event.id);
      if (hasTickets && updateEventDto.isPublic === false) {
        throw new BadRequestException("You cannot change visibility of an event with existing tickets");
      }

      await this.eventRepository.update(id, updateEventDto);
      const updatedEvent = await this.findOneUnrestricted(id);
      return updatedEvent;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Error updating event with ID ${id}`, error.stack);
      throw new InternalServerErrorException('Error updating event');
    }
  }

  async remove(id: string, user: User) {
    try {
      const event = await this.eventRepository.findOne({
        where: { id },
        relations: { user: true }
      });

      if (!event) {
        throw new NotFoundException(`Event with ID ${id} not found`);
      }


      if (event.user.id !== user.id) {
        throw new ForbiddenException('You can only delete your own events');
      }
      const hasTickets = await this.hasAnyPresentationWithTickets(event.id);

      if (hasTickets) {
        throw new BadRequestException("You cannot delete an event with existing tickets");
      }

      await this.eventRepository.remove(event);
      return event;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;  // Re-throw expected exceptions
      }
      this.logger.error(error.detail || error.message);
      this.handleExceptions(error);
      throw new InternalServerErrorException('Unexpected error occurred during event removal');  // Ensure error is thrown
    }
  }

  async findOneUnrestricted(term: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: [{ id: term}, { name: term }],
      relations: ['user'],
    });

    if (!event) {
      throw new NotFoundException(`Event with id or name "${term}" not found`);
    }

    return event;
  }

  async findOne(term: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: [{ id: term, isPublic: true }, { name: term }],
      relations: ['user'],
    });

    if (!event) {
      throw new NotFoundException(`Event with id or name "${term}" not found`);
    }

    return event;
  }

  async hasAnyPresentationWithTickets(eventId: string): Promise<boolean> {
    const result = await this.eventRepository
      .createQueryBuilder()
      .select('1')
      .from('presentation', 'presentation')
      .innerJoin('ticket', 'ticket', 'ticket.presentationIdPresentation = presentation.idPresentation')
      .where('presentation.eventId = :eventId', { eventId })
      .limit(1)
      .getRawOne();

    return !!result;
  }



  async findAll(limit = 10, offset = 0) {
    try {
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

      const events = await this.eventRepository
        .createQueryBuilder('event')
        .leftJoinAndSelect('event.user', 'user')
        .leftJoinAndSelect('event.presentations', 'presentation')
        .where('presentation.openDate >= :twelveHoursAgo', { twelveHoursAgo })
        .andWhere('event.isPublic = :isPublic', { isPublic: true })
        .take(limit)
        .skip(offset)
        .getMany();

      return instanceToPlain(events);
    } catch (error) {
      this.handleExceptions(error);
    }
  }



  async findAllByUserId(userId: string) {
    try {
      const events = await this.eventRepository.find({
        where: { user: { id: userId } }
      });

      return events;
    } catch (error) {
      this.logger.error(`Error fetching events for user ${userId}`, error.stack);
      throw new InternalServerErrorException('Error fetching events for user');
    }
  }

  async deleteAll() {
    try {
      await this.eventRepository.delete({});
      return { message: `All events deleted successfully` };
    } catch (error) {
      this.logger.error('Error deleting all events', error.stack);
      throw new InternalServerErrorException('Error deleting all events');
    }
  }

  private handleExceptions(error: any): never {
    if (error.code === "23505")
      throw new BadRequestException(error.detail);

    this.logger.error(error.detail);
    throw new InternalServerErrorException('Unexpected error, check your server');
  }
}