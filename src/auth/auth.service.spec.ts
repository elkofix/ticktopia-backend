import { BadRequestException, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TestingModule, Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthService } from "./auth.service";
import { User } from "./entities/user.entity";
import { CreateAuthDto } from "./dto/create-auth.dto";
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/Login-user.dto';
import { ValidRoles } from "./enums/valid-roles.enum";
import { UserDto } from "./dto/find-user.dto";
import { plainToInstance } from "class-transformer";
import { UpdateAuthDto } from "./dto/update-auth.dto";
import { UpdateRoleDto } from "./dto/update-roles.dto";

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const mockUserRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
      preload: jest.fn()
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },

        AuthService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should create a user and return user with token', async () => {
    const dto: CreateAuthDto = {
      email: 'test@google.com',
      password: 'Abc123',
      name: 'Test User',
      lastname: 'Last'
    };

    const user = {
      email: dto.email,
      name: dto.name,
      lastname: dto.lastname,
      id: '1',
      isActive: true,
      roles: ['user'],
    } as User;

    jest.spyOn(userRepository, 'create').mockReturnValue(user);
    jest.spyOn(bcrypt, 'hashSync').mockReturnValue('ABcbjAjkhas');

    const result = await authService.create(dto);

    expect(bcrypt.hashSync).toHaveBeenCalledWith('Abc123', 10);

    expect(result).toEqual({
      user: {
        email: 'test@google.com',
        name: 'Test User',
        lastname: "Last",
        id: '1',
        isActive: true,
        roles: ['user'],
      },
      token: 'mock-jwt-token',
    });
  });

  it('should throw an error if email already exist', async () => {
    const dto: CreateAuthDto = {
      email: 'test@google.com',
      password: 'Abc123',
      name: 'Test User',
      lastname: "Test pass"
    };

    jest
      .spyOn(userRepository, 'save')
      .mockRejectedValue({ code: '23505', detail: 'Email already exists' });

    await expect(authService.create(dto)).rejects.toThrow(BadRequestException);
    await expect(authService.create(dto)).rejects.toThrow(
      'Email already exists',
    );
  });



  it('should throw an unexpected error', async () => {
    const dto: CreateAuthDto = {
      email: 'test@googles.com',
      password: 'Abc123',
      name: 'Test User',
      lastname: "Test pass"
    };

    jest
      .spyOn(userRepository, 'save')
      .mockRejectedValue({ code: '23503', detail: 'DB error' });

    await expect(authService.create(dto)).rejects.toThrow(InternalServerErrorException);
    await expect(authService.create(dto)).rejects.toThrow(
      'Unspected error, check your server logs',
    );
  });


  it('should login user and return token', async () => {
    const dto: LoginUserDto = {
      email: 'gus@mail.com',
      password: 'Abc123',
    };

    const user = {
      ...dto,
      password: 'Abc123',
    } as User;

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
    jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

    const result = await authService.login(dto);
    expect(result).toEqual({
      user: {
        email: 'gus@mail.com',
      },
      token: 'mock-jwt-token',
    });

    expect(result.user.password).not.toBeDefined();
    expect(result.user.password).toBeUndefined();
  });


  it('should delete all users', async () => {
    const result = await authService.deleteAllUsers();
    expect(result).toEqual({
      message: 'All users and their events have been deleted successfully'
    }
    );
  });


  it('should not delete all users', async () => {
    jest.spyOn(userRepository, 'delete').mockRejectedValue(new Error("DB error"))
    try {
      const result = await authService.deleteAllUsers();
    } catch (error) {
      expect(error).toBeInstanceOf(InternalServerErrorException);
      expect(error.message).toBe('Could not delete users');
    }
  });

  it('should find all users', async () => {
    const users: User[] = [{
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
    }];
    jest.spyOn(userRepository, 'find').mockResolvedValue(users
    );

    const result = await authService.findAll();
    expect(result).toEqual(plainToInstance(UserDto, users));
  });

  it('should not find one user by ID', async () => {
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null
    );
    try {
      await authService.findById("anyid");
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toContain('not found');
    }
  });


  it('should find one user by ID', async () => {
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
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user
    );
    const result = await authService.findById("anyid");
    expect(result).toEqual(user);
  });


  it('should delete user by ID', async () => {
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
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user
    );
    const result = await authService.deleteUserById("anyid");
    expect(result).toEqual({ message: `User with ID anyid has been deactivated successfully` });
    expect(userRepository.save).toHaveBeenCalled();
    user.isActive = false;
    expect(userRepository.save).toHaveBeenCalledWith(user);
  });


  it('should not delete user by ID', async () => {
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null
    );
    try {
      await authService.deleteUserById("anyid");
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toContain(`User with ID anyid not found`);
    }
  });


  it('should not delete user by ID', async () => {
    const user: User = {
      id: "4a3ce64f-6b51-4509-a80d-4849eefcc218",
      email: "test@google.com",
      password: "Hola1597!!!",
      name: "Test",
      lastname: "User",
      roles: [ValidRoles.admin],
      tickets: [],
      events: [],
      isActive: false,
      checkFieldsBeforeInsert: jest.fn(),
      checkFieldsBeforeUpdate: jest.fn()
    };
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user
    );
    try {
      await authService.deleteUserById("anyid");
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toContain(`User with ID anyid is already deactivated`);
    }
  });


  it('should update user by ID', async () => {
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
      password: "Hola1597!!!",
      lastname: "User",
      name: "Test",
    }
    jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user
    );
    user.email = update.email!;
    user.lastname = update.lastname!;
    user.name = update.name!;
    jest.spyOn(userRepository, 'preload').mockResolvedValue(user
    );

    const result = await authService.updateUser("anyId", update);
    expect(userRepository.save).toHaveBeenCalled();
    user.isActive = false;
    expect(userRepository.save).toHaveBeenCalledWith(user);
  });


  it('should not update user by ID', async () => {

    const update: UpdateAuthDto = {
      email: "test@google.com",
      password: "Hola1597!!!",
      lastname: "User",
      name: "Test",
    }
    jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null
    );
    try {
      await authService.updateUser("anyid", update);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toContain(`User with id anyid not found`);
    }
  });

  it('should not update user by ID', async () => {
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
      password: "Hola1597!!!",
      lastname: "User",
      name: "Test",
    }
    jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user
    );
    jest.spyOn(userRepository, 'preload').mockResolvedValue(undefined
    );
    try {
      await authService.updateUser("anyid", update);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toContain(`User with id anyid not found`);
    }
  });

  it('should not update user by ID', async () => {
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
    const user2: User = {
      id: "4a3ce64f-6b51-4509-a80d-4849eefcc248",
      email: "test@googles.com",
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
      email: "tests@googles.com",
      password: "Hola1597!!!",
      lastname: "User",
      name: "Test",
    }
    jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(user
    ).mockResolvedValueOnce(user2);

    try {
      await authService.updateUser("anyid", update);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toContain(`Email tests@googles.com is already in use`);
    }
  });


  it('should not delete user by ID', async () => {
    const user: User = {
      id: "4a3ce64f-6b51-4509-a80d-4849eefcc218",
      email: "test@google.com",
      password: "Hola1597!!!",
      name: "Test",
      lastname: "User",
      roles: [ValidRoles.admin],
      tickets: [],
      events: [],
      isActive: false,
      checkFieldsBeforeInsert: jest.fn(),
      checkFieldsBeforeUpdate: jest.fn()
    };
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user
    );
    try {
      await authService.deleteUserById("anyid");
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toContain(`User with ID anyid is already deactivated`);
    }
  });


  it('should throw an UnAuthorized Exception if user doest not exist', async () => {
    const dto = { email: 'test@google.com' } as LoginUserDto;

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

    await expect(authService.login(dto)).rejects.toThrow(UnauthorizedException);
    await expect(authService.login(dto)).rejects.toThrow(
      `User with email ${dto.email} not found`,
    );
  });

  it('should throw an UnAuthorized Exception if user doest not exist', async () => {
    const dto = { email: 'test@google.com' } as LoginUserDto;

    jest.spyOn(userRepository, 'findOne').mockResolvedValue({
      password: 'Xyz123',
    } as User);

    jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

    await expect(authService.login(dto)).rejects.toThrow(UnauthorizedException);
    await expect(authService.login(dto)).rejects.toThrow(
      `Email or password incorrect`,
    );
  });

  
  it('should not update roles by ID', async () => {
    jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null
    )
    try {
      await authService.updateUserRoles({roles: [ValidRoles.client]}, "anyid");
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toContain(`User with ID anyid not found`);
    }
  });
    const user: User = {
      id: "4a3ce64f-6b51-4509-a80d-4849eefcc218",
      email: "test@google.com",
      password: "Hola1597!!!",
      name: "Test",
      lastname: "User",
      roles: [ValidRoles.admin],
      tickets: [],
      events: [],
      isActive: false,
      checkFieldsBeforeInsert: jest.fn(),
      checkFieldsBeforeUpdate: jest.fn()
    };
    it('should update roles by ID', async () => {
    jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user
    )
    const rolesDto: UpdateRoleDto = {roles: [ValidRoles.client]};
      await authService.updateUserRoles(rolesDto, "anyid");
      expect(userRepository.save).toHaveBeenCalled();
      user.roles = rolesDto.roles;
      expect(userRepository.save).toHaveBeenCalledWith(user)
  });



});