import { Test, TestingModule } from '@nestjs/testing';
import { PresentationController } from '../../src/presentation/presentation.controller';
import { PresentationService } from '../../src/presentation/presentation.service';
import { NotFoundException, Logger } from '@nestjs/common';
import { CreatePresentationDto } from '../../src/presentation/dto/create-presentation.dto';
import { UpdatePresentationDto } from '../../src/presentation/dto/update-presentation.dto';

// Mock para el decorador Auth
jest.mock('../../src/auth/decorators/auth.decorator', () => ({
  Auth: (...roles) => jest.fn((target, key, descriptor) => descriptor),
}));

describe('PresentationController', () => {
  let controller: PresentationController;
  let service: PresentationService;

  // Mock más completo del servicio
  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PresentationController],
      providers: [
        {
          provide: PresentationService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PresentationController>(PresentationController);
    service = module.get<PresentationService>(PresentationService);

    // Mock para Logger
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    const createDto: CreatePresentationDto = { 
      place: 'Atanasio Girardot',
      capacity: 500,
      openDate: '2025-05-06T08:00:00Z',
      startDate: '2025-05-06T10:00:00Z',
      price: 50000,
      latitude: 6.25184,
      longitude: -75.56359,
      description: 'A musical event in the main stadium.',
      ticketAvailabilityDate: '2025-04-20T00:00:00Z',
      ticketSaleAvailabilityDate: '2025-04-25T00:00:00Z',
      city: 'Medellín',
      eventId: '773701cb-ed1d-41fd-9921-7c56e0a6fcbd'
    };
    const createdPresentation = { 
      id: 'p1', 
      ...createDto 
    };

    it('should return created presentation', async () => {
      mockService.create.mockResolvedValue(createdPresentation);

      const result = await controller.create(createDto);
      
      expect(result).toEqual(createdPresentation);
      expect(mockService.create).toHaveBeenCalledWith(createDto);
    });

    it('should log and throw error on failure', async () => {
      const error = new Error('Database error');
      mockService.create.mockRejectedValue(error);
      
      await expect(controller.create(createDto)).rejects.toThrow('Database error');
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Error creating presentation', 
        error.stack
      );
    });
  });

  describe('findAll()', () => {
    const presentations = [
      {
        id: 'p1',
        place: 'Atanasio Girardot',
        capacity: 500,
        openDate: '2025-05-06T08:00:00Z',
        startDate: '2025-05-06T10:00:00Z',
        price: 50000,
        latitude: 6.25184,
        longitude: -75.56359,
        description: 'A musical event in the main stadium.',
        ticketAvailabilityDate: '2025-04-20T00:00:00Z',
        ticketSaleAvailabilityDate: '2025-04-25T00:00:00Z',
        city: 'Medellín',
        eventId: '773701cb-ed1d-41fd-9921-7c56e0a6fcbd'
      },
      {
        id: 'p2',
        place: 'Teatro Metropolitano',
        capacity: 1200,
        openDate: '2025-06-10T18:00:00Z',
        startDate: '2025-06-10T19:30:00Z',
        price: 75000,
        latitude: 6.24432,
        longitude: -75.57657,
        description: 'Classical concert at the Metropolitan Theater.',
        ticketAvailabilityDate: '2025-05-15T00:00:00Z',
        ticketSaleAvailabilityDate: '2025-05-20T00:00:00Z',
        city: 'Medellín',
        eventId: '873701cb-ed1d-41fd-9921-7c56e0a6fcbd'
      }
    ];

    it('should return all presentations', async () => {
      mockService.findAll.mockResolvedValue(presentations);
      
      const result = await controller.findAll();
      
      expect(result).toEqual(presentations);
      expect(mockService.findAll).toHaveBeenCalled();
    });

    it('should log and throw error on service failure', async () => {
      const error = new Error('fetch fail');
      mockService.findAll.mockRejectedValue(error);
      
      await expect(controller.findAll()).rejects.toThrow('fetch fail');
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Error fetching presentations', 
        error.stack
      );
    });
  });

  describe('findOne()', () => {
    const presentation = { 
      id: 'p1', 
      place: 'Atanasio Girardot',
      capacity: 500,
      openDate: '2025-05-06T08:00:00Z',
      startDate: '2025-05-06T10:00:00Z',
      price: 50000,
      latitude: 6.25184,
      longitude: -75.56359,
      description: 'A musical event in the main stadium.',
      ticketAvailabilityDate: '2025-04-20T00:00:00Z',
      ticketSaleAvailabilityDate: '2025-04-25T00:00:00Z',
      city: 'Medellín',
      eventId: '773701cb-ed1d-41fd-9921-7c56e0a6fcbd'
    };
    const presentationId = 'p1';

    it('should return one presentation', async () => {
      mockService.findOne.mockResolvedValue(presentation);
      
      const result = await controller.findOne(presentationId);
      
      expect(result).toEqual(presentation);
      expect(mockService.findOne).toHaveBeenCalledWith(presentationId);
    });

    it('should throw NotFound if presentation is not found', async () => {
      mockService.findOne.mockResolvedValue(null);
      
      await expect(controller.findOne('bad-id')).rejects.toThrow(
        new NotFoundException('Presentation with ID bad-id not found')
      );
      expect(mockService.findOne).toHaveBeenCalledWith('bad-id');
    });

    it('should log and throw error if service throws', async () => {
      const error = new Error('lookup fail');
      mockService.findOne.mockRejectedValue(error);
      
      await expect(controller.findOne(presentationId)).rejects.toThrow('lookup fail');
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        `Error fetching presentation with ID ${presentationId}`, 
        error.stack
      );
    });
  });

  describe('update()', () => {
    const presentationId = 'p1';
    const updateDto: UpdatePresentationDto = { 
      place: 'Updated Place',
      capacity: 600,
      price: 60000,
      description: 'Updated description for the event'
    };
    const updatedPresentation = { 
      id: 'p1', 
      place: 'Updated Place',
      capacity: 600,
      openDate: '2025-05-06T08:00:00Z',
      startDate: '2025-05-06T10:00:00Z',
      price: 60000,
      latitude: 6.25184,
      longitude: -75.56359,
      description: 'Updated description for the event',
      ticketAvailabilityDate: '2025-04-20T00:00:00Z',
      ticketSaleAvailabilityDate: '2025-04-25T00:00:00Z',
      city: 'Medellín',
      eventId: '773701cb-ed1d-41fd-9921-7c56e0a6fcbd'
    };

    it('should first check if presentation exists', async () => {
      mockService.findOne.mockResolvedValue(presentationId);
      mockService.update.mockResolvedValue(updatedPresentation);
      
      await controller.update(presentationId, updateDto);
      
      expect(mockService.findOne).toHaveBeenCalledWith(presentationId);
    });

    it('should return updated presentation', async () => {
      mockService.findOne.mockResolvedValue({ id: presentationId });
      mockService.update.mockResolvedValue(updatedPresentation);
      
      const result = await controller.update(presentationId, updateDto);
      
      expect(result).toEqual(updatedPresentation);
      expect(mockService.update).toHaveBeenCalledWith(presentationId, updateDto);
    });

    it('should throw NotFound if presentation not found', async () => {
      mockService.findOne.mockResolvedValue(null);
      
      await expect(controller.update(presentationId, updateDto)).rejects.toThrow(
        new NotFoundException(`Presentation with ID ${presentationId} not found`)
      );
      expect(mockService.update).not.toHaveBeenCalled();
    });

    it('should log and throw error if service throws', async () => {
      const error = new Error('update fail');
      mockService.findOne.mockResolvedValue({ id: presentationId });
      mockService.update.mockRejectedValue(error);
      
      await expect(controller.update(presentationId, updateDto)).rejects.toThrow('update fail');
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        `Error updating presentation with ID ${presentationId}`, 
        error.stack
      );
    });
  });

  describe('remove()', () => {
    const presentationId = 'p1';
    const presentation = { id: 'p1', title: 'Presentation', place: 'Place', eventId: 'e1' };

    it('should first check if presentation exists', async () => {
      mockService.findOne.mockResolvedValue(presentation);
      mockService.remove.mockResolvedValue(presentation);
      
      await controller.remove(presentationId);
      
      expect(mockService.findOne).toHaveBeenCalledWith(presentationId);
    });

    it('should return success message after deletion', async () => {
      mockService.findOne.mockResolvedValue(presentation);
      mockService.remove.mockResolvedValue(presentation);
      
      const result = await controller.remove(presentationId);
      
      expect(result).toEqual({ 
        message: `Presentation with ID ${presentationId} has been deleted successfully` 
      });
      expect(mockService.remove).toHaveBeenCalledWith(presentationId);
    });

    it('should throw NotFound if presentation not found', async () => {
      mockService.findOne.mockResolvedValue(null);
      
      await expect(controller.remove(presentationId)).rejects.toThrow(
        new NotFoundException(`Presentation with ID ${presentationId} not found`)
      );
      expect(mockService.remove).not.toHaveBeenCalled();
    });

    it('should log and throw error if service throws', async () => {
      const error = new Error('remove fail');
      mockService.findOne.mockResolvedValue(presentation);
      mockService.remove.mockRejectedValue(error);
      
      await expect(controller.remove(presentationId)).rejects.toThrow('remove fail');
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        `Error deleting presentation with ID ${presentationId}`, 
        error.stack
      );
    });
  });
});