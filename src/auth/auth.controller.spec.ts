import { PassportModule } from "@nestjs/passport";
import { TestingModule, Test } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { User } from "./entities/user.entity";
import { CreateAuthDto } from "./dto/create-auth.dto";
import { LoginUserDto } from './dto/Login-user.dto';
import { FindOneUserDto } from "./dto/find-one-user.dto";
import { ValidRoles } from "./enums/valid-roles.enum";
import { UnauthorizedException } from "@nestjs/common";
import { UpdateAuthDto } from "./dto/update-auth.dto";
import { use } from "passport";
import { UpdateRoleDto } from "./dto/update-roles.dto";

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      create: jest.fn(),
      login: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      updateUser: jest.fn(),
      deleteUserById: jest.fn(),
      updateUserRoles: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
      controllers: [AuthController],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('should create user with the proper DTO', async () => {
    const dto: CreateAuthDto = {
      email: 'test@google.com',
      password: 'Abc123',
      name: 'Test User',
      lastname: 'Test',
    };

    await authController.create(dto);

    expect(authService.create).toHaveBeenCalled();
    expect(authService.create).toHaveBeenCalledWith(dto);
  });


  it('should create user with the proper DTO event', async () => {
    const dto: CreateAuthDto = {
      email: 'test@google.com',
      password: 'Abc123',
      name: 'Test User',
      lastname: 'Test',
    };

    await authController.createEventManager(dto);

    expect(authService.create).toHaveBeenCalled();
    expect(authService.create).toHaveBeenCalledWith({ ...dto, roles: ["event-manager"] });
  });

  it('should loginUser with the proper DTO', async () => {
    const dto: LoginUserDto = {
      email: 'test@google.com',
      password: 'Abc123',
    };

    await authController.login(dto);

    expect(authService.login).toHaveBeenCalled();
    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('should FINDALL USERS with the proper DTO', async () => {


    await authController.findAllUsers();

    expect(authService.findAll).toHaveBeenCalled();
  });


  it('should find user with the proper DTO', async () => {

    const dto: FindOneUserDto = {
      id: "4a3ce64f-6b51-4509-a80d-4849eefcc218",
    };

    const user: User = {
      id: "4a3ce64f-6b51-4509-a80d-4849eefcc218",
      email: "test@google.com",
      password: "Hola1597!!!",
      name: "Test",
      lastname: "User",
      roles: [ValidRoles.admin],
      tickets: [],
      events: [],
      isActive: true,
      checkFieldsBeforeInsert: jest.fn(),
      checkFieldsBeforeUpdate: jest.fn()
    };


    await authController.findById(dto, user);
    expect(authService.findById).toHaveBeenCalled();
    expect(authService.findById).toHaveBeenCalledWith(dto.id);

  });

  it('should fail with the proper DTO', async () => {

    const dto: FindOneUserDto = {
      id: "4a3ce64f-6b51-4509-a80d-4849eefcc218",
    };

    const user: User = {
      id: "4a3ce64f-6b51-4509-a80d-4849eefcc212",
      email: "test@google.com",
      password: "Hola1597!!!",
      name: "Test",
      lastname: "User",
      roles: [ValidRoles.client],
      tickets: [],
      events: [],
      isActive: true,
      checkFieldsBeforeInsert: jest.fn(),
      checkFieldsBeforeUpdate: jest.fn()
    };
    try {
      await authController.findById(dto, user);
      fail('The test should have thrown an UnauthorizedException');
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.message).toBe('You can only find yourself');
    }
  });


  it('should update user the proper DTO', async () => {

    const dto: FindOneUserDto = {
      id: "4a3ce64f-6b51-4509-a80d-4849eefcc218",
    };
    const user: User = {
      id: "4a3ce64f-6b51-4509-a80d-4849eefcc218",
      email: "test@google.com",
      password: "Hola1597!!!",
      name: "Test",
      lastname: "User",
      roles: [ValidRoles.admin],
      tickets: [],
      events: [],
      isActive: true,
      checkFieldsBeforeInsert: jest.fn(),
      checkFieldsBeforeUpdate: jest.fn()
    };
    const update: UpdateAuthDto = {
      email: "test@google.com",
      name: "Test",
      password: "any",
      lastname: "User",
    };
    await authController.updateUser(dto, update, user)
    expect(authService.updateUser).toHaveBeenCalled();
    expect(authService.updateUser).toHaveBeenCalledWith(dto.id, update);

  });


  it('should failUpdate user the proper DTO', async () => {

    const dto: FindOneUserDto = {
      id: "4a3ce64f-6b51-4509-a80d-4849eefcc2s8",
    };
    const user: User = {
      id: "4a3ce64f-6b51-4509-a80d-4849eefcc218",
      email: "test@google.com",
      password: "Hola1597!!!",
      name: "Test",
      lastname: "User",
      roles: [ValidRoles.admin],
      tickets: [],
      events: [],
      isActive: true,
      checkFieldsBeforeInsert: jest.fn(),
      checkFieldsBeforeUpdate: jest.fn()
    };
    const update: UpdateAuthDto = {
      email: "test@google.com",
      name: "Test",
      password: "any",
      lastname: "User",
    };

    try {
      await authController.updateUser(dto, update, user)
      fail('The test should have thrown an UnauthorizedException');
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.message).toBe('You can only update your own profile');
    }

  });


  it('should delete user the proper DTO', async () => {

    const dto: FindOneUserDto = {
      id: "4a3ce64f-6b51-4509-a80d-4849eefcc218",
    };

    const user: User = {
      id: "4a3ce64f-6b51-4509-a80d-4849eefcc218",
      email: "test@google.com",
      password: "Hola1597!!!",
      name: "Test",
      lastname: "User",
      roles: [ValidRoles.admin],
      tickets: [],
      events: [],
      isActive: true,
      checkFieldsBeforeInsert: jest.fn(),
      checkFieldsBeforeUpdate: jest.fn()
    };

    await authController.deleteById(dto, user)
    expect(authService.deleteUserById).toHaveBeenCalled();
    expect(authService.deleteUserById).toHaveBeenCalledWith(dto.id);

  });


  it('should failUpdate user the proper DTO', async () => {

    const dto: FindOneUserDto = {
      id: "4a3ce64f-6b51-4509-a80d-4849eefcc2s8",
    };
    const user: User = {
      id: "4a3ce64f-6b51-4509-a80d-4849eefcc218",
      email: "test@google.com",
      password: "Hola1597!!!",
      name: "Test",
      lastname: "User",
      roles: [ValidRoles.admin],
      tickets: [],
      events: [],
      isActive: true,
      checkFieldsBeforeInsert: jest.fn(),
      checkFieldsBeforeUpdate: jest.fn()
    };

    try {
      await authController.deleteById(dto, user)
      fail('The test should have thrown an UnauthorizedException');
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.message).toBe('You can only delete yourself');
    }

  });



  it('should delete user the proper DTO', async () => {

    const dto: FindOneUserDto = {
      id: "4a3ce64f-6b51-4509-a80d-4849eefcc218",
    };

    const roles: UpdateRoleDto = {
      roles: [ValidRoles.eventManager]
    }
    await authController.updateRolesToUser(dto, roles)
    expect(authService.updateUserRoles).toHaveBeenCalled();
    expect(authService.updateUserRoles).toHaveBeenCalledWith(roles, dto.id);

  });
  //   const user = {
  //     id: '1',
  //     email: 'test@google.com',
  //     fullName: 'Test User',
  //   } as User;

  //   const request = {} as Express.Request;
  //   const rawHeaders = ['header1: value1', 'header2: value2'];
  //   const headers = { header1: 'value1', header2: 'value2' };

  //   const result = authController.privateRoute(
  //     request,
  //     user,
  //     rawHeaders,
  //     headers,
  //   );

  //   expect(result).toEqual({
  //     ok: true,
  //     message: 'Hola Mundo Private',
  //     user: { id: '1', email: 'test@google.com', fullName: 'Test User' },
  //     userEmail: 'test@google.com',
  //     rawHeaders: ['header1: value1', 'header2: value2'],
  //     headers: { header1: 'value1', header2: 'value2' },
  //   });
  // });
});