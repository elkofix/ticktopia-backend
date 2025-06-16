import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Payment')
@Controller('success')
export class SuccessController {

    @Get()
    @ApiOperation({
        summary: 'Payment success endpoint',
        description: 'Returns a confirmation message for successful payments'
    })
    @ApiResponse({
        status: 200,
        description: 'Payment processed successfully',
        content: {
            'text/plain': {
                example: 'PAGO EXITOSO'
            }
        }
    })
    showSuccess() {
        return "PAGO EXITOSO";
    }
}