import { Controller, Get, Post, Body, Param, UnauthorizedException, Delete, Put, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { ValidRoles } from './enums/valid-roles.enum';
import { Auth } from './decorators/auth.decorator';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth, ApiHeader, ApiUnauthorizedResponse, ApiCreatedResponse, ApiOkResponse, ApiForbiddenResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { LoginUserDto } from './dto/Login-user.dto';
import { FindOneUserDto } from './dto/find-one-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UpdateRoleDto } from './dto/update-roles.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user', description: 'Creates a new user with client role by default' })
  @ApiBody({ type: CreateAuthDto })
  @ApiCreatedResponse({
    description: 'User registered successfully',
    type: User
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error'
  })
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Auth(ValidRoles.admin)
  @Post('register/event-manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new event manager', description: 'Creates a new user with event-manager role. Only accessible by admin' })
  @ApiBody({ type: CreateAuthDto })
  @ApiCreatedResponse({
    description: 'Event manager registered successfully',
    type: User
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Admin role required' })
  @ApiForbiddenResponse({ description: 'Forbidden - Insufficient permissions' })
  createEventManager(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create({ ...createAuthDto, roles: ['event-manager'] });
  }

  @Post('login')
  @ApiOperation({ summary: 'User login', description: 'Authenticates user and returns JWT token' })
  @ApiBody({ type: LoginUserDto })
  @ApiOkResponse({
    description: 'Login successful',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  login(@Body() loginUserDto: LoginUserDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(loginUserDto, res);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token');
    return { message: 'Logged out' };
  }

  @Auth(ValidRoles.admin)
  @Get('users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users', description: 'Retrieves a list of all users. Only accessible by admin' })
  @ApiOkResponse({
    description: 'List of users retrieved successfully',
    type: [User]
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Admin role required' })
  findAllUsers() {
    return this.authService.findAll();
  }

  @Auth(ValidRoles.admin, ValidRoles.client, ValidRoles.eventManager)
  @Get('users/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves a user by ID. Admins can view any user, others can only view themselves'
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOkResponse({
    description: 'User retrieved successfully',
    type: User
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Cannot view other users' })
  @ApiNotFoundResponse({ description: 'User not found' })
  findById(@Param() params: FindOneUserDto, @GetUser() user: User) {
    const isAdmin = user.roles.includes(ValidRoles.admin);
    const isSelf = params.id === user.id;

    if (!isAdmin && !isSelf) {
      throw new UnauthorizedException('You can only find yourself');
    }

    return this.authService.findById(params.id);
  }

  @Auth(ValidRoles.admin, ValidRoles.client, ValidRoles.eventManager)
  @Put('users/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user',
    description: 'Updates user information. Users can only update their own profile'
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateAuthDto })
  @ApiOkResponse({
    description: 'User updated successfully',
    type: User
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Cannot update other users' })
  @ApiNotFoundResponse({ description: 'User not found' })
  updateUser(
    @Param() params: FindOneUserDto,
    @Body() updateAuthDto: UpdateAuthDto,
    @GetUser() user: User,
  ) {
    const isSelf = params.id === user.id;

    if (!isSelf) {
      throw new UnauthorizedException('You can only update your own profile');
    }

    return this.authService.updateUser(params.id, updateAuthDto);
  }

  @Auth(ValidRoles.admin, ValidRoles.client, ValidRoles.eventManager)
  @Delete('users/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete user',
    description: 'Deletes a user. Users can only delete themselves'
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOkResponse({
    description: 'User deleted successfully',
    type: User
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Cannot delete other users' })
  @ApiNotFoundResponse({ description: 'User not found' })
  deleteById(@Param() params: FindOneUserDto, @GetUser() user: User) {
    const isSelf = params.id === user.id;
    if (!isSelf) {
      throw new UnauthorizedException('You can only delete yourself');
    }

    return this.authService.deleteUserById(params.id);
  }

  @Auth(ValidRoles.admin)
  @Put('users/roles/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user roles',
    description: 'Updates roles for a user. Only accessible by admin'
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiOkResponse({
    description: 'User roles updated successfully',
    type: User
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Admin role required' })
  @ApiNotFoundResponse({ description: 'User not found' })
  updateRolesToUser(@Param() params: FindOneUserDto, @Body() roles: UpdateRoleDto) {
    return this.authService.updateUserRoles(roles, params.id);
  }
  

}