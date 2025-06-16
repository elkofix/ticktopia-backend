import { Test, TestingModule } from '@nestjs/testing';
import { TicketController } from '../../src/ticket/ticket.controller';
import { TicketService } from '../../src/ticket/ticket.service';
import { AuthService } from '../../src/auth/auth.service';
import { PresentationService } from '../../src/presentation/presentation.service';
import { User } from '../../src/auth/entities/user.entity';

describe('TicketController', () => {
  let controller: TicketController;
  let service: TicketService;
  let presentationService: PresentationService;

  const mockUser = { id: 'user1', roles: ['client'] } as User;

  const mockTicketService = {
    create: jest.fn().mockResolvedValue('ticket created'),
    buyTicket: jest.fn().mockResolvedValue('ticket bought'),
    findAll: jest.fn().mockResolvedValue(['ticket1', 'ticket2']),
    findOne: jest.fn().mockResolvedValue('ticket1'),
    remove: jest.fn().mockResolvedValue('ticket deleted'),
    update: jest.fn().mockResolvedValue('ticket updated'),
  };

  const mockAuthService = {
    findById: jest.fn().mockResolvedValue(mockUser),
  };

  const mockPresentationService = {
    findOne: jest.fn().mockResolvedValue({ idPresentation: 'pres1', capacity: 100 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketController],
      providers: [
        { provide: TicketService, useValue: mockTicketService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: PresentationService, useValue: mockPresentationService },
      ],
    }).compile();

    controller = module.get<TicketController>(TicketController);
    service = module.get<TicketService>(TicketService);
    presentationService = module.get<PresentationService>(PresentationService);
    
    // Restablecer mocks después de cada prueba
    jest.clearAllMocks();
    
    // Valor predeterminado para presentationService.findOne
    mockPresentationService.findOne.mockResolvedValue({ idPresentation: 'pres1', capacity: 100 });
  });

  it('should call service.create', async () => {
    await expect(controller.create({} as any)).resolves.toBe('ticket created');
  });

  it('should call service.buyTicket with minimal data', async () => {
    const dto = { presentationId: 'pres1', quantity: 1 };
    await expect(controller.buyTicket(dto, mockUser)).resolves.toBe('ticket bought');
    expect(service.buyTicket).toHaveBeenCalledWith(mockUser.id, dto);
  });

  it('should return all tickets', async () => {
    const user = { id: 'user1' };
    await expect(controller.findAll(user as any)).resolves.toEqual(['ticket1', 'ticket2']);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return one ticket', async () => {
    await expect(controller.findOne('123')).resolves.toBe('ticket1');
    expect(service.findOne).toHaveBeenCalledWith('123');
  });

  it('should call remove', async () => {
    await expect(controller.remove('123')).resolves.toBe('ticket deleted');
    expect(service.remove).toHaveBeenCalledWith('123');
  });

  it('should call update', async () => {
    await expect(controller.update('123', { isRedeemed: true })).resolves.toBe('ticket updated');
    expect(service.update).toHaveBeenCalledWith('123', { isRedeemed: true });
  });

  it('should throw if presentation is not found in buyTicket', async () => {
    const dto = { presentationId: 'bad-id', quantity: 1 };
    const user = { id: 'user1' };

    // Configurar explícitamente para este test
    mockPresentationService.findOne.mockResolvedValue(null);

    await expect(controller.buyTicket(dto, user as any)).rejects.toThrow('Presentation not found');
  });

  it('should call service.buyTicket with complete user data', async () => {
    const dto = {
      presentationId: '1',
      quantity: 1,
    };

    const mockCompleteUser: User = {
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

    // Asegurar que presentationService.findOne devuelve un valor válido
    const mockPresentation = { idPresentation: '1', capacity: 100 };
    mockPresentationService.findOne.mockResolvedValue(mockPresentation);

    // Simula que el decorador @GetUser() devolverá el mockCompleteUser
    const result = await controller.buyTicket(dto, mockCompleteUser);

    expect(result).toBe('ticket bought');
    expect(service.buyTicket).toHaveBeenCalledWith('user1', { ...dto });
  });
});