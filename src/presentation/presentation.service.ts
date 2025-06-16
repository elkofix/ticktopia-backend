import { Injectable, Logger, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Presentation } from './entities/presentation.entity';
import { CreatePresentationDto } from './dto/create-presentation.dto';
import { UpdatePresentationDto } from './dto/update-presentation.dto';
import { Event } from '../event/entities/event.entity';

@Injectable()
export class PresentationService {
  private readonly logger = new Logger('PresentationService');

  constructor(
    @InjectRepository(Presentation)
    private readonly presentationRepository: Repository<Presentation>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) { }

  async create(createPresentationDto: Omit<CreatePresentationDto, 'validDates'>) {
    const event = await this.eventRepository.findOneBy({ id: createPresentationDto.eventId });

    if (!event) {
      throw new NotFoundException(`Event with ID ${createPresentationDto.eventId} not found`);
    }

    try {
      const newPresentation = this.presentationRepository.create({ ...createPresentationDto, event });
      await this.presentationRepository.save(newPresentation);
      return newPresentation;
    } catch (error) {
      this.logger.error('Error creating presentation', error.stack);
      throw new InternalServerErrorException('Error creating presentation');
    }
  }


  async findAll() {
    try {
      const presentations = await this.presentationRepository.find();
      return presentations;
    } catch (error) {
      this.logger.error('Error fetching presentations', error.stack);
      throw new InternalServerErrorException('Error fetching presentations');
    }
  }

  async hasTickets(id: string): Promise<boolean> {
    try {
      const presentation = await this.presentationRepository.findOne({
        where: { idPresentation: id },
        relations: ['tickets'], // Cargar los tickets relacionados
      });

      if (!presentation) {
        throw new NotFoundException(`Presentation with ID ${id} not found`);
      }

      return presentation.tickets.length > 0;
    } catch (error) {
      this.logger.error(`Error checking tickets for presentation ID ${id}`, error.stack);
      throw error;
    }
  }


  async findOneUnRestricted(id: string) {
    try {
      const presentation = await this.presentationRepository.findOne({ where: { idPresentation: id }, relations: ['event'], });
      return presentation;
    } catch (error) {
      this.logger.error(`Error fetching presentation with ID ${id}`, error.stack);
      throw new NotFoundException(`Presentation with ID ${id} not found`);
    }
  }

  async findOne(id: string) {
    try {
      const presentation = await this.presentationRepository.findOne({
        where: {
          idPresentation: id, event: { isPublic: true },
        }, relations: ['event'],
      });
      return presentation;
    } catch (error) {
      this.logger.error(`Error fetching presentation with ID ${id}`, error.stack);
      throw new NotFoundException(`Presentation with ID ${id} not found`);
    }
  }


  async findByEventIdForManager(eventId: string): Promise<Presentation[]> {
    try {
      const presentations = await this.presentationRepository.find({
        where: {
          event: { id: eventId},
        }, relations: ['event'],
      });

      return presentations;
    } catch (error) {
      this.logger.error(`Error fetching presentations for public event with ID ${eventId}`, error.stack);
      throw new InternalServerErrorException('Error fetching presentations for public event');
    }
  }

  async findByEventId(eventId: string): Promise<Presentation[]> {
    try {
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

      const presentations = await this.presentationRepository
        .createQueryBuilder('presentation')
        .leftJoinAndSelect('presentation.event', 'event')           // trae el evento
        .leftJoinAndSelect('event.user', 'user')                    // trae el usuario del evento
        .where('event.id = :eventId', { eventId })
        .andWhere('event.isPublic = true')                          // solo eventos públicos
        .andWhere('presentation.openDate >= :twelveHoursAgo', { twelveHoursAgo })
        .getMany();

      if (presentations.length === 0) {
        this.logger.warn(`No presentations found for public event with ID ${eventId}`);
        return [];
      }

      return presentations;
    } catch (error) {
      this.logger.error(`Error fetching presentations for public event with ID ${eventId}`, error.stack);
      throw new InternalServerErrorException('Error fetching presentations for public event');
    }
  }




  async update(id: string, updatePresentationDto: UpdatePresentationDto) {
    try {
      await this.presentationRepository.update(id, updatePresentationDto);
      const updatedPresentation = await this.findOneUnRestricted(id);
      return updatedPresentation;
    } catch (error) {
      this.logger.error(`Error updating presentation with ID ${id}`, error.stack);
      throw new InternalServerErrorException('Error updating presentation');
    }
  }

  async remove(id: string) {
    // Verificamos si la presentación existe
    const presentationToRemove = await this.findOneUnRestricted(id);

    const hasTickets = await this.hasTickets(id)

    if (hasTickets) {
      throw new BadRequestException("No se puede eliminar una presentación que tiene tickets asociados");
    }

    await this.presentationRepository.remove(presentationToRemove!);
    return presentationToRemove;

  }


  async deleteAll(): Promise<{ message: string }> {
    try {
      await this.presentationRepository.delete({}); // TRUNCATE equivalent
      return { message: 'All presentations have been deleted successfully' };
    } catch (error) {
      this.logger.error('Error deleting all presentations', error.stack);
      throw new InternalServerErrorException('Error deleting all presentations');
    }
  }

}
