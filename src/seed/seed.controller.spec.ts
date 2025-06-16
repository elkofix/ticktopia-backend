import { Test, TestingModule } from '@nestjs/testing';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';

describe('SeedController', () => {
  let controller: SeedController;
  let seedService: SeedService;

  const mockSeedService = {
    runSeed: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeedController],
      providers: [
        {
          provide: SeedService,
          useValue: mockSeedService,
        },
      ],
    }).compile();

    controller = module.get<SeedController>(SeedController);
    seedService = module.get<SeedService>(SeedService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('executeSeed', () => {
    it('should call seedService.runSeed and return its result', async () => {
      const mockResult = 'SEED EXECUTED';
      mockSeedService.runSeed.mockResolvedValue(mockResult);

      const result = await controller.executeSeed();

      expect(seedService.runSeed).toHaveBeenCalled();
      expect(result).toBe(mockResult);
    });
  });
});
