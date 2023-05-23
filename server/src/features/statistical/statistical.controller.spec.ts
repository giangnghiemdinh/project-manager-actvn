import { Test, TestingModule } from '@nestjs/testing';
import { StatisticalController } from './statistical.controller';

describe('StatisticalController', () => {
  let controller: StatisticalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatisticalController],
    }).compile();

    controller = module.get<StatisticalController>(StatisticalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
