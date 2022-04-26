import { Migration } from '@mikro-orm/migrations';

export class Migration20220416193303 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user" ("id" serial primary key, "created_at" timestamptz(0) not null default \'now\', "updated_at" timestamptz(0) not null default \'now\', "username" text not null);');

    this.addSql('create table "post" ("id" serial primary key, "created_at" timestamptz(0) not null default \'now\', "updated_at" timestamptz(0) not null default \'now\', "title" text not null);');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "user" cascade;');

    this.addSql('drop table if exists "post" cascade;');
  }

}
