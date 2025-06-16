import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { NotFoundException, ForbiddenException, InternalServerErrorException, BadRequestException } from '@nestjs/common';

describe('EventService', () => {
  let service: EventService;
  let eventRepo: Repository<Event>;
  let userRepo: Repository<User>;

  const mockEventRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    })),
  };

  const mockUserRepo = {
    findOneBy: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: getRepositoryToken(Event), useValue: mockEventRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    eventRepo = module.get<Repository<Event>>(getRepositoryToken(Event));
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an event if user is authorized', async () => {
      const dto: CreateEventDto = {  name: 'Event 1', bannerPhotoUrl: "url", isPublic: true};
      const user = { id: '123', roles: [ValidRoles.eventManager] } as User;
      const event = { 
        ...dto, 
        user,
        id: 'event-123',
        tickets: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        presentations: [],
        checkFieldsBeforeInsert: jest.fn(),
        checkFieldsBeforeUpdate: jest.fn(),
        bannerPhotoUrl: 'url',
        isPublic: true
      } as Event;

      mockUserRepo.findOneBy.mockResolvedValue(user);
      mockEventRepo.create.mockReturnValue(dto);
      mockEventRepo.save.mockResolvedValue(event);

      await service.create({...dto, userId: user.id});

      expect(mockEventRepo.save).toHaveBeenCalledWith({ ...dto, user });
    });

    it('should throw InternalServerErrorException if an unexpected error occurs', async () => {
      // Forzamos un error al momento de crear el evento
      mockUserRepo.findOneBy.mockResolvedValue({
        id: '123',
        roles: [ValidRoles.admin],
      });

      mockEventRepo.create.mockImplementation(() => {
        throw new Error('Unexpected DB failure');
      });

      const loggerErrorSpy = jest.spyOn(service['logger'], 'error').mockImplementation();

      await expect(
        service.create({ userId: '123' } as any)
      ).rejects.toThrow(InternalServerErrorException);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Error creating event',
        expect.stringContaining('Unexpected DB failure')
      );
    });


    it('should throw if user does not exist', async () => {
      mockUserRepo.findOneBy.mockResolvedValue(null);
      await expect(service.create({ userId: '123' } as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw if user has no permission', async () => {
      const user = { id: '123', roles: ['viewer'] } as User;
      mockUserRepo.findOneBy.mockResolvedValue(user);
      await expect(service.create({ userId: '123' } as any)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll', () => {
    it('should return list of events', async () => {
      mockEventRepo.find.mockResolvedValue(['event1']);
      const result = await service.findAll();
      expect(result).toEqual(['event1']);
    });

    it('should call handleExceptions when an error occurs in findAll', async () => {
      const error = new Error('Unexpected DB error');

      // Simulamos un error lanzado por el repositorio
      mockEventRepo.find.mockRejectedValue(error);

      // Espiamos la llamada a `handleExceptions`
      const handleExceptionsSpy = jest.spyOn(service as any, 'handleExceptions').mockImplementation();

      // Llamamos al método `findAll`, que debería disparar el error
      await service.findAll();

      // Verificamos que `handleExceptions` haya sido llamada con el error
      expect(handleExceptionsSpy).toHaveBeenCalledWith(error);
    });

  });

  describe('findAllByUserId', () => {
    it('should return events for a specific user', async () => {
      mockEventRepo.find.mockResolvedValue(['event1']);
      const result = await service.findAllByUserId('user-1');
      expect(result).toEqual(['event1']);
    });

    it('should log the error and throw InternalServerErrorException if repository throws', async () => {
      const userId = 'user-123';
      const error = new Error('Database failure');

      // Simula que find falla
      mockEventRepo.find.mockRejectedValue(error);

      // Espía el logger
      const loggerSpy = jest.spyOn(service['logger'], 'error').mockImplementation();

      await expect(service.findAllByUserId(userId)).rejects.toThrow(InternalServerErrorException);

      expect(loggerSpy).toHaveBeenCalledWith(
        `Error fetching events for user ${userId}`,
        error.stack
      );
    });

  });

  describe('findOne', () => {
    it('should return event by UUID', async () => {
      const mockEvent = {
        id: 'uuid',
        name: 'Test Event',
        user: { id: 'admin-id' },
      } as any;

      mockEventRepo.findOne.mockResolvedValue(mockEvent);

      const user = {
        id: 'admin-id',
        roles: [ValidRoles.admin],
      } as any;

      const result = await service.findOne('uuid', user);
      expect(result).toEqual(mockEvent);
    });



    it('should restrict access to event manager', async () => {
      const mockEvent = {
        id: 'uuid',
        name: 'Test Event',
        user: { id: 'owner-id' }, // no coincide con el user que hace la consulta
      } as any;

      mockEventRepo.findOne.mockResolvedValue(mockEvent);

      const eventManagerUser = {
        id: 'user-1',
        roles: [ValidRoles.eventManager],
      } as any;

      await expect(service.findOne('uuid', eventManagerUser)).rejects.toThrow(ForbiddenException);
    });




    it('should throw if event not found', async () => {
      mockEventRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('non-existent', { 
        id: 'user', 
        roles: [],
        email: 'test@example.com',
        name: 'Test',
        lastname: 'User',
        isActive: true,
        password: 'password',
        createdAt: new Date(),
        updatedAt: new Date(),
        events: [],
        tickets: [],
        checkFieldsBeforeInsert: jest.fn(),
        checkFieldsBeforeUpdate: jest.fn()
      } as User))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return updated event', async () => {
      const event = { id: '1', user: { id: 'user-1' } };
      mockEventRepo.findOne.mockResolvedValue(event);
      mockEventRepo.update.mockResolvedValue({});
      jest.spyOn(service, 'findOne').mockResolvedValue({ id: '1' } as any);

      const result = await service.update('1', { name: 'Updated' } as any, { id: 'user-1', roles: [ValidRoles.eventManager] } as User);
      expect(result).toEqual({ id: '1' });
    });

    it('should throw NotFoundException if event does not exist', async () => {
      mockEventRepo.findOne.mockResolvedValue(null);

      await expect(service.update('event-id', {} as any, { id: 'user-id', roles: [ValidRoles.admin] } as User))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if eventManager tries to update event not owned by them', async () => {
      const event = { id: 'event-id', user: { id: 'other-user-id' } };

      mockEventRepo.findOne.mockResolvedValue(event);

      const user = { id: 'user-id', roles: [ValidRoles.eventManager] } as User;

      await expect(service.update('event-id', {} as any, user)).rejects.toThrow(ForbiddenException);
    });

    it('should throw InternalServerErrorException if an unexpected error occurs', async () => {
      const event = { id: 'event-id', user: { id: 'user-id' } };

      mockEventRepo.findOne.mockResolvedValue(event);

      const user = { id: 'user-id', roles: [ValidRoles.admin] } as User;

      // Forzar error en update
      mockEventRepo.update.mockImplementation(() => {
        throw new Error('Unexpected DB error');
      });

      const loggerSpy = jest.spyOn(service['logger'], 'error').mockImplementation();

      await expect(service.update('event-id', {} as any, user)).rejects.toThrow(InternalServerErrorException);

      expect(loggerSpy).toHaveBeenCalledWith(
        'Error updating event with ID event-id',
        expect.stringContaining('Unexpected DB error')
      );
    });

  });

  describe('remove', () => {
    it('should remove event if user is owner or admin', async () => {
      const event = { id: '1', user: { id: 'user-1' } };
      mockEventRepo.findOne.mockResolvedValue(event);
      mockEventRepo.remove.mockResolvedValue(event);

      const result = await service.remove('1', { id: 'user-1', roles: [ValidRoles.eventManager] } as User);
      expect(result).toEqual(event);
    });

    it('should throw NotFoundException if event does not exist', async () => {
      mockEventRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('event-id', { id: 'user-id', roles: [ValidRoles.admin] } as User))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if eventManager tries to delete event not owned by them', async () => {
      const event = { id: 'event-id', user: { id: 'other-user-id' } };

      mockEventRepo.findOne.mockResolvedValue(event);

      const user = { id: 'user-id', roles: [ValidRoles.eventManager] } as User;

      await expect(service.remove('event-id', user)).rejects.toThrow(ForbiddenException);
    });

    it('should log error and handle exceptions if an unexpected error occurs', async () => {
      const event = { id: 'event-id', user: { id: 'user-id' } };

      mockEventRepo.findOne.mockResolvedValue(event);
      mockEventRepo.remove.mockRejectedValue(new Error('Unexpected DB error'));

      const user = { id: 'user-id', roles: [ValidRoles.admin] } as User;

      const loggerSpy = jest.spyOn(service['logger'], 'error').mockImplementation();

      // Ensure the exception is thrown
      await expect(service.remove('event-id', user)).rejects.toThrow(InternalServerErrorException);

      expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('Unexpected DB error'));
    });

    it('should throw InternalServerErrorException if an unexpected error occurs during event removal', async () => {
      const event = { id: 'event-id', user: { id: 'user-id' } };

      // Simulamos que la función `findOne` retorna un evento y que `remove` falla
      mockEventRepo.findOne.mockResolvedValue(event);
      mockEventRepo.remove.mockRejectedValue(new Error('Unexpected DB error'));  // Simulamos un error inesperado

      const user = { id: 'user-id', roles: [ValidRoles.admin] } as User;

      // Espiamos la llamada al logger y a handleExceptions
      const loggerSpy = jest.spyOn(service['logger'], 'error').mockImplementation();
      const handleExceptionsSpy = jest.spyOn(service as any, 'handleExceptions').mockImplementation();

      // Esperamos que se lance una excepción de tipo InternalServerErrorException
      await expect(service.remove('event-id', user)).rejects.toThrowError(InternalServerErrorException);

      // Verificamos que el logger y handleExceptions fueron llamados
      expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('Unexpected DB error'));
      expect(handleExceptionsSpy).toHaveBeenCalledWith(expect.any(Error));
    });

  });

  describe('deleteAll', () => {
    it('should delete all events', async () => {
      const events = [{ id: '1' }, { id: '2' }];
      mockEventRepo.find.mockResolvedValue(events);
      mockEventRepo.remove.mockResolvedValue(events);

      const result = await service.deleteAll();
      expect(result.message).toMatch(/All events deleted successfully/);
    });

    it('should log the error and throw InternalServerErrorException if an error occurs during deletion', async () => {
      const error = new Error('Unexpected DB error');
      // Simula fallo al hacer find()
      mockEventRepo.delete.mockRejectedValue(error);

      // Espía el logger
      const loggerSpy = jest.spyOn(service['logger'], 'error').mockImplementation();

      await expect(service.deleteAll()).rejects.toThrow(InternalServerErrorException);

      expect(loggerSpy).toHaveBeenCalledWith('Error deleting all events', error.stack);
    });

  });

  describe('handleExceptions', () => {
    it('should throw BadRequestException when error code is 23505', () => {
      const error = { code: '23505', detail: 'Duplicate key value violates unique constraint' };

      expect(() => {
        (service as any).handleExceptions(error);
      }).toThrowError(new BadRequestException(error.detail));
    });

  });
});