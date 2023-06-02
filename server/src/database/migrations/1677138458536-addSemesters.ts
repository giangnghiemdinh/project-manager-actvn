import { MigrationInterface, QueryRunner } from 'typeorm';
import { SemesterEntity } from '../../features/semester/models';

const semester = [
  {
    name: '1_2022-2023',
    start: '2022-08-15T00:00:00.000Z',
    end: '2022-12-31T00:00:00.000Z',
  },
];

export class addSemester1677138458536 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(SemesterEntity)
      .values(semester)
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
