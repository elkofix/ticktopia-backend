import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCheckoutSessionDto } from '../../src/ticket/dto/create-checkout-session.dto';

describe('CreateCheckoutSessionDto', () => {
  it('should validate a correct DTO', async () => {
    const dto = {
      quantity: 2,
      userId: '7d2e6c84-4dd3-44b8-b0a7-908080808080',
      presentationId: '7d2e6c84-4dd3-44b8-b0a7-908080808080',
    };

    const instance = plainToInstance(CreateCheckoutSessionDto, dto);
    const errors = await validate(instance);
    expect(errors.length).toBe(0);
  });
});
