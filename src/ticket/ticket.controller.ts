import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Headers,
  Delete,
  InternalServerErrorException,
  ParseUUIDPipe,
  Put,
  NotFoundException,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { BuyTicketDto } from './dto/buy-ticket.dto';
import { AuthService } from '../auth/auth.service';
import { PresentationService } from '../presentation/presentation.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import Stripe from 'stripe';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketController {

  constructor(
    private readonly ticketService: TicketService,
    private readonly authService: AuthService,
    private readonly presentationService: PresentationService,

  ) {
  }

  @Post('admin')
  @ApiOperation({ summary: 'Create a ticket manually (admin)' })
  @ApiResponse({ status: 201, description: 'Ticket created' })
  @Auth(ValidRoles.admin)
  async create(@Body() dto: CreateTicketDto) {
    return this.ticketService.create(dto);
  }


  @Post('buy')
  @ApiOperation({ summary: 'Buy a ticket (simulated)' })
  @ApiResponse({ status: 201, description: 'Ticket purchased' })
  @ApiResponse({ status: 500, description: 'User or presentation not found' })
  @Auth(ValidRoles.client, ValidRoles.admin)
  async buyTicket(@Body() dto: BuyTicketDto, @GetUser() user: User) {
    const presentation = await this.presentationService.findOne(dto.presentationId);

    if (!presentation) {
      throw new NotFoundException('Presentation not found');
    }

    return this.ticketService.buyTicket(user.id, dto);
  }


  @Get()
  @ApiOperation({ summary: 'Get all tickets (admin)' })
  @ApiResponse({ status: 200, description: 'List of all tickets' })
  @Auth(ValidRoles.client)
  findAll(@GetUser() user: User) {
    return this.ticketService.findAll(user);
  }

  @Get("historic")
  @ApiOperation({ summary: 'Get all tickets (admin)' })
  @ApiResponse({ status: 200, description: 'List of all tickets' })
  @Auth(ValidRoles.client)
  findAllHistoric(@GetUser() user: User) {
    return this.ticketService.findAllHistoric(user);
  }


  @Get(':id')
  @ApiOperation({ summary: 'Get a ticket by ID' })
  @ApiResponse({ status: 200, description: 'Ticket details' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  @Auth(ValidRoles.admin, ValidRoles.client)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a ticket' })
  @ApiResponse({ status: 200, description: 'Ticket updated' })
  @Auth(ValidRoles.ticketChecker)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTicketDto) {
    return this.ticketService.update(id, dto);
  }

  // 🧨 Admin: Eliminar ticket manualmente
  @Delete(':id/delete')
  @ApiOperation({ summary: 'Delete a ticket (admin)' })
  @ApiResponse({ status: 200, description: 'Ticket deleted' })
  @Auth(ValidRoles.admin)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketService.remove(id);
  }
}
