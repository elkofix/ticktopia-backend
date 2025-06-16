import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('System')
@Controller('health')
export class HealthController {
  
  @Get()
  @ApiOperation({ 
    summary: 'Check system health',
    description: 'Provides a simple health check endpoint to verify if the API is running' 
  })
  @ApiResponse({
    status: 200,
    description: 'System is healthy and running',
    schema: {
      example: { status: 'ok' }
    }
  })
  @ApiResponse({
    status: 500,
    description: 'System is not healthy',
    schema: {
      example: { status: 'error', message: 'Service unavailable' }
    }
  })
  getHealthStatus() {
    return { status: 'ok' };
  }
}