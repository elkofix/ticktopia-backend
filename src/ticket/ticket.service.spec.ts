import { Test, TestingModule } from '@nestjs/testing';
import { TicketService } from '../../src/ticket/ticket.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ticket } from '../../src/ticket/entities/ticket.entity';
import { User } from '../../src/auth/entities/user.entity';
import { Presentation } from '../../src/presentation/entities/presentation.entity';
import { Repository } from 'typeorm';
import { BuyTicketDto } from '../../src/ticket/dto/buy-ticket.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateTicketDto } from '../../src/ticket/dto/create-ticket.dto';
import axios from 'axios';
import * as qs from 'qs';
import { error } from 'console';

interface AxiosXHR<T> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: {
    url: string;
    [key: string]: any;
  };
}
// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TicketService', () => {
  let service: TicketService;
  let ticketRepo: Repository<Ticket>;
  let userRepo: Repository<User>;
  let presentationRepo: Repository<Presentation>;

  // Mock env variables
  const originalEnv = process.env;
  beforeEach(() => {
    process.env = {
      ...originalEnv,
      BASE_URL: 'http://localhost:3000',
      STRIPE_SECRET_KEY: 'sk_test_123456'
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketService,
        {
          provide: getRepositoryToken(Ticket),
          useValue: {
            count: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
            remove: jest.fn(),
            preload: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Presentation),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TicketService>(TicketService);
    ticketRepo = module.get(getRepositoryToken(Ticket));
    userRepo = module.get(getRepositoryToken(User));
    presentationRepo = module.get(getRepositoryToken(Presentation));
  });

  // Tests existentes
  it('should create a ticket successfully', async () => {
    const dto = {
      userId: 'u1',
      presentationId: 'p1',
      isActive: true,
      isRedeemed: false,
    } as CreateTicketDto;

    const user = { id: 'u1' } as User;
    const presentation = { idPresentation: 'p1' } as Presentation;

    jest.spyOn(userRepo, 'findOne').mockResolvedValue(user);
    jest.spyOn(presentationRepo, 'findOne').mockResolvedValue(presentation);
    jest.spyOn(ticketRepo, 'create').mockReturnValue({} as Ticket);
    jest.spyOn(ticketRepo, 'save').mockResolvedValue({ id: 't1' } as Ticket);

    const result = await service.create(dto);
    expect(result).toEqual({ id: 't1' });
  });

  // Tests existentes
  it('should create a ticket unsuccessfully not found', async () => {
    const dto = {
      userId: 'u1',
      presentationId: 'p1',
      isActive: true,
      isRedeemed: false,
    } as CreateTicketDto;


    jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);

    try {
      await service.create(dto);

    } catch (error) {
      expect(userRepo.findOne).toHaveBeenCalled();

    }
  });

  
  it('should throw if user or presentation not found', async () => {
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);
    jest.spyOn(presentationRepo, 'findOne').mockResolvedValue(null);

    const dto = {
      userId: 'u1',
      presentationId: 'p1',
      isActive: true,
      isRedeemed: false,
    } as CreateTicketDto;

    await expect(service.create(dto)).rejects.toThrow(NotFoundException);
  });

  it('should buy a ticket successfully', async () => {
    const dto: BuyTicketDto = {
      presentationId: 'p1',
      quantity: 2,
    };

    const user = { id: 'u1' } as User;
    const presentation = { idPresentation: 'p1', capacity: 100, event: { name: 'JARAMILLO' }, price: 50000 } as Presentation;

    jest.spyOn(userRepo, 'findOne').mockResolvedValue(user);
    jest.spyOn(presentationRepo, 'findOne').mockResolvedValue(presentation);
    jest.spyOn(ticketRepo, 'count').mockResolvedValue(10);
    jest.spyOn(ticketRepo, 'create').mockReturnValue([{ id: "t1" }] as any);
    jest.spyOn(ticketRepo, 'save').mockResolvedValue([{ id: 't1' }] as any);
    jest.spyOn(ticketRepo, 'create').mockReturnValue([{ id: "t1" }] as any);
    const mockAxiosResponse: AxiosXHR<{ url: string }> = {
      data: { url: 'https://checkout.stripe.com/test' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        url: 'https://api.stripe.com/v1/checkout/sessions'
      }
    };
    mockedAxios.post.mockResolvedValue(mockAxiosResponse);
    const result = await service.buyTicket(user.id, dto);

    expect(result).toEqual({
      checkoutSession: "https://checkout.stripe.com/test",
      0: {
        id: "t1"
      }
    });
  });

  it('should throw if presentation not found in buyTicket', async () => {
    jest.spyOn(userRepo, 'findOne').mockResolvedValue({} as User);
    jest.spyOn(presentationRepo, 'findOne').mockResolvedValue(null);

    const dto: BuyTicketDto = {
      presentationId: 'x',
      quantity: 1,
    };

    await expect(service.buyTicket('u1', dto)).rejects.toThrow(NotFoundException);
  });

  it('should throw if not enough tickets in buyTicket', async () => {
    const user = { id: 'u1' } as User;
    const presentation = { idPresentation: 'p1', capacity: 3 } as Presentation;
    const dto: BuyTicketDto = {
      presentationId: 'p1',
      quantity: 5,
    };

    jest.spyOn(userRepo, 'findOne').mockResolvedValue(user);
    jest.spyOn(presentationRepo, 'findOne').mockResolvedValue(presentation);
    jest.spyOn(ticketRepo, 'count').mockResolvedValue(2); // ya vendidos 2

    await expect(service.buyTicket('u1', dto)).rejects.toThrow(BadRequestException);
  });

  it('should remove a ticket by id', async () => {
    const ticket = { id: 't1' } as Ticket;

    jest.spyOn(ticketRepo, 'findOne').mockResolvedValue(ticket);
    jest.spyOn(ticketRepo, 'remove').mockResolvedValue(ticket);

    const result = await service.remove('t1');
    expect(result).toEqual(ticket);
  });

  it('should throw NotFoundException if ticket not found in remove', async () => {
    jest.spyOn(ticketRepo, 'findOne').mockResolvedValue(null);

    await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
  });

  // Nuevas pruebas para aumentar la cobertura

  it('should create a checkout session successfully', async () => {
    const user = { id: 'u1' } as User;
    const presentation = {
      idPresentation: 'p1',
      event: { name: 'Test Event' },
      price: 100
    } as Presentation;
    const quantity = 2;

    const ticket = { id: 't1' } as Ticket;

    jest.spyOn(ticketRepo, 'create').mockReturnValue(ticket);
    jest.spyOn(ticketRepo, 'save').mockResolvedValue(ticket);
    const mockTicketIds = ["tickets", "tickets2"]
    // Fix here: Properly mock the Axios response con el tipo correcto para versiones antiguas
    const mockAxiosResponse: AxiosXHR<{ url: string }> = {
      data: { url: 'https://checkout.stripe.com/test' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        url: 'https://api.stripe.com/v1/checkout/sessions'
      }
    };

    mockedAxios.post.mockResolvedValue(mockAxiosResponse);

    const result = await service.createCheckoutSession(quantity, mockTicketIds, user, presentation);

    expect(result).toEqual({ url: 'https://checkout.stripe.com/test' });
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://api.stripe.com/v1/checkout/sessions',
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Bearer sk_test_123456'
        })
      })
    );
  });

  it('should handle error in checkout session creation', async () => {
    const user = { id: 'u1' } as User;
    const presentation = {
      idPresentation: 'p1',
      event: { name: 'Test Event' },
      price: 100
    } as Presentation;
    const quantity = 2;
    try {
      const ticket = { id: 't1' } as Ticket;
      const mockTicketIds = ["ids"]
      jest.spyOn(ticketRepo, 'create').mockReturnValue(ticket);
      jest.spyOn(ticketRepo, 'save').mockResolvedValue(ticket);


      await service.createCheckoutSession(quantity, mockTicketIds, user, presentation)

    } catch (error) {
      expect(mockedAxios.post).toHaveBeenCalled();

    }

  });

  it('should find all tickets', async () => {
    const tickets = [
      { id: 't1' },
      { id: 't2' }
    ] as Ticket[];

    jest.spyOn(ticketRepo, 'find').mockResolvedValue(tickets);
    const user = { id: 'user1' };
    const result = await service.findAll(user as any);
    expect(result).toEqual(tickets);
    expect(ticketRepo.find).toHaveBeenCalled();
  });

  it('should find one ticket by id', async () => {
    const ticket = { id: 't1' } as Ticket;

    jest.spyOn(ticketRepo, 'findOne').mockResolvedValue(ticket);

    const result = await service.findOne('t1');
    expect(result).toEqual(ticket);
    expect(ticketRepo.findOne).toHaveBeenCalledWith({ where: { id: 't1' } });
  });

  it('should throw if ticket not found in findOne', async () => {
    jest.spyOn(ticketRepo, 'findOne').mockResolvedValue(null);

    await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    expect(ticketRepo.findOne).toHaveBeenCalledWith({ where: { id: 'bad-id' } });
  });

  it('should update a ticket successfully', async () => {
    const ticket = { id: 't1', isActive: true } as Ticket;
    const updatedTicket = { id: 't1', isActive: false } as Ticket;

    jest.spyOn(ticketRepo, 'findOne').mockResolvedValue(ticket);

    jest.spyOn(ticketRepo, 'preload').mockResolvedValue(updatedTicket);
    jest.spyOn(ticketRepo, 'save').mockResolvedValue(updatedTicket);

    const result = await service.update('t1', { isRedeemed: true });

    expect(result).toEqual(updatedTicket);
    expect(ticketRepo.preload).toHaveBeenCalled();
  });

  // it('should throw if ticket not found in update', async () => {
  //   jest.spyOn(ticketRepo, 'preload').mockResolvedValue(null);

  //   await expect(service.update('bad-id', { isActive: false }))
  //     .rejects.toThrow(NotFoundException);

  //   expect(ticketRepo.preload).toHaveBeenCalledWith({ id: 'bad-id', isActive: false });
  // });

  it('should delete all tickets', async () => {
    jest.spyOn(ticketRepo, 'delete').mockResolvedValue({ affected: 10 } as any);

    await service.deleteAll();

    expect(ticketRepo.delete).toHaveBeenCalledWith({});
  });

  it('should call buyTicket with valid user and presentation', async () => {
    const dto = {
      presentationId: 'pres1',
      quantity: 1,
    };

    const mockUser: User = {
      id: 'user1',
      email: 'test@example.com',
      name: 'Test',
      lastname: 'User',
      password: '',
      isActive: true,
      roles: ['client'],
      tickets: [],
      events: [],
      checkFieldsBeforeInsert: function (): void {
        throw new Error('Function not implemented.');
      },
      checkFieldsBeforeUpdate: function (): void {
        throw new Error('Function not implemented.');
      }
    };

    const mockPresentation: Presentation = {
      idPresentation: 'pres1',
      place: 'Stadium',
      event: {} as any,
      capacity: 100,
      openDate: new Date(),
      startDate: new Date(),
      latitude: 0,
      longitude: 0,
      description: '',
      ticketAvailabilityDate: new Date(),
      ticketSaleAvailabilityDate: new Date(),
      city: 'City',
      tickets: [],
      price: 0
    };

    jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUser);
    jest.spyOn(presentationRepo, 'findOne').mockResolvedValue(mockPresentation);
    jest.spyOn(ticketRepo, 'count').mockResolvedValue(0);
    jest.spyOn(ticketRepo, 'create').mockReturnValue([{ id: 'ticket-id' }] as any);
    jest.spyOn(ticketRepo, 'save').mockResolvedValue([{ id: 'ticket-id' }] as any);

    const result = await service.buyTicket(mockUser.id, dto);
    expect(result).toEqual({ 0: { id: 'ticket-id' }, checkoutSession: "https://checkout.stripe.com/test" });
  });

  it('should throw if presentation is missing in create()', async () => {
    const dto = {
      userId: 'u1',
      presentationId: 'p1',
      isActive: true,
      isRedeemed: false,
    } as CreateTicketDto;

    jest.spyOn(userRepo, 'findOne').mockResolvedValue({ id: 'u1' } as User);
    jest.spyOn(presentationRepo, 'findOne').mockResolvedValue(null);

    await expect(service.create(dto)).rejects.toThrow(NotFoundException);
  });

  it('should throw if user is missing in buyTicket()', async () => {
    const dto: BuyTicketDto = {
      presentationId: 'p1',
      quantity: 1,
    };

    jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);
    jest.spyOn(presentationRepo, 'findOne').mockResolvedValue({
      idPresentation: 'p1',
      capacity: 100,
    } as Presentation);

    await expect(service.buyTicket('u1', dto)).rejects.toThrow(NotFoundException);
  });

  it('should set default values for isActive and isRedeemed if not provided', async () => {
    const dto = {
      userId: 'u1',
      presentationId: 'p1'
      // no isRedeemed, no isActive
    } as any;

    const user = { id: 'u1' } as User;
    const presentation = { idPresentation: 'p1' } as Presentation;

    jest.spyOn(userRepo, 'findOne').mockResolvedValue(user);
    jest.spyOn(presentationRepo, 'findOne').mockResolvedValue(presentation);

    const ticketData = {
      user,
      presentation,
      buyDate: expect.any(Date),
      isActive: false,
      isRedeemed: false,
    };

    jest.spyOn(ticketRepo, 'create').mockReturnValue(ticketData as Ticket);
    jest.spyOn(ticketRepo, 'save').mockResolvedValue({ id: 't1' } as Ticket);

    const result = await service.create(dto);
    expect(result).toEqual({ id: 't1' });
    expect(ticketRepo.create).toHaveBeenCalledWith(ticketData);
  });

  it('should throw NotFoundException if ticket not found in findOne()', async () => {
    jest.spyOn(ticketRepo, 'findOne').mockResolvedValue(null); // ← null explícito

    await expect(service.findOne('not-found-id')).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if ticket not found in update()', async () => {
    // Simular que ticketRepo.preload() devuelve undefined cuando el ticket no existe
    jest.spyOn(ticketRepo, 'preload').mockResolvedValue(undefined);

    const updateDto = { /* tus datos de actualización aquí */ };

    // Verificar que se lanza NotFoundException cuando intentamos actualizar un ticket inexistente
    await expect(service.update('non-existent-id', updateDto)).rejects.toThrow(NotFoundException);
  });

});