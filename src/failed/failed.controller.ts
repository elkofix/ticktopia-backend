import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Payment')
@Controller('failed')
export class FailedController {

    @Get()
    @ApiOperation({ 
        summary: 'Payment failure endpoint',
        description: 'Returns a message indicating a failed payment' 
    })
    @ApiResponse({
        status: 200,
        description: 'Payment failed message returned',
        content: {
            'text/plain': {
                example: 'PAGO FALLIDO'
            }
        }
    })
    showFailure() {
        return "PAGO FALLIDO";
    }
}