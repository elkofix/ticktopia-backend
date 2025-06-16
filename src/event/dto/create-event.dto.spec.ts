import { validate } from 'class-validator';
import { CreateEventDto } from './create-event.dto';

describe('CreateEventDto', () => {
  it('should validate a valid DTO', async () => {
    const dto = new CreateEventDto();
    dto.name = 'My Awesome Event';
    dto.bannerPhotoUrl = 'https://example.com/banner.jpg';
    dto.isPublic = true;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if required fields are missing', async () => {
    const dto = new CreateEventDto();
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail if bannerPhotoUrl is not a string', async () => {
    const dto = new CreateEventDto();
    dto.name = 'Event';
    // @ts-ignore: Intentional wrong type
    dto.bannerPhotoUrl = 12345;
    dto.isPublic = true;

    const errors = await validate(dto);
    const bannerError = errors.find(err => err.property === 'bannerPhotoUrl');
    expect(bannerError).toBeDefined();
  });

  it('should fail if isPublic is not a boolean', async () => {
    const dto = new CreateEventDto();
    dto.name = 'Event';
    dto.bannerPhotoUrl = 'https://example.com/banner.jpg';
    // @ts-ignore: Intentional wrong type
    dto.isPublic = 'yes';

    const errors = await validate(dto);
    const isPublicError = errors.find(err => err.property === 'isPublic');
    expect(isPublicError).toBeDefined();
  });
});
