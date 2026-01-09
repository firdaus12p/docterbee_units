# Database Schema Documentation

## Overview

Database: `docterbee_units` (MySQL)
ORM/Driver: `mysql2` (Raw SQL with migrations in `backend/db.mjs`)

## Tables

### `users`
Core user table for authentication and profile management.
- `id` (PK): INT AUTO_INCREMENT
- `name`: VARCHAR(100)
- `email`: VARCHAR(100) UNIQUE
- `phone`: VARCHAR(20) UNIQUE
- `card_type`: ENUM (Active-Worker, Family-Member, etc.)
- `password`: VARCHAR(255) (bcrypt)
- `is_active`: TINYINT(1)
- `is_email_verified`: TINYINT(1)
- `pending_email`: VARCHAR(100) (For email change)

### `admins`
Separate table for administrative access.
- `id` (PK): INT
- `username`: VARCHAR(50) UNIQUE
- `role`: ENUM (super-admin, admin, moderator)

### `products`
Store inventory items.
- `id` (PK): INT
- `name`: VARCHAR(255)
- `category`: ENUM (Zona Sunnah, 1001 Rempah, etc.)
- `price`: DECIMAL(10,2)
- `member_price`: DECIMAL(10,2)
- `stock`: INT (Global/Legacy stock)
- `image_url`: VARCHAR(500)

### `product_stocks`
Multi-location inventory tracking.
- `id` (PK): INT
- `product_id`: FK -> products.id
- `location_id`: FK -> locations.id
- `quantity`: INT

### `locations`
Physical store locations.
- `id` (PK): INT
- `name`: VARCHAR(100)
- `type`: ENUM (store, warehouse)

### `orders`
Store transactions.
- `id` (PK): INT
- `order_number`: VARCHAR(50) UNIQUE
- `user_id`: FK -> users.id
- `items`: JSON (Snapshot of order items)
- `total_amount`: DECIMAL(10,2)
- `status`: ENUM (pending, completed, cancelled)
- `payment_status`: ENUM (pending, paid)
- `location_id`: FK -> locations.id

### `bookings`
Service appointments.
- `id` (PK): INT
- `service_name`: VARCHAR(255)
- `booking_date`: DATE
- `status`: ENUM (pending, confirmed, completed, cancelled)

### `events` & `event_registrations`
Event management system.
- `events`: Event details (date, speaker, location)
- `event_registrations`: User signups for events

### `journeys` & `journey_units` & `unit_items`
Educational/Progression system content.
- `journeys`: Top level tracks (e.g. Hidup Sehat)
- `journey_units`: Modules within a journey
- `unit_items`: Content items/questions

### `user_progress`
Tracks user progress in journeys.
- `user_id`: FK -> users.id
- `unit_data`: JSON (Progress state)

### `rewards` & `reward_redemptions`
Loyalty program.
- `rewards`: Catalog of redeemable items
- `reward_redemptions`: History of user redemptions

### `coupons` & `coupon_usage`
Discount system.
- `coupons`: Discount codes configuration
- `coupon_usage`: Track usage history per user

## Relationships

- `users` 1:N `orders`
- `users` 1:N `bookings`
- `users` 1:N `event_registrations`
- `users` 1:N `reward_redemptions`
- `products` 1:N `product_stocks`
- `locations` 1:N `product_stocks`
- `locations` 1:N `orders`
- `journeys` 1:N `journey_units` 1:N `unit_items`
