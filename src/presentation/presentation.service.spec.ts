import { Test, TestingModule } from '@nestjs/testing';
import { PresentationService } from '../../src/presentation/presentation.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Presentation } from '../../src/presentation/entities/presentation.entity';
import { Event } from '../../src/event/entities/event.entity';
import { Repository } from 'typeorm';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('PresentationService', () => {
  let service: PresentationService;
  let presentationRepo: jest.Mocked<Repository<Presentation>>;
  let eventRepo: jest.Mocked<Repository<Event>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PresentationService,
        {
          provide: getRepositoryToken(Presentation),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Event),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PresentationService>(PresentationService);
    presentationRepo = module.get(getRepositoryToken(Presentation));
    eventRepo = module.get(getRepositoryToken(Event));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // it('should create a presentation successfully', async () => {
  //   const dto = { eventId: '1', place: 'Test' } as any;
  //   const event = { id: '1' } as Event;

  //   eventRepo.findOneBy.mockResolvedValue(event);
  //   presentationRepo.create.mockReturnValue({ ...dto, event });
  //   presentationRepo.save.mockResolvedValue({ idPresentation: 'p1' });

  //   const result = await service.create(dto);
  //   expect(result).toEqual({ idPresentation: 'p1' });
  // });

  it('should throw if event not found in create', async () => {
    eventRepo.findOneBy.mockResolvedValue(null);
    await expect(service.create({ eventId: 'nope' } as any)).rejects.toThrow(NotFoundException);
  });

  it('should find all presentations', async () => {
    presentationRepo.find.mockResolvedValue([{ idPresentation: 'p1' } as Presentation]);
    const result = await service.findAll();
    expect(result).toEqual([{ idPresentation: 'p1' }]);
  });

  it('should throw on error in findAll', async () => {
    presentationRepo.find.mockRejectedValue(new Error('DB error'));
    await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);
  });

  it('should find one presentation by id', async () => {
    presentationRepo.findOne.mockResolvedValue({ idPresentation: 'p1' } as Presentation);
    const result = await service.findOne('p1');
    expect(result).toEqual({ idPresentation: 'p1' });
  });

  it('should throw on error in findOne', async () => {
    presentationRepo.findOne.mockRejectedValue(new Error('DB fail'));
    await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
  });

  it('should update a presentation', async () => {
    const updated = { idPresentation: 'p1', place: 'new place' } as Presentation;
    jest.spyOn(service, 'findOne').mockResolvedValue(updated);
    const result = await service.update('p1', { place: 'new place' });
    expect(result).toEqual(updated);
    expect(presentationRepo.update).toHaveBeenCalledWith('p1', { place: 'new place' });
  });

  it('should remove a presentation', async () => {
    const presentation = { idPresentation: 'p1' } as Presentation;
    jest.spyOn(service, 'findOne').mockResolvedValue(presentation);
    presentationRepo.remove.mockResolvedValue(presentation);
    const result = await service.remove('p1');
    expect(result).toEqual(presentation);
  });

  it('should throw if error in remove', async () => {
    jest.spyOn(service, 'findOne').mockRejectedValue(new Error('fail'));
    await expect(service.remove('p1')).rejects.toThrow(InternalServerErrorException);
  });

  it('should delete all presentations', async () => {
    presentationRepo.delete.mockResolvedValue({ affected: 10 } as any);
    const result = await service.deleteAll();
    expect(result).toEqual({ message: 'All presentations have been deleted successfully' });
  });

  it('should throw InternalServerErrorException if save fails in create()', async () => {
    const dto = { eventId: 'e1', place: 'Test' } as any;
    const event = { id: 'e1' } as Event;

    eventRepo.findOneBy.mockResolvedValue(event);
    presentationRepo.create.mockReturnValue({ ...dto, event });

    presentationRepo.save.mockRejectedValue(new Error('save error'));

    await expect(service.create(dto)).rejects.toThrow(InternalServerErrorException);
  });

  it('should throw InternalServerErrorException if update fails', async () => {
    presentationRepo.update.mockRejectedValue(new Error('update error'));

    await expect(service.update('p1', { place: 'updated' } as any))
      .rejects.toThrow(InternalServerErrorException);
  });

  it('should throw InternalServerErrorException if findOne fails in remove', async () => {
    jest.spyOn(service, 'findOne').mockRejectedValue(new Error('findOne fail'));

    await expect(service.remove('p1')).rejects.toThrow(InternalServerErrorException);
  });

  it('should throw InternalServerErrorException if deleteAll fails', async () => {
    presentationRepo.delete.mockRejectedValue(new Error('delete error'));

    await expect(service.deleteAll()).rejects.toThrow(InternalServerErrorException);
  });

  it('should return the newly created presentation', async () => {
    const dto = { eventId: 'e1', place: 'Test' } as any;
    const event = { id: 'e1' } as Event;
    const created = { idPresentation: 'p1', ...dto, event };

    eventRepo.findOneBy.mockResolvedValue(event);
    presentationRepo.create.mockReturnValue(created);
    presentationRepo.save.mockResolvedValue(created);

    const result = await service.create(dto);
    expect(result).toEqual(created); // <- esta línea cubre el return
  });

  it('should throw NotFoundException if presentation does not exist in remove()', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue(null);
    await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
  });



});
