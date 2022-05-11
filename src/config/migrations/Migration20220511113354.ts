import { Migration } from '@mikro-orm/migrations';

export class Migration20220511113354 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add constraint "user_password_unique" unique ("password");');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" drop constraint "user_password_unique";');
  }

}
