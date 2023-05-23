import { MigrationInterface, QueryRunner } from 'typeorm';
import { UserEntity } from '../../features/user/models';
import { Role, TwoFactoryMethod } from '../../common/constants';

const users = [
  {
    fullName: 'Administrator',
    email: 'admin@actvn.edu.vn',
    phone: '0386999646',
    gender: 1,
    role: Role.ADMINISTRATOR,
    twoFactory: TwoFactoryMethod.OTP,
  },
  {
    fullName: 'Nghiêm Đình Giang',
    email: 'nghiemgiangit@gmail.com',
    phone: '0386999646',
    gender: 1,
    role: Role.LECTURER,
    twoFactory: TwoFactoryMethod.EMAIL,
  },
];

export class addUsers1677138456874 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(UserEntity)
      .values(users)
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
