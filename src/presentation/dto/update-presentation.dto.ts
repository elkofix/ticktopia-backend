import { PartialType } from '@nestjs/swagger';
import { CreatePresentationDto } from './create-presentation.dto';
import { Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';


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
        const sale = new Date(ticketSaleAvailabilityDate).getTime();
        const availability = new Date(ticketAvailabilityDate).getTime();
        const open = new Date(openDate).getTime();
        const start = new Date(startDate).getTime();

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
- ticketSaleAvailabilityDate < ticketAvailabilityDate < openDate <= startDate`;
    }
}

export class UpdatePresentationDto extends PartialType(CreatePresentationDto) {

    @Validate(ValidPresentationDates)
    validDates: boolean;
}
