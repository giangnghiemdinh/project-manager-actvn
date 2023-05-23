import { MigrationInterface, QueryRunner } from 'typeorm';
import { DepartmentEntity } from '../../features/department/models';

const departments = [
  {
    name: 'An toàn thông tin',
    shortName: 'AT',
    description: 'Khoa an toàn thông tin',
  },
  {
    name: 'Công nghệ thông tin',
    shortName: 'CT',
    description: 'Khoa công nghệ thông tin',
  },
  {
    name: 'Điện tử viễn thông',
    shortName: 'DT',
    description: 'Khoa điện tử viễn thông',
  },
];

export class addDepartments1677138408548 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(DepartmentEntity)
      .values(departments)
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
