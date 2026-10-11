-- ============================================================================
--  STYLERENT - POSTGRESQL DATABASE MASTER SCRIPT
--  Smart Clothing Rental & Inventory Management Platform
-- ----------------------------------------------------------------------------
--  Target   : PostgreSQL 14+ (UTF8)
--  Backend  : Spring Boot 3.x / Spring Data JPA / Hibernate
--  Scope    : PostgreSQL ONLY. Converted 1:1 from stylerentdb.sql (MySQL).
--
--  Entities : users, roles, category, clothing, rental, rental_item, payment, review
--
--  ER MODEL
--    USER     1 --- M  RENTAL
--    RENTAL   1 --- M  RENTAL_ITEM
--    CLOTHING M --- 1  CATEGORY
--    HOST     1 --- M  CLOTHING          (users -> clothing via host_id)
--    RENTAL_ITEM M --- 1 CLOTHING
--    CLOTHING 1 --- M  CLOTHING_SIZE
--    USER     1 --- M  REVIEW
--    CLOTHING 1 --- M  REVIEW
--    RENTAL   1 --- M  PAYMENT
--    ROLES    1 --- M  USERS             (users.role references roles.role_name)
--
--  Three platform roles: USER (customer), HOST (clothing provider), ADMIN.
--
--  NOTE: clothing_id is intentionally NOT stored on `rental`.
--        A rental can hold many clothing items; rental_item is the bridge.
--
--  MySQL -> PostgreSQL conversion notes:
--    * AUTO_INCREMENT            -> BIGSERIAL / SERIAL (sequences reset below)
--    * TINYINT(1) is_active      -> BOOLEAN (TRUE/FALSE instead of 1/0)
--    * TINYINT rating            -> SMALLINT + CHECK (rating BETWEEN 1 AND 5)
--    * Inline KEY / UNIQUE KEY   -> separate CREATE INDEX statements
--    * FULLTEXT KEY              -> GIN index on to_tsvector (query 8.1 uses it)
--    * DATE_ADD/DATE_SUB         -> CURRENT_DATE/NOW() +/- INTERVAL '...'
--    * GROUP_CONCAT              -> STRING_AGG (query 8.9)
--    * ORDER BY FIELD(...)       -> CASE expression (query 8.3b)
--    * JPA GenerationType.IDENTITY works unchanged on PostgreSQL.
--
--  Run as:  psql -U postgres -f stylerentdb_postgres.sql
--  This script is re-runnable (drops and recreates the database).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. DATABASE
-- ----------------------------------------------------------------------------
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'stylerentdb' AND pid <> pg_backend_pid();

DROP DATABASE IF EXISTS stylerentdb;
CREATE DATABASE stylerentdb ENCODING 'UTF8' TEMPLATE template0;

\c stylerentdb

-- ----------------------------------------------------------------------------
-- 2. CLEANUP (reverse dependency order; CASCADE replaces FOREIGN_KEY_CHECKS)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS review CASCADE;
DROP TABLE IF EXISTS payment CASCADE;
DROP TABLE IF EXISTS rental_item CASCADE;
DROP TABLE IF EXISTS rental CASCADE;
DROP TABLE IF EXISTS clothing_size CASCADE;
DROP TABLE IF EXISTS clothing CASCADE;
DROP TABLE IF EXISTS category CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ============================================================================
-- 3. TABLE DEFINITIONS
-- ============================================================================

-- roles (reference/lookup: the three platform roles)
CREATE TABLE roles (
  role_id      BIGSERIAL    NOT NULL,
  role_name    VARCHAR(10)  NOT NULL,
  description  VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (role_id),
  CONSTRAINT uq_roles_name UNIQUE (role_name)
);

INSERT INTO roles (role_id, role_name, description) VALUES
(1, 'USER',  'Customer who browses and rents clothes'),
(2, 'HOST',  'Clothing provider who uploads and manages clothes'),
(3, 'ADMIN', 'Platform administrator');

-- users
CREATE TABLE users (
  user_id     BIGSERIAL     NOT NULL,
  name        VARCHAR(120)  NOT NULL,
  email       VARCHAR(160)  NOT NULL,
  password    VARCHAR(255)  NOT NULL,               -- BCrypt hash, never plain text
  phone       VARCHAR(20)   DEFAULT NULL,
  address     VARCHAR(255)  DEFAULT NULL,
  role        VARCHAR(10)   NOT NULL DEFAULT 'USER',
  is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT uq_users_email UNIQUE (email),
  CONSTRAINT fk_users_role
    FOREIGN KEY (role) REFERENCES roles (role_name)
    ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_active ON users (is_active);

-- category
CREATE TABLE category (
  category_id    BIGSERIAL    NOT NULL,
  category_name  VARCHAR(100) NOT NULL,
  description    VARCHAR(500) DEFAULT NULL,
  PRIMARY KEY (category_id),
  CONSTRAINT uq_category_name UNIQUE (category_name)
);

-- clothing
-- The `size` column was removed in favour of the child table `clothing_size`
-- (one clothing item can have many sizes, each with its own stock).
-- `host_id` links every clothing item to the HOST user who uploaded it.
-- Rental pricing is Host-defined per duration tier (1/2/3 days, 1 week);
-- `price_per_day` remains the general base rate used as a fallback.
CREATE TABLE clothing (
  clothing_id    BIGSERIAL      NOT NULL,
  host_id        BIGINT         NOT NULL,
  category_id    BIGINT         NOT NULL,
  name           VARCHAR(150)   NOT NULL,
  description    TEXT           DEFAULT NULL,
  price_per_day  DECIMAL(10,2)  NOT NULL,
  price_1_day    DECIMAL(10,2)  NOT NULL,
  price_2_day    DECIMAL(10,2)  NOT NULL,
  price_3_day    DECIMAL(10,2)  NOT NULL,
  price_1_week   DECIMAL(10,2)  NOT NULL,
  image_url      VARCHAR(500)   DEFAULT NULL,
  color          VARCHAR(60)    DEFAULT NULL,
  stock          INT            NOT NULL DEFAULT 1,
  gender         VARCHAR(10)    NOT NULL DEFAULT 'WOMEN',
  is_active      BOOLEAN        NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (clothing_id),
  CONSTRAINT fk_clothing_host
    FOREIGN KEY (host_id) REFERENCES users (user_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_clothing_category
    FOREIGN KEY (category_id) REFERENCES category (category_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_clothing_price CHECK (price_per_day > 0),
  CONSTRAINT chk_clothing_tier CHECK (price_1_day > 0 AND price_2_day > 0 AND price_3_day > 0 AND price_1_week > 0),
  CONSTRAINT chk_clothing_stock CHECK (stock >= 0)
);
CREATE INDEX idx_clothing_host ON clothing (host_id);
CREATE INDEX idx_clothing_category ON clothing (category_id);
CREATE INDEX idx_clothing_name ON clothing (name);
CREATE INDEX idx_clothing_color ON clothing (color);
CREATE INDEX idx_clothing_price ON clothing (price_per_day);
CREATE INDEX idx_clothing_stock ON clothing (stock);
CREATE INDEX idx_clothing_gender ON clothing (gender);
CREATE INDEX ft_clothing_search ON clothing
  USING gin (to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- clothing_size (child of clothing)
CREATE TABLE clothing_size (
  clothing_size_id SERIAL       NOT NULL,
  clothing_id      BIGINT       NOT NULL,
  size             VARCHAR(20)  NOT NULL,
  stock            INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (clothing_size_id),
  CONSTRAINT uq_clothing_size UNIQUE (clothing_id, size),
  CONSTRAINT fk_csize_clothing
    FOREIGN KEY (clothing_id) REFERENCES clothing (clothing_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_csize_stock CHECK (stock >= 0)
);
CREATE INDEX idx_csize_clothing ON clothing_size (clothing_id);
CREATE INDEX idx_csize_size ON clothing_size (size);

-- rental
CREATE TABLE rental (
  rental_id     BIGSERIAL     NOT NULL,
  user_id       BIGINT        NOT NULL,
  start_date    DATE          NOT NULL,
  end_date      DATE          NOT NULL,
  total_amount  DECIMAL(10,2) NOT NULL,
  status        VARCHAR(15)   NOT NULL DEFAULT 'Pending',
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (rental_id),
  CONSTRAINT fk_rental_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_rental_status
    CHECK (status IN ('Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled')),
  CONSTRAINT chk_rental_dates CHECK (end_date > start_date),
  CONSTRAINT chk_rental_total CHECK (total_amount >= 0)
);
CREATE INDEX idx_rental_user ON rental (user_id);
CREATE INDEX idx_rental_status ON rental (status);
CREATE INDEX idx_rental_dates ON rental (start_date, end_date);
CREATE INDEX idx_rental_created ON rental (created_at);

-- rental_item (bridge between rental and clothing)
CREATE TABLE rental_item (
  rental_item_id  BIGSERIAL     NOT NULL,
  rental_id       BIGINT        NOT NULL,
  clothing_id     BIGINT        NOT NULL,
  size            VARCHAR(20)   DEFAULT NULL,
  quantity        INT           NOT NULL DEFAULT 1,
  price_per_day   DECIMAL(10,2) NOT NULL,           -- snapshot at booking time
  rental_days     INT           NOT NULL,
  subtotal        DECIMAL(10,2) NOT NULL,           -- price_per_day * days * quantity
  PRIMARY KEY (rental_item_id),
  CONSTRAINT fk_ritem_rental
    FOREIGN KEY (rental_id) REFERENCES rental (rental_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ritem_clothing
    FOREIGN KEY (clothing_id) REFERENCES clothing (clothing_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_ritem_quantity CHECK (quantity > 0),
  CONSTRAINT chk_ritem_days CHECK (rental_days > 0),
  CONSTRAINT chk_ritem_price CHECK (price_per_day >= 0),
  CONSTRAINT chk_ritem_subtotal CHECK (subtotal >= 0)
);
CREATE INDEX idx_ritem_rental ON rental_item (rental_id);
CREATE INDEX idx_ritem_clothing ON rental_item (clothing_id);

-- payment
-- Never store card numbers, CVV or payment credentials. Only method + status + txn id.
CREATE TABLE payment (
  payment_id      BIGSERIAL     NOT NULL,
  rental_id       BIGINT        NOT NULL,
  amount          DECIMAL(10,2) NOT NULL,
  payment_method  VARCHAR(10)   NOT NULL,
  payment_date    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  payment_status  VARCHAR(10)   NOT NULL DEFAULT 'Pending',
  transaction_id  VARCHAR(60)   DEFAULT NULL,
  PRIMARY KEY (payment_id),
  CONSTRAINT uq_payment_txn UNIQUE (transaction_id),
  CONSTRAINT fk_payment_rental
    FOREIGN KEY (rental_id) REFERENCES rental (rental_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_payment_method CHECK (payment_method IN ('UPI', 'Card', 'Cash')),
  CONSTRAINT chk_payment_status CHECK (payment_status IN ('Pending', 'Paid', 'Failed', 'Refunded')),
  CONSTRAINT chk_payment_amount CHECK (amount >= 0)
);
CREATE INDEX idx_payment_rental ON payment (rental_id);
CREATE INDEX idx_payment_status ON payment (payment_status);

-- review
CREATE TABLE review (
  review_id    BIGSERIAL      NOT NULL,
  user_id      BIGINT         NOT NULL,
  clothing_id  BIGINT         NOT NULL,
  rating       SMALLINT       NOT NULL,
  comment      VARCHAR(1000)  DEFAULT NULL,
  created_at   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (review_id),
  CONSTRAINT fk_review_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_review_clothing
    FOREIGN KEY (clothing_id) REFERENCES clothing (clothing_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_review_rating CHECK (rating BETWEEN 1 AND 5)
);
CREATE INDEX idx_review_clothing ON review (clothing_id);
CREATE INDEX idx_review_user ON review (user_id);
CREATE INDEX idx_review_rating ON review (rating);

-- ============================================================================
-- 4. SAMPLE DATA
-- ============================================================================

-- users (5)
-- Passwords are BCrypt HASHES, never plain text.
-- Demo logins (used by the README and the frontend one-tap buttons):
--   customer@stylerent.com / customer123
--   meera@stylerent.com    / customer123
--   rohan@stylerent.com    / customer123
--   host@stylerent.com     / host123
--   admin@stylerent.com    / admin123
-- Regenerate real hashes with Spring Security BCryptPasswordEncoder.
INSERT INTO users (user_id, name, email, password, phone, address, role, created_at) VALUES
(1, 'Aarav Sharma',   'customer@stylerent.com', '$2a$10$9egIKAtIg7vmczevAbwWvu1nDaZVFSZ1xE895XGfpcLD.jnZZCjVO', '9810011001', '12 Marine Drive, Mumbai',    'USER',  '2026-01-05 10:15:00'),
(2, 'Meera Kapoor',   'meera@stylerent.com',    '$2a$10$9egIKAtIg7vmczevAbwWvu1nDaZVFSZ1xE895XGfpcLD.jnZZCjVO', '9810011002', '44 Indiranagar, Bengaluru',  'USER',  '2026-01-18 09:40:00'),
(3, 'Rohan Verma',    'rohan@stylerent.com',    '$2a$10$9egIKAtIg7vmczevAbwWvu1nDaZVFSZ1xE895XGfpcLD.jnZZCjVO', '9810011003', '7 Banjara Hills, Hyderabad', 'USER',  '2026-02-02 14:05:00'),
(4, 'Vastra Studio',  'host@stylerent.com',     '$2a$10$3JP4b9KmfTu7Sjl5xtw/S.raxQjTDFrI07gudgm6tVlYmIWWJrw/y', '9810011004', '3 Hauz Khas, New Delhi',     'HOST',  '2026-01-02 08:00:00'),
(5, 'Platform Admin', 'admin@stylerent.com',    '$2a$10$6sSJ9Y5ba3rtPnjKlLKHpucCABqR5915L.xiz6Ock6NA0WuOXe5iS', '9810011005', 'StyleRent HQ, Mumbai',       'ADMIN', '2026-01-01 00:00:00');

-- category (10) - mirrors the StyleRent storefront
INSERT INTO category (category_id, category_name, description) VALUES
(1,  'Sarees',           'Six yards of pure drama - silk, heritage weaves and contemporary drapes for every occasion.'),
(2,  'Lehenga',          'Bridal-ready skirts, cholis and dupattas in pastel and jewel tones with couture embroidery.'),
(3,  'Gowns',            'Floor-sweeping evening gowns in champagne, emerald and midnight for galas and receptions.'),
(4,  'Anarkali',         'Flowing silhouettes with intricate detailing - effortless grace from mehendi to reception.'),
(5,  'Sherwani',         'Regal groom wear in ivory, wine and gold with hand-finished embroidery.'),
(6,  'Suits',            'Tailored blazers and sharp suits in modern cuts - from boardroom to black-tie.'),
(7,  'Tuxedo',           'Classic and contemporary tuxedos for the most formal of evenings.'),
(8,  'Party Wear',       'Sequins, satin and statement silhouettes made for dancing till dawn.'),
(9,  'Wedding Wear',     'The complete wedding wardrobe - bridal, groom and every guest in between.'),
(10, 'Traditional Wear', 'Timeless ethnic pieces celebrating Indian craft heritage.');

-- clothing (17) - all uploaded by host user 4 (Vastra Studio)
-- Tier prices: price_per_day (1-day base), 2/3-day and 1-week rates defined by
-- the host. Discounted per-day as the duration grows (weekly ≈ 60% of daily x7).
-- gender groups the storefront dashboard into MEN / WOMEN / KIDS.
INSERT INTO clothing (clothing_id, host_id, category_id, name, description,
                      price_per_day, price_1_day, price_2_day, price_3_day, price_1_week,
                      image_url, color, stock, gender, is_active, created_at) VALUES
(1, 4, 2, 'Royal Ivory Lehenga',
    'A couture ivory lehenga in silk organza, hand-embroidered with gold zardozi florals. Full-skirt silhouette with a matching blouse and dupatta.',
    4800.00, 4800.00, 8160.00, 11520.00, 20160.00,
    'https://images.pexels.com/photos/28210864/pexels-photo-28210864.jpeg?auto=compress&cs=tinysrgb&w=900', 'Ivory', 6, 'WOMEN', TRUE, '2026-08-01 10:00:00'),
(2, 4, 3, 'Midnight Black Evening Gown',
    'A sculptural black evening gown in liquid silk with a sequined bodice and dramatic side slit. Elegant for galas and midnight soirees.',
    2900.00, 2900.00, 4930.00, 6960.00, 12180.00,
    'https://images.pexels.com/photos/32100328/pexels-photo-32100328.jpeg?auto=compress&cs=tinysrgb&w=900', 'Black', 8, 'WOMEN', TRUE, '2026-07-20 10:00:00'),
(3, 4, 1, 'Emerald Silk Saree',
    'Handwoven emerald raw silk saree with a contrast gold tissue border and blouse piece. A heritage drape for every celebration.',
    2200.00, 2200.00, 3740.00, 5280.00, 9240.00,
    'https://images.pexels.com/photos/36114637/pexels-photo-36114637.jpeg?auto=compress&cs=tinysrgb&w=900', 'Emerald', 10, 'WOMEN', TRUE, '2026-06-12 10:00:00'),
(4, 4, 7, 'Classic Black Tuxedo',
    'The essential black tuxedo with peak lapels, satin trim and a tailored silhouette. Paired with a crisp shirt and bow tie.',
    1999.00, 1999.00, 3398.30, 4797.60, 8395.80,
    'https://images.pexels.com/photos/35253986/pexels-photo-35253986.jpeg?auto=compress&cs=tinysrgb&w=900', 'Black', 5, 'MEN', TRUE, '2026-05-05 10:00:00'),
(5, 4, 5, 'Ivory Royal Sherwani',
    'A regal ivory sherwani in matka silk with intricate gold embroidery, paired with a churidar and safa. Groom-ready elegance.',
    5500.00, 5500.00, 9350.00, 13200.00, 23100.00,
    'https://images.pexels.com/photos/37439727/pexels-photo-37439727.jpeg?auto=compress&cs=tinysrgb&w=900', 'Ivory', 4, 'MEN', TRUE, '2026-07-01 10:00:00'),
(6, 4, 8, 'Rose Gold Party Dress',
    'A champagne-rose cocktail dress draped with micro sequins that catch every light. Short, celebratory and impossible to ignore.',
    1800.00, 1800.00, 3060.00, 4320.00, 7560.00,
    'https://images.pexels.com/photos/31860971/pexels-photo-31860971.jpeg?auto=compress&cs=tinysrgb&w=900', 'Rose Gold', 12, 'WOMEN', TRUE, '2026-09-02 10:00:00'),
(7, 4, 6, 'Burgundy Wedding Suit',
    'A deep burgundy three-piece wedding suit in premium wool blend. Modern groom styling with a velvet-soft finish.',
    3200.00, 3200.00, 5440.00, 7680.00, 13440.00,
    'https://images.pexels.com/photos/32938673/pexels-photo-32938673.jpeg?auto=compress&cs=tinysrgb&w=900', 'Burgundy', 7, 'MEN', TRUE, '2026-06-18 10:00:00'),
(8, 4, 4, 'Pastel Pink Anarkali',
    'A flowing pastel pink anarkali in georgette with gota-patti accents and a flared skirt. Soft and romantic for daytime celebrations.',
    1500.00, 1500.00, 2550.00, 3600.00, 6300.00,
    'https://images.pexels.com/photos/7037121/pexels-photo-7037121.jpeg?auto=compress&cs=tinysrgb&w=900', 'Pastel Pink', 9, 'WOMEN', TRUE, '2026-08-21 10:00:00'),
(9, 4, 3, 'Champagne Evening Gown',
    'A champagne gown in silk mikado with a sweeping train and delicate sequin embroidery. Red-carpet presence without the price tag.',
    3900.00, 3900.00, 6630.00, 9360.00, 16380.00,
    'https://images.pexels.com/photos/34959983/pexels-photo-34959983.jpeg?auto=compress&cs=tinysrgb&w=900', 'Champagne', 6, 'WOMEN', TRUE, '2026-07-30 10:00:00'),
(10, 4, 6, 'Navy Blue Tailored Blazer',
    'A sharp single-breasted navy blazer in crisp tropical wool. The wardrobe anchor that elevates everything it is worn with.',
    1200.00, 1200.00, 2040.00, 2880.00, 5040.00,
    'https://images.pexels.com/photos/20440142/pexels-photo-20440142.jpeg?auto=compress&cs=tinysrgb&w=900', 'Navy', 15, 'MEN', TRUE, '2026-04-10 10:00:00'),
(11, 4, 1, 'Pearl White Saree',
    'A pearl-white silk saree with silver zari border and soft floral embroidery. Bridal grace and minimal-luxury energy in one drape.',
    2600.00, 2600.00, 4420.00, 6240.00, 10920.00,
    'https://images.pexels.com/photos/11665190/pexels-photo-11665190.jpeg?auto=compress&cs=tinysrgb&w=900', 'Pearl White', 8, 'WOMEN', TRUE, '2026-07-12 10:00:00'),
(12, 4, 5, 'Wine Velvet Sherwani',
    'A wine-toned velvet sherwani with tonal embroidery and a sculpted collar. Old-world luxe for grooms who want to stand apart.',
    4200.00, 4200.00, 7140.00, 10080.00, 17640.00,
    'https://images.pexels.com/photos/5653274/pexels-photo-5653274.jpeg?auto=compress&cs=tinysrgb&w=900', 'Wine', 5, 'MEN', TRUE, '2026-06-01 10:00:00'),
(13, 4, 2, 'Lavender Organza Lehenga',
    'A dreamy lavender lehenga in crisp organza, layered with a soft tulle under-skirt and floral applique. Ethereal for cocktail events.',
    3600.00, 3600.00, 6120.00, 8640.00, 15120.00,
    'https://images.pexels.com/photos/14950337/pexels-photo-14950337.jpeg?auto=compress&cs=tinysrgb&w=900', 'Lavender', 7, 'WOMEN', TRUE, '2026-09-10 10:00:00'),
(14, 4, 3, 'Forest Green Reception Gown',
    'A deep forest green gown with an asymmetric neckline and fluid drape. Statement color for receptions and black-tie evenings.',
    2700.00, 2700.00, 4590.00, 6480.00, 11340.00,
    'https://images.pexels.com/photos/20331526/pexels-photo-20331526.jpeg?auto=compress&cs=tinysrgb&w=900', 'Forest Green', 9, 'WOMEN', TRUE, '2026-08-08 10:00:00'),
(15, 4, 1, 'Black Gold Designer Saree',
    'A black tissue saree woven with intricate gold motifs and a rich border. The ultimate evening drape - heritage, power, drama.',
    3300.00, 3300.00, 5610.00, 7920.00, 13860.00,
    'https://images.pexels.com/photos/38701455/pexels-photo-38701455.jpeg?auto=compress&cs=tinysrgb&w=900', 'Black & Gold', 6, 'WOMEN', TRUE, '2026-05-22 10:00:00'),
(16, 4, 2, 'Princess Party Lehenga',
    'A twirl-ready pastel lehenga for little royals with soft tulle layers and dainty flower applique. Sized for kids 6-10.',
    900.00, 900.00, 1530.00, 2160.00, 3780.00,
    'https://images.pexels.com/photos/31897218/pexels-photo-31897218.jpeg?auto=compress&cs=tinysrgb&w=900', 'Lilac', 8, 'KIDS', TRUE, '2026-09-15 10:00:00'),
(17, 4, 5, 'Little Prince Sherwani',
    'A charming mini sherwani with gold-trimmed embroidery and a matching kurta. Perfect for weddings and festive functions.',
    800.00, 800.00, 1360.00, 1920.00, 3360.00,
    'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=900', 'Ivory', 10, 'KIDS', TRUE, '2026-09-18 10:00:00');

-- clothing_size (one row per clothing item per size)
-- Per-size stock sums exactly to clothing.stock for every product.
INSERT INTO clothing_size (clothing_id, size, stock) VALUES
(1,  'S', 2), (1,  'M', 2), (1,  'L', 1), (1,  'XL', 1),
(2,  'XS', 2), (2, 'S', 2), (2,  'M', 2), (2,  'L', 2),
(3,  'Free Size', 10),
(4,  'S', 1), (4,  'M', 1), (4,  'L', 1), (4,  'XL', 1), (4,  'XXL', 1),
(5,  'M', 1), (5,  'L', 1), (5,  'XL', 1), (5,  'XXL', 1),
(6,  'XS', 3), (6, 'S', 3), (6,  'M', 3), (6,  'L', 3),
(7,  'S', 2), (7,  'M', 2), (7,  'L', 2), (7,  'XL', 1),
(8,  'S', 3), (8,  'M', 2), (8,  'L', 2), (8,  'XL', 2),
(9,  'XS', 2), (9, 'S', 2), (9,  'M', 1), (9,  'L', 1),
(10, 'S', 3), (10, 'M', 3), (10, 'L', 3), (10, 'XL', 3), (10, 'XXL', 3),
(11, 'Free Size', 8),
(12, 'M', 2), (12, 'L', 1), (12, 'XL', 1), (12, 'XXL', 1),
(13, 'S', 2), (13, 'M', 2), (13, 'L', 2), (13, 'XL', 1),
(14, 'XS', 2), (14, 'S', 2), (14, 'M', 2), (14, 'L', 2), (14, 'XL', 1),
(15, 'Free Size', 6),
(16, 'XS', 3), (16, 'S', 3), (16, 'M', 2),
(17, 'S', 4), (17, 'M', 4), (17, 'L', 2);

-- rental (6) - dates relative to CURRENT_DATE so availability is demonstrable
-- total_amount matches the summed rental_item tier-rate subtotals.
INSERT INTO rental (rental_id, user_id, start_date, end_date, total_amount, status, created_at) VALUES
(1, 1, CURRENT_DATE + INTERVAL '2 days',  CURRENT_DATE + INTERVAL '5 days',  17760.00, 'Confirmed', NOW() - INTERVAL '1 day'),
(2, 1, CURRENT_DATE - INTERVAL '5 days',  CURRENT_DATE - INTERVAL '2 days',  4797.60,  'Completed', NOW() - INTERVAL '8 days'),
(3, 2, CURRENT_DATE,                       CURRENT_DATE + INTERVAL '4 days', 22000.00, 'Active',    NOW() - INTERVAL '3 days'),
(4, 3, CURRENT_DATE + INTERVAL '1 day',   CURRENT_DATE + INTERVAL '3 days',  8670.00,  'Pending',   NOW() - INTERVAL '1 day'),
(5, 2, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '7 days',  9360.00,  'Completed', NOW() - INTERVAL '12 days'),
(6, 3, CURRENT_DATE - INTERVAL '3 days',  CURRENT_DATE - INTERVAL '1 day',   5280.00,  'Cancelled', NOW() - INTERVAL '5 days');

-- rental_item (8) - subtotal = tier rate * quantity
--   rate comes from the matching duration tier on the clothing record:
--   1 day -> price_1_day | 2 days -> price_2_day | 3 days -> price_3_day |
--   7+ days -> price_1_week | otherwise -> price_per_day * rental_days
INSERT INTO rental_item (rental_item_id, rental_id, clothing_id, size, quantity, price_per_day, rental_days, subtotal) VALUES
(1, 1, 1,  'M',  1, 11520.00, 3, 11520.00),   -- 3-day tier of clothing 1
(2, 1, 11, 'M',  1,  6240.00, 3,  6240.00),   -- 3-day tier of clothing 11
(3, 2, 4,  'L',  1,  4797.60, 3,  4797.60),   -- 3-day tier of clothing 4
(4, 3, 5,  'L',  1, 5500.00, 4, 22000.00),    -- 4 days -> fallback price_per_day x days
(5, 4, 6,  'M',  2,  3060.00, 2,  6120.00),   -- 2-day tier of clothing 6
(6, 4, 8,  'M',  1,  2550.00, 2,  2550.00),   -- 2-day tier of clothing 8
(7, 5, 9,  'S',  1,  9360.00, 3,  9360.00),   -- 3-day tier of clothing 9
(8, 6, 3,  'Free Size', 1,  5280.00, 3,  5280.00);   -- 3-day tier of clothing 3

-- payment (7) - demonstrates RENTAL 1:M PAYMENT (a Failed and a Pending attempt)
INSERT INTO payment (payment_id, rental_id, amount, payment_method, payment_date, payment_status, transaction_id) VALUES
(1, 1, 17760.00, 'UPI',  NOW() - INTERVAL '1 day',   'Paid',     'TXN-2026-1001'),
(2, 2,  4797.60, 'Card', NOW() - INTERVAL '8 days',  'Paid',     'TXN-2026-1002'),
(3, 3, 22000.00, 'Card', NOW() - INTERVAL '3 days',  'Paid',     'TXN-2026-1003'),
(4, 4,  8670.00, 'Cash', NOW() - INTERVAL '1 day',   'Pending',  NULL),
(5, 5,  9360.00, 'UPI',  NOW() - INTERVAL '12 days', 'Paid',     'TXN-2026-1005'),
(6, 6,  5280.00, 'Card', NOW() - INTERVAL '5 days',  'Refunded', 'TXN-2026-1006'),
(7, 4,  8670.00, 'Card', NOW() - INTERVAL '1 day',   'Failed',   'TXN-2026-1007');

-- review (14)
INSERT INTO review (review_id, user_id, clothing_id, rating, comment, created_at) VALUES
(1,  1, 1,  5, 'The Royal Ivory Lehenga was the star of my wedding. Impeccable fit and finish.', NOW() - INTERVAL '20 days'),
(2,  1, 4,  4, 'Sharp tuxedo, great fabric. Delivery was a day late though.',                   NOW() - INTERVAL '15 days'),
(3,  2, 5,  5, 'The sherwani exceeded expectations. Rich embroidery, very comfortable.',        NOW() - INTERVAL '18 days'),
(4,  2, 9,  5, 'Champagne gown fit like couture. Received endless compliments.',                NOW() - INTERVAL '9 days'),
(5,  3, 3,  4, 'Beautiful silk and true to color. Drape is a little heavy for summer.',         NOW() - INTERVAL '11 days'),
(6,  3, 8,  4, 'Lovely pastel anarkali, very light and easy to carry all day.',                 NOW() - INTERVAL '6 days'),
(7,  1, 11, 5, 'Pearl white saree is pure elegance. Zari work is exquisite.',                   NOW() - INTERVAL '13 days'),
(8,  2, 13, 4, 'Gorgeous lavender organza. Sizing runs slightly small.',                        NOW() - INTERVAL '4 days'),
(9,  3, 2,  5, 'Midnight gown is stunning - perfect for a gala night.',                         NOW() - INTERVAL '7 days'),
(10, 1, 6,  4, 'Fun party dress, sparkled all night. Good value rental.',                       NOW() - INTERVAL '3 days'),
(11, 2, 15, 5, 'Black gold saree is a showstopper. Felt like royalty.',                         NOW() - INTERVAL '2 days'),
(12, 3, 7,  4, 'Burgundy suit is well tailored and photographs beautifully.',                   NOW() - INTERVAL '5 days'),
(13, 1, 10, 5, 'Navy blazer is a wardrobe staple. Crisp and comfortable.',                      NOW() - INTERVAL '1 day'),
(14, 2, 12, 5, 'Wine velvet sherwani looked regal. Highly recommend.',                          NOW() - INTERVAL '2 days');

-- ----------------------------------------------------------------------------
-- 5. RESET SEQUENCES (explicit IDs were inserted above; advance each
--    sequence past its table max so future inserts never collide)
-- ----------------------------------------------------------------------------
SELECT setval('roles_role_id_seq',               (SELECT MAX(role_id) FROM roles));
SELECT setval('users_user_id_seq',               (SELECT MAX(user_id) FROM users));
SELECT setval('category_category_id_seq',        (SELECT MAX(category_id) FROM category));
SELECT setval('clothing_clothing_id_seq',        (SELECT MAX(clothing_id) FROM clothing));
SELECT setval('clothing_size_clothing_size_id_seq', (SELECT MAX(clothing_size_id) FROM clothing_size));
SELECT setval('rental_rental_id_seq',            (SELECT MAX(rental_id) FROM rental));
SELECT setval('rental_item_rental_item_id_seq',  (SELECT MAX(rental_item_id) FROM rental_item));
SELECT setval('payment_payment_id_seq',          (SELECT MAX(payment_id) FROM payment));
SELECT setval('review_review_id_seq',            (SELECT MAX(review_id) FROM review));

-- ============================================================================
-- 6. RELATIONSHIP EXPLANATION
-- ============================================================================
-- users (1) -----< rental (M)
--     rental.user_id -> users.user_id
--     One user places many rentals. Deleting a user cascades to their rentals.
--
-- rental (1) -----< rental_item (M)
--     rental_item.rental_id -> rental.rental_id
--     One rental can contain many items. Deleting a rental removes its items.
--
-- clothing (1) -----< rental_item (M)
--     rental_item.clothing_id -> clothing.clothing_id
--     One clothing item appears in many rentals over time.
--     RESTRICT blocks deleting a clothing item that has rental history.
--
-- category (1) -----< clothing (M)
--     clothing.category_id -> category.category_id
--     One category holds many clothing items. RESTRICT protects in-use categories.
--
-- clothing (1) -----< clothing_size (M)
--     clothing_size.clothing_id -> clothing.clothing_id
--     One clothing item has many sizes (S, M, L, XL, ...), each with its own
--     stock. Deleting a clothing item cascades to its size rows.
--     UNIQUE (clothing_id, size) prevents duplicate size records per item.
--
-- users (1) -----< review (M)     review.user_id     -> users.user_id
-- clothing (1) -----< review (M)  review.clothing_id -> clothing.clothing_id
--     A user writes reviews; a clothing item collects many reviews.
--
-- rental (1) -----< payment (M)
--     payment.rental_id -> rental.rental_id
--     A rental can have multiple payment attempts (e.g. Failed then Paid/Refunded).

-- ============================================================================
-- 7. BASIC SELECT QUERIES
-- ============================================================================
-- \dt
-- \d users
-- \d roles
-- \d category
-- \d clothing
-- \d clothing_size
-- \d rental
-- \d rental_item
-- \d payment
-- \d review
-- SELECT * FROM users;
-- SELECT * FROM roles;
-- SELECT * FROM category;
-- SELECT * FROM clothing;
-- SELECT * FROM clothing_size;
-- SELECT * FROM rental;
-- SELECT * FROM rental_item;
-- SELECT * FROM payment;
-- SELECT * FROM review;

-- Row counts / integrity spot checks
SELECT 'users'         AS table_name, COUNT(*) AS rows_total FROM users
UNION ALL SELECT 'roles',          COUNT(*) FROM roles
UNION ALL SELECT 'category',      COUNT(*) FROM category
UNION ALL SELECT 'clothing',      COUNT(*) FROM clothing
UNION ALL SELECT 'clothing_size', COUNT(*) FROM clothing_size
UNION ALL SELECT 'rental',        COUNT(*) FROM rental
UNION ALL SELECT 'rental_item',   COUNT(*) FROM rental_item
UNION ALL SELECT 'payment',       COUNT(*) FROM payment
UNION ALL SELECT 'review',        COUNT(*) FROM review;

-- Orphan check (all should return 0)
SELECT COUNT(*) AS orphan_clothing FROM clothing c   LEFT JOIN category cat ON c.category_id  = cat.category_id  WHERE cat.category_id IS NULL;
SELECT COUNT(*) AS orphan_csize    FROM clothing_size cs LEFT JOIN clothing c ON cs.clothing_id = c.clothing_id WHERE c.clothing_id IS NULL;
SELECT COUNT(*) AS orphan_rental   FROM rental r     LEFT JOIN users    u   ON r.user_id      = u.user_id        WHERE u.user_id IS NULL;
SELECT COUNT(*) AS orphan_ritem_r  FROM rental_item ri LEFT JOIN rental  r   ON ri.rental_id   = r.rental_id      WHERE r.rental_id IS NULL;
SELECT COUNT(*) AS orphan_ritem_c  FROM rental_item ri LEFT JOIN clothing c  ON ri.clothing_id = c.clothing_id    WHERE c.clothing_id IS NULL;
SELECT COUNT(*) AS orphan_payment  FROM payment p    LEFT JOIN rental   r   ON p.rental_id    = r.rental_id      WHERE r.rental_id IS NULL;
SELECT COUNT(*) AS orphan_review_u FROM review rv    LEFT JOIN users    u   ON rv.user_id     = u.user_id        WHERE u.user_id IS NULL;
SELECT COUNT(*) AS orphan_review_c FROM review rv    LEFT JOIN clothing c   ON rv.clothing_id = c.clothing_id    WHERE c.clothing_id IS NULL;

-- Per-size stock must reconcile with the aggregate clothing.stock (difference = 0)
SELECT c.clothing_id, c.name, c.stock AS total_stock,
       COALESCE(SUM(cs.stock), 0) AS size_stock_sum,
       c.stock - COALESCE(SUM(cs.stock), 0) AS difference
FROM clothing c
LEFT JOIN clothing_size cs ON c.clothing_id = cs.clothing_id
GROUP BY c.clothing_id, c.name, c.stock
HAVING c.stock - COALESCE(SUM(cs.stock), 0) <> 0;

-- ============================================================================
-- 8. REQUIRED JOIN QUERIES
-- ============================================================================

-- 8.1 INNER JOIN : users with their rentals
SELECT u.user_id, u.name, r.rental_id, r.total_amount, r.status
FROM users u
INNER JOIN rental r ON u.user_id = r.user_id
ORDER BY r.rental_id;

-- 8.2 LEFT JOIN : every user, even those with no rentals
SELECT u.user_id, u.name, r.rental_id, r.status
FROM users u
LEFT JOIN rental r ON u.user_id = r.user_id
ORDER BY u.user_id, r.rental_id;

-- 8.3 RIGHT JOIN : every rental, even if its user row were missing
SELECT u.name, r.rental_id, r.status
FROM users u
RIGHT JOIN rental r ON u.user_id = r.user_id
ORDER BY r.rental_id;

-- 8.4 MULTI-TABLE JOIN : rental + user + item + clothing + category
SELECT
    r.rental_id,
    u.name            AS customer,
    c.name            AS clothing_item,
    cat.category_name AS category,
    ri.quantity,
    ri.rental_days,
    ri.subtotal
FROM rental r
JOIN users       u   ON r.user_id      = u.user_id
JOIN rental_item ri  ON r.rental_id    = ri.rental_id
JOIN clothing    c   ON ri.clothing_id = c.clothing_id
JOIN category    cat ON c.category_id  = cat.category_id
ORDER BY r.rental_id, ri.rental_item_id;

-- 8.5 RENTAL + USER + CLOTHING (rental summary)
SELECT
    u.name AS customer,
    r.rental_id,
    r.start_date,
    r.end_date,
    r.total_amount,
    r.status,
    c.name AS item,
    ri.quantity
FROM rental r
JOIN users       u  ON r.user_id      = u.user_id
JOIN rental_item ri ON r.rental_id    = ri.rental_id
JOIN clothing    c  ON ri.clothing_id = c.clothing_id
ORDER BY r.rental_id;

-- 8.6 Reviews with reviewer + item
SELECT rv.review_id, u.name AS reviewer, c.name AS clothing_item, rv.rating, rv.comment
FROM review rv
JOIN users    u ON rv.user_id     = u.user_id
JOIN clothing c ON rv.clothing_id = c.clothing_id
ORDER BY rv.created_at DESC;

-- 8.7 Payments with rental + customer
SELECT p.payment_id, u.name AS customer, p.amount, p.payment_method, p.payment_status, p.transaction_id
FROM payment p
JOIN rental r ON p.rental_id = r.rental_id
JOIN users  u ON r.user_id   = u.user_id
ORDER BY p.payment_id;

-- ============================================================================
-- 9. SEARCH / FILTER / STOREFRONT SUPPORT QUERIES
-- ============================================================================

-- 9.1 Full-text search by name / description (GIN index ft_clothing_search)
SELECT clothing_id, name, price_per_day, color
FROM clothing
WHERE to_tsvector('english', name || ' ' || COALESCE(description, ''))
      @@ plainto_tsquery('english', 'sherwani');

-- 9.2 Filter by category
SELECT c.clothing_id, c.name, cat.category_name, c.price_per_day
FROM clothing c
JOIN category cat ON c.category_id = cat.category_id
WHERE cat.category_name = 'Gowns';

-- 9.3 Filter by size (via clothing_size child table)
SELECT c.clothing_id, c.name, cs.size, cs.stock
FROM clothing c
JOIN clothing_size cs ON c.clothing_id = cs.clothing_id
WHERE cs.size = 'M'
  AND cs.stock > 0
ORDER BY c.clothing_id;

-- 9.3b All size + stock rows for one clothing item
SELECT cs.clothing_size_id, c.name, cs.size, cs.stock
FROM clothing_size cs
JOIN clothing c ON cs.clothing_id = c.clothing_id
WHERE cs.clothing_id = 1
ORDER BY CASE cs.size
  WHEN 'XS' THEN 1 WHEN 'S' THEN 2 WHEN 'M' THEN 3 WHEN 'L' THEN 4
  WHEN 'XL' THEN 5 WHEN 'XXL' THEN 6 WHEN 'Free Size' THEN 7
  ELSE 8 END;

-- 9.4 Filter by color
SELECT clothing_id, name, color
FROM clothing
WHERE color = 'Black';

-- 9.5 Price range + in-stock
SELECT clothing_id, name, price_per_day, stock
FROM clothing
WHERE price_per_day BETWEEN 1500 AND 4000
  AND stock > 0
ORDER BY price_per_day;

-- 9.6 Average rating per clothing (rating filter / top rated)
SELECT
    c.clothing_id,
    c.name,
    ROUND(AVG(rv.rating), 2) AS avg_rating,
    COUNT(rv.review_id)      AS review_count
FROM clothing c
LEFT JOIN review rv ON c.clothing_id = rv.clothing_id
GROUP BY c.clothing_id, c.name
HAVING AVG(rv.rating) >= 4.5
ORDER BY avg_rating DESC;

-- 9.7 Trending / most rented clothing
SELECT c.clothing_id, c.name, SUM(ri.quantity) AS total_rented
FROM clothing c
JOIN rental_item ri ON c.clothing_id = ri.clothing_id
GROUP BY c.clothing_id, c.name
ORDER BY total_rented DESC, c.clothing_id;

-- 9.8 AVAILABILITY for one item and a date range.
--     booked_units = overlapping still-active rentals; available if below stock.
--     Replace the two dates and the clothing id.
SELECT
    c.clothing_id,
    c.name,
    c.stock,
    COALESCE(SUM(CASE
        WHEN r.status IN ('Pending', 'Confirmed', 'Active')
         AND r.start_date <= DATE '2026-10-10'
         AND r.end_date   >= DATE '2026-10-08'
        THEN ri.quantity END), 0) AS booked_units,
    c.stock - COALESCE(SUM(CASE
        WHEN r.status IN ('Pending', 'Confirmed', 'Active')
         AND r.start_date <= DATE '2026-10-10'
         AND r.end_date   >= DATE '2026-10-08'
        THEN ri.quantity END), 0) AS available_units
FROM clothing c
LEFT JOIN rental_item ri ON c.clothing_id = ri.clothing_id
LEFT JOIN rental      r  ON ri.rental_id  = r.rental_id
WHERE c.clothing_id = 1
GROUP BY c.clothing_id, c.name, c.stock;

-- 9.9 My Rentals (customer order history)
SELECT r.rental_id, r.start_date, r.end_date, r.total_amount, r.status,
       STRING_AGG(c.name || ' x' || ri.quantity, ', ') AS items
FROM rental r
JOIN rental_item ri ON r.rental_id    = ri.rental_id
JOIN clothing    c  ON ri.clothing_id = c.clothing_id
WHERE r.user_id = 1
GROUP BY r.rental_id, r.start_date, r.end_date, r.total_amount, r.status
ORDER BY MAX(r.created_at) DESC;

-- 9.10 Subtotal reconciliation (backend safety check)
SELECT r.rental_id, r.total_amount AS stored_total, SUM(ri.subtotal) AS computed_total,
       (r.total_amount - SUM(ri.subtotal)) AS difference
FROM rental r
JOIN rental_item ri ON r.rental_id = ri.rental_id
GROUP BY r.rental_id, r.total_amount;

-- ============================================================================
-- 10. RENTAL CALCULATION REFERENCE
-- ============================================================================
-- rental_days = end_date - start_date (in days)
-- rate        = Host-defined tier rate:
--                rental_days = 1  -> clothing.price_1_day
--                rental_days = 2  -> clothing.price_2_day
--                rental_days = 3  -> clothing.price_3_day
--                rental_days >= 7 -> clothing.price_1_week   (weekly price)
--                otherwise        -> clothing.price_per_day  (fallback base rate)
-- subtotal    = rate * quantity            (tier rates are flat, not per-day)
-- total_amount (rental) = SUM(rental_item.subtotal for that rental)
--
-- Example (tier price): SELECT price_3_day FROM clothing WHERE clothing_id = 1; -- 11520.00
--
-- The BACKEND (Spring Boot service layer) performs and persists the final
-- calculation; the frontend may preview it but is never the source of truth.

-- ============================================================================
-- 11. SPRING BOOT / JPA INTEGRATION NOTES (PostgreSQL)
-- ============================================================================
--   * Entities map 1:1 to tables: User, Role, Category, Clothing, ClothingSize,
--     Rental, RentalItem, Payment, Review. `users` is plural while the rest are
--     singular, so annotate explicitly: @Table(name = "users"), etc.
--     No entity changes are needed for PostgreSQL: GenerationType.IDENTITY
--     works with BIGSERIAL/SERIAL, Boolean <-> BOOLEAN, BigDecimal <->
--     DECIMAL(10,2), LocalDate <-> DATE, LocalDateTime <-> TIMESTAMP.
--   * Replace the MySQL driver with PostgreSQL in backend/pom.xml:
--       <dependency>
--           <groupId>org.postgresql</groupId>
--           <artifactId>postgresql</artifactId>
--           <scope>runtime</scope>
--       </dependency>
--   * application.properties (example):
--       spring.datasource.url=jdbc:postgresql://localhost:5432/stylerentdb
--       spring.datasource.username=postgres
--       spring.datasource.password=YOUR_PASSWORD
--       spring.datasource.driver-class-name=org.postgresql.Driver
--       spring.jpa.hibernate.ddl-auto=validate
--       spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
--       spring.jpa.show-sql=true
-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
