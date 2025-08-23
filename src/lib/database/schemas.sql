-- Prime Lux Events Database Schema
-- PostgreSQL Database Setup

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('customer', 'admin', 'manager', 'staff', 'super_admin');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'in_preparation', 'delivered', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'partial', 'refunded', 'failed');
CREATE TYPE venue_status AS ENUM ('available', 'booked', 'maintenance', 'unavailable');
CREATE TYPE inventory_status AS ENUM ('available', 'rented', 'maintenance', 'damaged', 'retired');
CREATE TYPE event_type AS ENUM ('wedding', 'corporate', 'birthday', 'anniversary', 'graduation', 'holiday', 'other');

-- Users table (customers and admin users)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role user_role DEFAULT 'customer',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(32),
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User addresses
CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    country VARCHAR(50) DEFAULT 'United States',
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products/inventory items
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    sku VARCHAR(100) UNIQUE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2),
    weight DECIMAL(8,2), -- in pounds
    dimensions_length DECIMAL(8,2), -- in feet
    dimensions_width DECIMAL(8,2), -- in feet
    dimensions_height DECIMAL(8,2), -- in feet
    setup_time INTEGER, -- in minutes
    requires_special_handling BOOLEAN DEFAULT false,
    minimum_rental_period INTEGER DEFAULT 1, -- in days
    image_url VARCHAR(500),
    gallery_images TEXT[], -- array of image URLs
    specifications JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory tracking
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    serial_number VARCHAR(100) UNIQUE,
    status inventory_status DEFAULT 'available',
    condition_notes TEXT,
    purchase_date DATE,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    location VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prime Lux Event Hall venue
CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    capacity_min INTEGER NOT NULL,
    capacity_max INTEGER NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    hourly_rate DECIMAL(10,2),
    amenities TEXT[],
    images TEXT[],
    floor_plan_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Venue bookings
CREATE TABLE venue_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL REFERENCES venues(id),
    user_id UUID NOT NULL REFERENCES users(id),
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    guest_count INTEGER NOT NULL,
    event_type event_type NOT NULL,
    status venue_status DEFAULT 'available',
    special_requirements TEXT,
    total_cost DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(venue_id, event_date, start_time, end_time)
);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    status order_status DEFAULT 'pending',
    event_date DATE NOT NULL,
    event_type event_type NOT NULL,
    event_description TEXT,
    guest_count INTEGER,
    
    -- Delivery information
    delivery_address_line_1 VARCHAR(255) NOT NULL,
    delivery_address_line_2 VARCHAR(255),
    delivery_city VARCHAR(100) NOT NULL,
    delivery_state VARCHAR(50) NOT NULL,
    delivery_zip_code VARCHAR(10) NOT NULL,
    delivery_notes TEXT,
    
    -- Pricing breakdown
    subtotal DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    setup_fee DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Payment
    deposit_amount DECIMAL(10,2) DEFAULT 0,
    balance_due DECIMAL(10,2) NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    
    -- Delivery logistics
    delivery_date DATE,
    pickup_date DATE,
    delivery_time_slot VARCHAR(50),
    setup_crew_size INTEGER DEFAULT 2,
    has_stairs BOOLEAN DEFAULT false,
    floor_level INTEGER DEFAULT 0,
    access_difficulty VARCHAR(20) DEFAULT 'easy',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory reservations (for order items)
CREATE TABLE inventory_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    inventory_id UUID NOT NULL REFERENCES inventory(id),
    reserved_from DATE NOT NULL,
    reserved_until DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    venue_booking_id UUID REFERENCES venue_bookings(id),
    payment_intent_id VARCHAR(255), -- Stripe payment intent ID
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status payment_status DEFAULT 'pending',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    gateway_response JSONB,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customer favorites
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Promo codes
CREATE TABLE promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL, -- 'percentage' or 'fixed'
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_order_amount DECIMAL(10,2) DEFAULT 0,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order promo code usage
CREATE TABLE order_promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    promo_code_id UUID NOT NULL REFERENCES promo_codes(id),
    discount_amount DECIMAL(10,2) NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Email notifications log
CREATE TABLE email_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    email_address VARCHAR(255) NOT NULL,
    template_name VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activity logs
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_status ON inventory(status);
CREATE INDEX idx_venue_bookings_venue_id ON venue_bookings(venue_id);
CREATE INDEX idx_venue_bookings_event_date ON venue_bookings(event_date);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_event_date ON orders(event_date);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_inventory_reservations_order_item_id ON inventory_reservations(order_item_id);
CREATE INDEX idx_inventory_reservations_inventory_id ON inventory_reservations(inventory_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_addresses_updated_at BEFORE UPDATE ON user_addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venue_bookings_updated_at BEFORE UPDATE ON venue_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data

-- Insert categories
INSERT INTO categories (id, name, slug, description, sort_order) VALUES
(uuid_generate_v4(), 'Tents & Canopies', 'tents-canopies', 'High-quality tents and canopies for outdoor events', 1),
(uuid_generate_v4(), 'Tables', 'tables', 'Elegant tables for all types of events', 2),
(uuid_generate_v4(), 'Seating', 'seating', 'Comfortable and stylish seating options', 3),
(uuid_generate_v4(), 'Lighting', 'lighting', 'Professional lighting solutions', 4),
(uuid_generate_v4(), 'Linens & Draping', 'linens-draping', 'Luxury linens and fabric draping', 5),
(uuid_generate_v4(), 'Bar & Catering', 'bar-catering', 'Bar setups and catering equipment', 6),
(uuid_generate_v4(), 'Decor & Accessories', 'decor-accessories', 'Decorative items and event accessories', 7),
(uuid_generate_v4(), 'Dance Floors', 'dance-floors', 'Professional dance floors and staging', 8);

-- Insert Prime Lux Event Hall venue
INSERT INTO venues (id, name, description, address_line_1, city, state, zip_code, capacity_min, capacity_max, base_price, hourly_rate, amenities, images) VALUES
(uuid_generate_v4(), 'Prime Lux Event Hall', 
'Connecticut''s premier luxury indoor event venue featuring elegant glassmorphism design, climate control, and state-of-the-art amenities. Perfect for weddings, corporate events, and milestone celebrations.',
'500 Prime Lux Drive', 'Shelton', 'CT', '06484', 50, 300, 2500.00, 200.00,
ARRAY['Climate Control', 'Professional Sound System', 'LED Lighting', 'Bridal Suite', 'Catering Kitchen', 'Ample Parking', 'Wheelchair Accessible', 'WiFi', 'A/V Equipment'],
ARRAY['venue-main.jpg', 'venue-interior.jpg', 'venue-reception.jpg', 'venue-ceremony.jpg']);

-- Insert sample products
DO $$
DECLARE
    tent_category_id UUID;
    table_category_id UUID;
    seating_category_id UUID;
    lighting_category_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO tent_category_id FROM categories WHERE slug = 'tents-canopies';
    SELECT id INTO table_category_id FROM categories WHERE slug = 'tables';
    SELECT id INTO seating_category_id FROM categories WHERE slug = 'seating';
    SELECT id INTO lighting_category_id FROM categories WHERE slug = 'lighting';
    
    -- Insert sample products
    INSERT INTO products (name, slug, description, category_id, sku, price, weight, dimensions_length, dimensions_width, dimensions_height, setup_time, image_url, specifications) VALUES
    ('40'' x 60'' Luxury Tent', '40x60-luxury-tent', 'Premium outdoor tent with sidewalls and climate control options', tent_category_id, 'TENT-40X60-LUX', 2500.00, 800.00, 40.00, 60.00, 12.00, 240, 'tent-luxury.jpg', '{"material": "Commercial Grade Vinyl", "sidewalls": "Included", "flooring": "Optional", "weather_resistant": true}'),
    
    ('60" Round Tables', '60-round-tables', 'Classic round tables seating 8-10 guests each', table_category_id, 'TABLE-60-ROUND', 25.00, 45.00, 5.00, 5.00, 2.5, 10, 'table-round.jpg', '{"diameter": "60 inches", "height": "30 inches", "capacity": "8-10 guests", "material": "High-quality plywood with vinyl top"}'),
    
    ('Gold Chiavari Chairs', 'gold-chiavari-chairs', 'Elegant gold chiavari chairs perfect for weddings and formal events', seating_category_id, 'CHAIR-CHIAVARI-GOLD', 8.00, 8.50, 1.50, 1.50, 3.00, 2, 'chair-chiavari.jpg', '{"material": "Resin", "color": "Gold", "cushion": "Ivory cushion included", "weight_capacity": "250 lbs"}'),
    
    ('Crystal Chandeliers', 'crystal-chandeliers', 'Stunning crystal chandeliers for elegant lighting', lighting_category_id, 'LIGHT-CHANDELIER-CRYSTAL', 450.00, 25.00, 2.00, 2.00, 3.00, 45, 'chandelier-crystal.jpg', '{"type": "Crystal", "bulbs": "LED compatible", "diameter": "24 inches", "height": "36 inches", "installation": "Professional required"}');
    
    -- Insert inventory for each product
    INSERT INTO inventory (product_id, serial_number, status, location) 
    SELECT p.id, CONCAT(p.sku, '-', LPAD(generate_series(1, 
        CASE 
            WHEN p.slug = '40x60-luxury-tent' THEN 5
            WHEN p.slug = '60-round-tables' THEN 50
            WHEN p.slug = 'gold-chiavari-chairs' THEN 200
            WHEN p.slug = 'crystal-chandeliers' THEN 20
        END
    )::text, 3, '0')), 'available', 'Warehouse A'
    FROM products p;
END $$;

-- Insert sample promo codes
INSERT INTO promo_codes (code, description, discount_type, discount_value, minimum_order_amount, max_uses, valid_from, valid_until) VALUES
('WELCOME10', 'Welcome discount for new customers', 'percentage', 10.00, 500.00, 100, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year'),
('LUXURY15', 'Luxury event discount', 'percentage', 15.00, 1000.00, 50, CURRENT_DATE, CURRENT_DATE + INTERVAL '6 months'),
('SPRING20', 'Spring celebration discount', 'percentage', 20.00, 750.00, 75, CURRENT_DATE, CURRENT_DATE + INTERVAL '3 months'),
('FIRSTTIME', 'First time customer discount', 'percentage', 25.00, 800.00, 200, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year');

-- Create views for commonly used queries

-- Product availability view
CREATE VIEW product_availability AS
SELECT 
    p.id,
    p.name,
    p.sku,
    p.price,
    COUNT(i.id) as total_inventory,
    COUNT(CASE WHEN i.status = 'available' THEN 1 END) as available_count,
    COUNT(CASE WHEN i.status = 'rented' THEN 1 END) as rented_count,
    COUNT(CASE WHEN i.status = 'maintenance' THEN 1 END) as maintenance_count
FROM products p
LEFT JOIN inventory i ON p.id = i.product_id
WHERE p.is_active = true
GROUP BY p.id, p.name, p.sku, p.price;

-- Order summary view
CREATE VIEW order_summary AS
SELECT 
    o.id,
    o.order_number,
    o.status,
    o.event_date,
    o.total_amount,
    u.first_name || ' ' || u.last_name as customer_name,
    u.email as customer_email,
    COUNT(oi.id) as item_count
FROM orders o
JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.status, o.event_date, o.total_amount, u.first_name, u.last_name, u.email;

-- Grant permissions (adjust as needed for your application user)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;