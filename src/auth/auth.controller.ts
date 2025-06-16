import { Args, Mutation, Query, Resolver, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { User } from './entities/user.entity';
import { ValidRoles } from './enums/valid-roles.enum';
import { UnauthorizedException, UseGuards } from '@nestjs/common';

import { FindOneUserDto } from './dto/find-one-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UpdateRoleDto } from './dto/update-roles.dto';
import { GetUser } from './decorators/get-user.decorator';
import { Auth } from './decorators/auth.decorator';
import { UserDto } from './dto/user.dto';
import { LoginUserDto } from './dto/Login-user.dto';
import { LoginResponseDto } from './dto/auth.response.dto';
import { DeleteUserResponse } from './dto/delete.response.dto';

@Resolver(() => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) { }

  @Mutation(() => UserDto, { name: 'register' })
  async createUser(@Args('createAuthInput') createAuthDto: CreateAuthDto) {
    const result = await this.authService.create(createAuthDto);
    return result; // Return only the user, token is set in cookie anyway
  }

  @Mutation(() => UserDto, { name: 'registerEventManager' })
  @Auth(ValidRoles.admin)
  async createEventManager(@Args('createAuthInput') createAuthDto: CreateAuthDto) {
    const result = await this.authService.create({ ...createAuthDto, roles: ['event-manager'] });
    return result; // Return only the user, token is set in cookie anyway
  }


  @Mutation(() => LoginResponseDto, { name: 'login' })
  async login(
    @Args('loginInput') loginUserDto: LoginUserDto,
    @Context() context: any,
  ) {
    const { res } = context;
    return this.authService.login(loginUserDto, res);
  }

  @Mutation(() => String, { name: 'logout' })
  async logout(@Context() context: any) {
    const { res } = context;
    res.clearCookie('token');
    return 'Logged out';
  }

  @Query(() => [UserDto], { name: 'users' })
  @Auth(ValidRoles.admin)
  findAllUsers() {
    return this.authService.findAll();
  }

  @Query(() => UserDto, { name: 'user' })
  @Auth()
  findById(
    @Args('findOneUserInput') params: FindOneUserDto,
    @GetUser() user: User,
  ) {
    const isAdmin = user.roles.includes(ValidRoles.admin);
    const isSelf = params.id === user.id;

    if (!isAdmin && !isSelf) {
      throw new UnauthorizedException('You can only find yourself');
    }

    return this.authService.findById(params.id);
  }

  @Mutation(() => UserDto, { name: 'updateUser' })
  @Auth()
  updateUser(
    @Args('findOneUserInput') params: FindOneUserDto,
    @Args('updateAuthInput') updateAuthDto: UpdateAuthDto,
    @GetUser() user: User,
  ) {
    const isSelf = params.id === user.id;

    if (!isSelf) {
      throw new UnauthorizedException('You can only update your own profile');
    }

    return this.authService.updateUser(params.id, updateAuthDto);
  }

  @Mutation(() => DeleteUserResponse, { name: 'deleteUser' })
  @Auth()
  deleteById(
    @Args('findOneUserInput') params: FindOneUserDto,
    @GetUser() user: User,
  ) {
    const isSelf = params.id === user.id;
    if (!isSelf) {
      throw new UnauthorizedException('You can only delete yourself');
    }

    return this.authService.deleteUserById(params.id);
  }

  @Mutation(() => UserDto, { name: 'updateUserRoles' })
  @Auth(ValidRoles.admin)
  updateRolesToUser(
    @Args('findOneUserInput') params: FindOneUserDto,
    @Args('updateRoleInput') roles: UpdateRoleDto,
  ) {
    return this.authService.updateUserRoles(roles, params.id);
  }
}