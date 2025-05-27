import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Logger,
  ParseUUIDPipe,
  Put,
  UnauthorizedException,
  BadRequestException
} from '@nestjs/common';
import { PresentationService } from './presentation.service';
import { CreatePresentationDto } from './dto/create-presentation.dto';
import { UpdatePresentationDto } from './dto/update-presentation.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { EventService } from 'src/event/event.service';

@ApiTags('Presentations')
@Controller('presentation')
export class PresentationController {
  private readonly logger = new Logger('PresentationController');

  constructor(private readonly presentationService: PresentationService, private readonly eventService: EventService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new presentation' })
  @ApiResponse({ status: 201, description: 'Presentation created successfully' })
  @Auth(ValidRoles.admin, ValidRoles.eventManager)
  async create(@Body() createPresentationDto: CreatePresentationDto, @GetUser() user: User) {
    try {
      const event = await this.eventService.findOneUnrestricted(createPresentationDto.eventId);


      if (!event) {
        throw new NotFoundException(`event with id ${createPresentationDto.eventId} not found`);
      }

      if (event.user.id != user.id) {
        throw new UnauthorizedException(`You can add presentations to events of your own`);
      }

      const newPresentation = await this.presentationService.create(createPresentationDto);

      return newPresentation;
    } catch (error) {
      this.logger.error('Error creating presentation', error.stack);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all presentations' })
  @ApiResponse({ status: 200, description: 'List of presentations' })
  @Auth(ValidRoles.admin, ValidRoles.eventManager, ValidRoles.client)
  async findAll() {
    try {
      return await this.presentationService.findAll();
    } catch (error) {
      this.logger.error('Error fetching presentations', error.stack);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a presentation by ID' })
  @ApiResponse({ status: 200, description: 'Presentation details' })
  @ApiResponse({ status: 404, description: 'Presentation not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const presentation = await this.presentationService.findOne(id);

      if (!presentation) {
        throw new NotFoundException(`Presentation with ID ${id} not found`);
      }

      return presentation;
    } catch (error) {
      this.logger.error(`Error fetching presentation with ID ${id}`, error.stack);
      throw error;
    }
  }

  @Get('manager/:id')
  @ApiOperation({ summary: 'Get a presentation by ID' })
  @ApiResponse({ status: 200, description: 'Presentation details' })
  @ApiResponse({ status: 404, description: 'Presentation not found' })
  @Auth(ValidRoles.admin, ValidRoles.eventManager)
  async findOneUnrestricted(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const presentation = await this.presentationService.findOneUnRestricted(id);

      if (!presentation) {
        throw new NotFoundException(`Presentation with ID ${id} not found`);
      }

      return presentation;
    } catch (error) {
      this.logger.error(`Error fetching presentation with ID ${id}`, error.stack);
      throw error;
    }
  }

  @Get('/event/:id')
  @ApiOperation({ summary: 'Get a presentation by ID' })
  @ApiResponse({ status: 200, description: 'Presentation details' })
  @ApiResponse({ status: 404, description: 'Presentation not found' })
  async findByEvent(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const presentation = await this.presentationService.findByEventId(id);

      if (!presentation) {
        throw new NotFoundException(`Presentations with Event ID ${id} not found`);
      }

      return presentation;
    } catch (error) {
      this.logger.error(`Error fetching presentation with ID ${id}`, error.stack);
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a presentation' })
  @ApiResponse({ status: 200, description: 'Presentation updated' })
  @ApiResponse({ status: 404, description: 'Presentation not found' })
  @Auth(ValidRoles.admin, ValidRoles.eventManager)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePresentationDto: UpdatePresentationDto, @GetUser() user: User
  ) {
    try {
      const presentation = await this.presentationService.findOneUnRestricted(id);

      if (!presentation) {
        throw new NotFoundException(`Presentation with ID ${id} not found`);
      }

      if (presentation.event.user.id != user.id) {
        throw new UnauthorizedException(`You can only update presentations that are associated with an event of your own`);
      }

      if (updatePresentationDto.eventId) {
        throw new BadRequestException(`You cannot move a presententation from an event to another`);
      }

      const updatedPresentation = await this.presentationService.update(id, updatePresentationDto);
      return updatedPresentation;
    } catch (error) {
      this.logger.error(`Error updating presentation with ID ${id}`, error.stack);
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a presentation' })
  @ApiResponse({ status: 200, description: 'Presentation deleted' })
  @ApiResponse({ status: 404, description: 'Presentation not found' })
  @Auth(ValidRoles.admin, ValidRoles.eventManager)
  async remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    try {
      const presentation = await this.presentationService.findOneUnRestricted(id);

      if (!presentation) {
        throw new NotFoundException(`Presentation with ID ${id} not found`);
      }

      if (presentation.event.user.id != user.id) {
        throw new UnauthorizedException(`You can only update presentations that are associated with an event of your own`);
      }

      const deletedPresentation = await this.presentationService.remove(id);
      return { message: `Presentation with ID ${id} has been deleted successfully`, presentation: deletedPresentation };
    } catch (error) {
      this.logger.error(`Error deleting presentation with ID ${id}`, error.stack);
      throw error;
    }
  }
}