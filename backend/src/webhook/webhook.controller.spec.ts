import { Test, TestingModule } from '@nestjs/testing';
import { ClerkController } from './webhook.controller';

describe('WebhookController', () => {
  let controller: ClerkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClerkController],
    }).compile();

    controller = module.get<ClerkController>(ClerkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
