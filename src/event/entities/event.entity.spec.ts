import { Event } from './event.entity';

describe('EventEntity', () => {
  it('should create an Event instance', () => {
    const event = new Event();
    expect(event).toBeInstanceOf(Event);
  });

  it('should trim and normalize fields before insert', () => {
    const event = new Event();
    event.name = '  My Cool Event  ';
    event.bannerPhotoUrl = '  HTTPS://EXAMPLE.COM/BANNER.JPG  ';
    event.checkFieldsBeforeInsert();

    expect(event.name).toBe('My Cool Event');
    expect(event.bannerPhotoUrl).toBe('https://example.com/banner.jpg');
  });

  it('should trim and normalize fields before update', () => {
    const event = new Event();
    event.name = '  Another Event ';
    event.bannerPhotoUrl = '  https://TEST.com/Image.PNG ';
    event.checkFieldsBeforeUpdate();

    expect(event.name).toBe('Another Event');
    expect(event.bannerPhotoUrl).toBe('https://test.com/image.png');
  });
});
