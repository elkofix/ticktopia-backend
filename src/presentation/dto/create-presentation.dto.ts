import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ name: 'ValidPresentationDates', async: false })
export class ValidPresentationDates implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const dto = args.object as CreatePresentationDto;
    const {
      ticketSaleAvailabilityDate,
      ticketAvailabilityDate,
      openDate,
      startDate,
    } = dto;

    if (
      !ticketSaleAvailabilityDate ||
      !ticketAvailabilityDate ||
      !openDate ||
      !startDate
    ) {
      return false;
    }

    const now = new Date().getTime();

    const sale = new Date(ticketSaleAvailabilityDate).getTime();
    const availability = new Date(ticketAvailabilityDate).getTime();
    const open = new Date(openDate).getTime();
    const start = new Date(startDate).getTime();

    // Todas deben ser después de hoy
    if (sale <= now || availability <= now || open <= now || start <= now) {
      return false;
    }

    // Orden lógico de fechas
    return (
      sale < availability &&
      sale < open &&
      sale < start &&
      availability > sale &&
      availability < open &&
      availability < start &&
      open >= availability &&
      open > sale &&
      open <= start &&
      start > open &&
      start > availability &&
      start > sale
    );
  }

  defaultMessage(args: ValidationArguments) {
    return `Invalid date order:
- All dates must be in the future.
- ticketSaleAvailabilityDate < ticketAvailabilityDate < openDate <= startDate`;
  }
}


export class CreatePresentationDto {
    @ApiProperty({
        example: 'Atanasio Girardot',
        description: 'Name of the place where the presentation is held',
    })
    @IsString()
    @IsNotEmpty()
    place: string;

    @ApiProperty({
        example: 500,
        description: 'Capacity of this presentation',
    })
    @IsNumber()
    @IsNotEmpty()
    capacity: number;

    @ApiProperty({
        example: '2025-05-06T08:00:00Z',
        description: 'Date and time when doors open',
    })
    @IsDateString()
    @IsNotEmpty()
    openDate: string;

    @ApiProperty({
        example: '2025-05-06T10:00:00Z',
        description: 'Date and time when the presentation starts',
    })
    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @ApiProperty({
        example: 50000,
        description: 'unit price of each ticket',
    })
    @IsNumber()
    @IsNotEmpty()
    price: number;


    @ApiProperty({
        example: 6.25184,
        description: 'Latitude of the presentation location',
    })
    @IsNumber()
    @IsNotEmpty()
    latitude: number;

    @ApiProperty({
        example: -75.56359,
        description: 'Longitude of the presentation location',
    })
    @IsNumber()
    @IsNotEmpty()
    longitude: number;
    @ApiProperty({
        example: 'A musical event in the main stadium.',
        description: 'Description of the presentation',
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        example: '2025-04-20T00:00:00Z',
        description: 'Date when ticket availability starts',
    })
    @IsDateString()
    @IsNotEmpty()
    ticketAvailabilityDate: string;

    @ApiProperty({
        example: '2025-04-25T00:00:00Z',
        description: 'Date when ticket sales become available',
    })
    @IsDateString()
    @IsNotEmpty()
    ticketSaleAvailabilityDate: string;

    @ApiProperty({
        example: 'Medellín',
        description: 'City where the presentation is held',
    })
    @IsString()
    @IsNotEmpty()
    city: string;

    @ApiProperty({
        description: 'Associated event for this presentation',
        example: '773701cb-ed1d-41fd-9921-7c56e0a6fcbd'
    })
    @IsString()
    @IsNotEmpty()
    eventId: string;

    @Validate(ValidPresentationDates)
    validDates: boolean;
}

