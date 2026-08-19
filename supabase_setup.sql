-- =========================================================================
-- DANCIN HOME - HỆ THỐNG CƠ SỞ DỮ LIỆU QUAN HỆ TOÀN DIỆN (SUPABASE / POSTGRESQL)
-- KẾT NỐI ĐỒNG BỘ TRANG BOOKING VÀ CỔNG QUẢN TRỊ ADMIN PORTAL
-- =========================================================================

-- KÍCH HOẠT EXTENSION HỖ TRỢ SINH UUID TỰ ĐỘNG
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- DỌN DẸP BẢNG CŨ NẾU CÓ (WARNING: XÓA DỮ LIỆU CŨ TRƯỚC KHI THIẾT LẬP MỚI)
DROP TRIGGER IF EXISTS tr_sync_customer_stats ON public.bookings;
DROP FUNCTION IF EXISTS public.fn_sync_customer_stats();
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.customer_group_relations CASCADE;
DROP TABLE IF EXISTS public.customer_groups CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.vouchers CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;

-- ==========================================
-- I. ĐỊNH NGHĨA CẤU TRÚC BẢNG (DDL SCHEMAS)
-- ==========================================

-- 1. BẢNG PHÒNG NGHỈ (ROOMS)
CREATE TABLE public.rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    branch VARCHAR(100) NOT NULL, -- CS1 (Sài Gòn Trung Tâm), CS2 (Thảo Điền), CS3 (Quận 7)
    capacity INT NOT NULL DEFAULT 2,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
    thumbnail TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. BẢNG KHÁCH HÀNG CRM (CUSTOMERS)
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    total_spent NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_bookings INT NOT NULL DEFAULT 0,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    notes TEXT[] NOT NULL DEFAULT '{}'::TEXT[], -- Mảng lưu nhiều ghi chú theo thời gian
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. BẢNG VOUCHERS (VOUCHERS)
CREATE TABLE public.vouchers (
    code VARCHAR(50) PRIMARY KEY,
    type VARCHAR(20) NOT NULL DEFAULT 'percent' CHECK (type IN ('percent', 'fixed')),
    value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    usage_count INT NOT NULL DEFAULT 0,
    max_usage INT NOT NULL DEFAULT 100,
    expiry_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'disabled')),
    target_type VARCHAR(50) NOT NULL DEFAULT 'all' CHECK (target_type IN ('all', 'group', 'tier', 'event')),
    target_value VARCHAR(255) NOT NULL DEFAULT 'Tất cả',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. BẢNG ĐƠN ĐẶT PHÒNG (BOOKINGS)
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
    voucher_code VARCHAR(50) REFERENCES public.vouchers(code) ON DELETE SET NULL,
    checkin_date DATE NOT NULL,
    checkout_date DATE NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled')),
    special_notes TEXT, -- Yêu cầu lưu ý của khách (BBQ, bồn tắm Hinoki, máy chiếu...)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    
    CONSTRAINT check_dates CHECK (checkout_date > checkin_date)
);

-- 5. BẢNG NHÓM KHÁCH HÀNG CRM (CUSTOMER GROUPS)
CREATE TABLE public.customer_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'manual' CHECK (type IN ('ai', 'manual')),
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 6. BẢNG QUAN HỆ NHIỀU - NHIỀU (CUSTOMER GROUP RELATIONS)
CREATE TABLE public.customer_group_relations (
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.customer_groups(id) ON DELETE CASCADE,
    PRIMARY KEY (customer_id, group_id)
);

-- 7. BẢNG CHIẾN DỊCH MARKETING (CAMPAIGNS)
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('Zalo ZNS', 'Email')),
    target_audience VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
    sent_count INT NOT NULL DEFAULT 0,
    click_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    budget NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    message_content TEXT NOT NULL,
    voucher_code VARCHAR(50) REFERENCES public.vouchers(code) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- TẠO CHỈ MỤC INDEX TỐI ƯU TRUY VẤN
CREATE INDEX idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX idx_bookings_room ON public.bookings(room_id);
CREATE INDEX idx_bookings_dates ON public.bookings(checkin_date, checkout_date);
CREATE INDEX idx_customers_phone ON public.customers(phone);

-- ==========================================
-- II. THIẾT LẬP CƠ CHẾ TRIGGER TỰ ĐỘNG ĐỒNG BỘ
-- ==========================================

CREATE OR REPLACE FUNCTION public.fn_sync_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.customers
    SET 
        total_bookings = (
            SELECT COUNT(*) 
            FROM public.bookings 
            WHERE customer_id = COALESCE(NEW.customer_id, OLD.customer_id) 
              AND status IN ('confirmed', 'checked_in', 'checked_out')
        ),
        total_spent = COALESCE((
            SELECT SUM(total_price) 
            FROM public.bookings 
            WHERE customer_id = COALESCE(NEW.customer_id, OLD.customer_id) 
              AND status IN ('confirmed', 'checked_in', 'checked_out')
        ), 0.00),
        last_active = NOW()
    WHERE id = COALESCE(NEW.customer_id, OLD.customer_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_sync_customer_stats
AFTER INSERT OR UPDATE OR DELETE
ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.fn_sync_customer_stats();

-- ==========================================
-- III. CHÈN DỮ LIỆU MẪU ĐẦY ĐỦ (SEED DATA)
-- ==========================================

-- 1. SEED DATA PHÒNG NGHỈ (ROOMS)
INSERT INTO public.rooms (id, name, branch, capacity, price, status, thumbnail) VALUES
('a0000000-0000-0000-0000-000000000001', 'Cozy Wooden Cabin 🌲', 'CS1 - Quận 1', 2, 850000, 'available', 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=600&q=80'),
('a0000000-0000-0000-0000-000000000002', 'Hinoki River View Suite 🌊', 'CS2 - Thảo Điền', 4, 1500000, 'available', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80'),
('a0000000-0000-0000-0000-000000000003', 'Rustic Forest Cabin 🏡', 'CS1 - Quận 1', 2, 950000, 'occupied', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80'),
('a0000000-0000-0000-0000-000000000004', 'Cozy Wooden Cabin 🎋', 'CS3 - Quận 7', 2, 800000, 'available', 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=600&q=80'),
('a0000000-0000-0000-0000-000000000005', 'Glass Dome Starview 🌌', 'CS2 - Thảo Điền', 2, 2200000, 'maintenance', 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=600&q=80');

-- 2. SEED DATA KHÁCH HÀNG CRM (CUSTOMERS)
INSERT INTO public.customers (id, name, phone, total_spent, total_bookings, notes) VALUES
('c0000000-0000-0000-0000-000000000001', 'Nguyễn Văn Hùng', '0901234567', 18450000, 4, ARRAY['Thích không gian yên tĩnh', 'Hay sử dụng bếp BBQ ngoài trời', 'Yêu cầu phòng thơm bồn Hinoki']),
('c0000000-0000-0000-0000-000000000002', 'Trần Thị Mai', '0912345678', 2160000, 1, ARRAY['Khách đi công tác ngắn ngày', 'Cần set up máy chiếu và Netflix']),
('c0000000-0000-0000-0000-000000000003', 'Lê Hoàng Hải', '0987654321', 6800000, 3, ARRAY['Khách quen CS2', 'Ưu tiên check-in sớm', 'Thích ngắm view sông']),
('c0000000-0000-0000-0000-000000000004', 'Phạm Quỳnh Chi', '0934567890', 9200000, 2, ARRAY['Khách đi cùng gia đình lớn', 'Cần chuẩn bị đệm phụ cho bé']),
('c0000000-0000-0000-0000-000000000005', 'Trương Quốc Bảo', '0944556677', 0, 0, ARRAY['Khách hàng mới tạo', 'Thích xem phim màn hình lớn']);

-- 3. SEED DATA VOUCHERS (VOUCHERS)
INSERT INTO public.vouchers (code, type, value, usage_count, max_usage, expiry_date, status, target_type, target_value) VALUES
('DANCINHE2026', 'percent', 15.00, 12, 100, '2026-12-31', 'active', 'group', 'Nhóm AI: Thích yên tĩnh 🤫'),
('VIPBIRTHDAY', 'fixed', 200000.00, 5, 50, '2026-08-31', 'active', 'tier', 'Hạng: Gold (Vàng) 🥇'),
('COZYSTAY', 'fixed', 100000.00, 28, 200, '2026-11-30', 'active', 'all', 'Tất cả khách hàng CRM 👥'),
('DIAMONDBDAY', 'percent', 100.00, 1, 5, '2026-06-30', 'active', 'tier', 'Hạng: Diamond (Kim Cương) 💎'),
('WINTERCHILL', 'percent', 10.00, 0, 150, '2026-02-28', 'expired', 'event', 'Mùa đông ấm áp ❄️');

-- 4. SEED DATA ĐƠN ĐẶT PHÒNG (BOOKINGS)
INSERT INTO public.bookings (id, customer_id, room_id, voucher_code, checkin_date, checkout_date, total_price, status, special_notes) VALUES
-- Lịch sử đặt phòng của Nguyễn Văn Hùng (CUST-01)
('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'COZYSTAY', '2026-04-10', '2026-04-12', 1600000, 'checked_out', 'Yêu cầu phòng thật yên tĩnh cách âm'),
('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'VIPBIRTHDAY', '2026-05-01', '2026-05-03', 2800000, 'checked_out', 'Setup thêm bếp nướng BBQ và bồn tắm Hinoki'),
('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', NULL, '2026-05-20', '2026-05-25', 7500000, 'confirmed', 'Khách quen yêu cầu phòng lầu cao'),
('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'DANCINHE2026', '2026-06-05', '2026-06-10', 6550000, 'pending', 'Mừng kỷ niệm ngày cưới'),

-- Đơn đặt phòng của Trần Thị Mai (CUST-02)
('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', NULL, '2026-05-15', '2026-05-17', 2160000, 'checked_out', 'Set up máy chiếu phim Netflix độ phân giải HD');

-- 5. SEED DATA NHÓM CRM (CUSTOMER GROUPS)
INSERT INTO public.customer_groups (id, name, type, description) VALUES
('d0000000-0000-0000-0000-000000000001', 'Nhóm AI: Thích yên tĩnh 🤫', 'ai', 'Khách hàng có ghi chú liên quan đến yên tĩnh, biệt lập, thư giãn hoặc tránh ồn ào thành thị.'),
('d0000000-0000-0000-0000-000000000002', 'Nhóm AI: Đi gia đình 🏡', 'ai', 'Khách hàng thường đặt phòng sức chứa lớn, có trẻ em, đệm phụ, hoặc tổ chức bếp nướng BBQ gia đình.'),
('d0000000-0000-0000-0000-000000000003', 'Nhóm AI: Thuê ngắn giờ ⏰', 'ai', 'Khách hàng đặt phòng thời gian ngắn, phòng chiếu phim, hội họp riêng tư.'),
('d0000000-0000-0000-0000-000000000004', 'Thành viên VIP thân thiết 💎', 'manual', 'Nhóm khách hàng có đóng góp doanh thu lớn hoặc là đối tác chiến lược được Admin chăm sóc thủ công.');

-- 6. SEED DATA MAPPING QUAN HỆ (CUSTOMER GROUP RELATIONS)
INSERT INTO public.customer_group_relations (customer_id, group_id) VALUES
('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001'), -- Ông Hùng thuộc nhóm Thích yên tĩnh
('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002'), -- Ông Hùng thuộc nhóm Đi gia đình
('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000004'), -- Ông Hùng là VIP
('c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000003'), -- Chị Mai thuộc nhóm Thuê ngắn giờ
('c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000002'); -- Chị Chi thuộc nhóm Đi gia đình

-- 7. SEED DATA CHIẾN DỊCH MARKETING (CAMPAIGNS)
INSERT INTO public.campaigns (id, name, channel, target_audience, status, sent_count, click_rate, budget, message_content, voucher_code) VALUES
('f0000000-0000-0000-0000-000000000001', 'Trở về với mộc mạc - Giảm 15% cuối tuần 🌿', 'Zalo ZNS', 'Nhóm AI: Thích yên tĩnh 🤫', 'active', 120, 24.50, 500000, 'Chào {ten_khach}, trốn thành thị xô bồ để tìm lại bình yên cùng Dancin Home Sài Gòn cuối tuần này nhé! Nhập ngay mã {ma_voucher} để nhận ưu đãi giảm 15% phòng nghỉ biệt lập ngắm hoàng hôn cực chill.', 'DANCINHE2026'),
('f0000000-0000-0000-0000-000000000002', 'Chào hè rực rỡ - Tặng Voucher Gold 200k ☀️', 'Zalo ZNS', 'Hạng: Gold (Vàng) 🥇', 'completed', 450, 38.20, 1200000, 'Dancin Home gửi tặng quý hội viên Vàng {ten_khach} đặc quyền chào hè rực rỡ! Tặng mã giảm giá {ma_voucher} trị giá 200k khi đặt phòng gia đình có ban công rộng rãi và bồn Hinoki gỗ thơm ngát.', 'VIPBIRTHDAY'),
('f0000000-0000-0000-0000-000000000003', 'Trải nghiệm Cabin gỗ - Chill cùng tiệc nướng BBQ 🥩', 'Email', 'Nhóm AI: Đi gia đình 🏡', 'draft', 0, 0.00, 800000, 'Kính gửi {ten_khach},\n\nMùa hè này dắt bé và cả nhà đi nghỉ dưỡng lớn tại Cozy Wooden Cabin CS3 của Dancin Home nhé! Trọn gói đã bao gồm setup bếp nướng BBQ ngoài trời cực vui, bồn tắm Hinoki sảng khoái và vườn tược rộn rã. Dùng mã {ma_voucher} để được ưu tiên nâng hạng phòng miễn phí.\n\nThân ái,\nDancin Home Sài Gòn', 'COZYSTAY');

-- CẬP NHẬT LẠI STATS BẰNG TRIGGER SAU KHI SEED DỮ LIỆU ĐỂ ĐẢM BẢO CHÍNH XÁC TUYỆT ĐỐI
UPDATE public.bookings SET status = 'checked_out' WHERE id = 'b0000000-0000-0000-0000-000000000001';
UPDATE public.bookings SET status = 'checked_out' WHERE id = 'b0000000-0000-0000-0000-000000000002';
UPDATE public.bookings SET status = 'confirmed' WHERE id = 'b0000000-0000-0000-0000-000000000003';
UPDATE public.bookings SET status = 'checked_out' WHERE id = 'b0000000-0000-0000-0000-000000000005';
