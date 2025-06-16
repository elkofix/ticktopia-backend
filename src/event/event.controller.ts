import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { Event } from './entities/event.entity';

@Resolver(() => Event)
export class EventResolver {
  constructor(private readonly eventService: EventService) {}

  @Mutation(() => Event)
  @Auth(ValidRoles.eventManager)
  async createEvent(
    @Args('createEventInput') createEventDto: CreateEventDto,
    @GetUser() user: User,
  ): Promise<Event> {
    return this.eventService.create({ ...createEventDto, userId: user.id });
  }

  @Query(() => [Event])
  async findAllEvents(
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @Args('offset', { type: () => Int, defaultValue: 0 }) offset: number,
  ): Promise<Event[]> {
    return this.eventService.findAll(limit, offset);
  }

  @Query(() => [Event])
  @Auth(ValidRoles.admin, ValidRoles.eventManager)
  async findEventsByUser(@GetUser() user: User): Promise<Event[]> {
    return this.eventService.findAllByUserId(user.id);
  }

  @Query(() => Event)
  @Auth(ValidRoles.admin, ValidRoles.eventManager)
  async findEventUnrestricted(
    @Args('term') term: string,
  ): Promise<Event> {
    return this.eventService.findOneUnrestricted(term);
  }

  @Query(() => Event)
  async findEvent(@Args('term') term: string): Promise<Event> {
    return this.eventService.findOne(term);
  }

  @Mutation(() => Event)
  @Auth(ValidRoles.eventManager)
  async updateEvent(
    @Args('id') id: string,
    @Args('updateEventInput') updateEventDto: UpdateEventDto,
    @GetUser() user: User,
  ): Promise<Event> {
    return this.eventService.update(id, updateEventDto, user);
  }

  @Mutation(() => String)
  @Auth(ValidRoles.admin, ValidRoles.eventManager)
  async removeEvent(
    @Args('id') id: string,
    @GetUser() user: User,
  ): Promise<string> {
    return this.eventService.remove(id, user);
  }

}