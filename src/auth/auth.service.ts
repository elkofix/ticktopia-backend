import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt.interface';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/Login-user.dto';
import { plainToInstance } from 'class-transformer';
import { UserDto } from './dto/find-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UpdateRoleDto } from './dto/update-roles.dto';
import { Response } from 'express'; // ✅ CORRECTO

@Injectable()
export class AuthService {

  private logger = new Logger('AuthService');
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) { }

  async create(createUserDto: CreateAuthDto & { roles?: string[] }) {
    const { password, ...userData } = createUserDto;
    try {
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });
      await this.userRepository.save(user);
      delete user.password;

      return {
        user: user,
        token: this.getJwtToken({ id: user.id })
      };


    } catch (error) {
      this.handleExceptions(error);
    }
  }


  async login(loginUserDto: LoginUserDto, res: Response) {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
      select: { email: true, password: true, id: true, name: true, lastname: true, isActive: true, roles: true }
    });

    if (!user) throw new NotFoundException(`User with email ${email} not found`);

    if (!bcrypt.compareSync(password, user.password!))
      throw new UnauthorizedException(`Email or password incorrect`);

    delete user.password;

    const token = this.getJwtToken({ id: user.id });

    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // solo por HTTPS en producción
      sameSite: 'strict', // <-- Permite cross-site
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
      path: '/',
    });
    console.log(token);
    return { user }; // ya no devuelves el token, va en la cookie
  }

  async deleteAllUsers(): Promise<{ message: string }> {
    try {
      await this.userRepository.delete({});
      return { message: 'All users and their events have been deleted successfully' };
    } catch (error) {
      this.logger.error('Failed to delete all users', error.stack);
      throw new InternalServerErrorException('Could not delete users');
    }
  }

  async findById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        roles: true,
      }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findAll() {
    const users = await this.userRepository.find();
    return plainToInstance(UserDto, users);
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleExceptions(error: any) {
    if (error.code === "23505")
      throw new BadRequestException(error.detail);

    this.logger.error(error.detail);
    throw new InternalServerErrorException('Unspected error, check your server logs');
  }

  async deleteUserById(id: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: {}
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.isActive === false) {
      throw new BadRequestException(`User with ID ${id} is already deactivated`);
    }

    user.isActive = false;
    await this.userRepository.save(user);
    return { message: `User with ID ${id} has been deactivated successfully` };
  }

  async updateUser(id: string, updateAuthDto: UpdateAuthDto) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (updateAuthDto.email && updateAuthDto.email !== user.email) {
      const existingUser = await this.userRepository.findOneBy({ email: updateAuthDto.email });
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException(`Email ${updateAuthDto.email} is already in use`);
      }
    }

    const updatedUser = await this.userRepository.preload({
      id,
      ...updateAuthDto,
    });

    if (!updatedUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this.userRepository.save(updatedUser)
    delete updatedUser.password
    return updatedUser;
  }


  async updateUserRoles({ roles }: UpdateRoleDto, userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    user.roles = roles;
    await this.userRepository.save(user);
    delete user.password;
    return user;
  }



}
