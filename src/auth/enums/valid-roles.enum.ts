import { registerEnumType } from '@nestjs/graphql';

export enum ValidRoles{
    admin = 'admin',
    eventManager = 'event-manager',
    client = 'client',
    ticketChecker = 'ticketChecker'
}

registerEnumType(ValidRoles, {
  name: 'ValidRoles',
  description: 'Roles válidos para los usuarios',
});