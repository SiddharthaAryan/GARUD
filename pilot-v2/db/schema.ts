import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const users=sqliteTable('pilot_users',{id:text('id').primaryKey(),username:text('username').notNull().unique(),name:text('name').notNull(),role:text('role').notNull(),passwordHash:text('password_hash').notNull(),salt:text('salt').notNull(),wardId:integer('ward_id'),since:integer('since'),version:integer('version').notNull().default(0),lastEventId:text('last_event_id'),active:integer('active').notNull().default(1)});
export const wards=sqliteTable('pilot_wards',{id:integer('id').primaryKey(),name:text('name').notNull(),floor:text('floor').notNull(),createdAt:integer('created_at').notNull(),qrGeneratedAt:integer('qr_generated_at'),qrVersion:integer('qr_version').notNull().default(0)});
export const events=sqliteTable('pilot_events',{id:text('id').primaryKey(),userId:text('user_id').notNull(),wardId:integer('ward_id').notNull(),action:text('action').notNull(),at:integer('at').notNull()});
export const sessions=sqliteTable('pilot_sessions',{hash:text('hash').primaryKey(),userId:text('user_id').notNull(),expiresAt:integer('expires_at').notNull()});
export const settings=sqliteTable('pilot_settings',{key:text('key').primaryKey(),value:text('value').notNull()});
export const attempts=sqliteTable('pilot_attempts',{key:text('key').primaryKey(),count:integer('count').notNull(),since:integer('since').notNull()});
