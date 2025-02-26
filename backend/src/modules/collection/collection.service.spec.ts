import { Test, TestingModule } from '@nestjs/testing';
import { CollectionsService } from './collection.service';

describe('CollectionService', () => {
  let service: CollectionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CollectionsService],
    }).compile();

    service = module.get<CollectionsService>(CollectionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
