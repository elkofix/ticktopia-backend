import { Controller, Post, Req, Headers, UnauthorizedException } from '@nestjs/common';
import { TicketService } from '../ticket/ticket.service';
import Stripe from 'stripe';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiHeader, 
  ApiBody, 
  ApiUnauthorizedResponse, 
  ApiInternalServerErrorResponse 
} from '@nestjs/swagger';

@ApiTags('Webhooks')
@Controller('webhook')
export class WebhookController {
    private stripe: Stripe;

    constructor(
        private readonly ticketService: TicketService,
    ) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    }

    @Post('stripe')
    @ApiOperation({
        summary: 'Stripe webhook endpoint',
        description: 'Handles Stripe payment events and activates tickets upon successful payment'
    })
    @ApiHeader({
        name: 'stripe-signature',
        description: 'Stripe signature for webhook verification',
        required: true
    })
    @ApiBody({
        description: 'Stripe event payload',
        required: true,
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'object',
                    properties: {
                        object: {
                            type: 'object',
                            properties: {
                                metadata: {
                                    type: 'object',
                                    properties: {
                                        ticketIds: {
                                            type: 'string',
                                            description: 'JSON string array of ticket IDs'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Webhook processed successfully',
        schema: {
            example: { received: true }
        }
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid Stripe signature',
        schema: {
            example: {
                statusCode: 401,
                message: 'Webhook Error: Invalid signature',
                error: 'Unauthorized'
            }
        }
    })
    @ApiInternalServerErrorResponse({
        description: 'Internal server error',
        schema: {
            example: {
                statusCode: 500,
                message: 'Error processing webhook',
                error: 'Internal Server Error'
            }
        }
    })
    async activateTicket(
        @Req() req: Request, 
        @Headers('stripe-signature') stripeSignature: string,
    ) {
        let event: any;
        const body = req.body!.toString();
        
        try {
            event = this.stripe.webhooks.constructEvent(
                body, 
                stripeSignature, 
                process.env.STRIPE_SIGNATURE!
            );
        } catch (err) {
            console.log(err);
            throw new UnauthorizedException(`Webhook Error: ${err.message}`);
        }

        const bodys = JSON.parse(body);
        const ticketIds = JSON.parse(bodys.data.object.metadata.ticketIds);
        
        // Process tickets in parallel
        await Promise.all(
            ticketIds.map(async (ticketId: string) => {
                await this.ticketService.update(ticketId, { isActive: true });
            })
        );

        return { received: true };
    }
}