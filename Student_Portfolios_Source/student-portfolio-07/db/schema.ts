import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const portfolios=sqliteTable('portfolios',{id:integer('id').primaryKey(),data:text('data').notNull(),revision:integer('revision').notNull().default(1),updatedAt:text('updated_at').notNull()});
export const settings=sqliteTable('settings',{id:integer('id').primaryKey(),studentEmail:text('student_email').notNull().default('')});
