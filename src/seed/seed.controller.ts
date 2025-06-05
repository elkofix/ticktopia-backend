import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiInternalServerErrorResponse,
  ApiBearerAuth,
  ApiForbiddenResponse
} from '@nestjs/swagger';

@ApiTags('Database')
@Controller('seed')
export class SeedController {
  constructor() {}

  @Get()
  @ApiOperation({
    summary: 'Execute database seed',
    description: 'Populates the database with initial test data. WARNING: This will reset existing data.'
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Seed executed successfully',
    schema: {
      example: {
        message: 'Database seeded successfully',
        usersCreated: 5,
        ticketsCreated: 20
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Seed operation failed',
    schema: {
      example: {
        statusCode: 500,
        message: 'Failed to seed database',
        error: 'Internal Server Error'
      }
    }
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - Admin access required',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden'
      }
    }
  })
  async executeSeed() {
    return "SEED EXECUTED"
  }
  
}