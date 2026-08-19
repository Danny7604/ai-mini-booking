-- =========================================================================
-- DANCIN HOME - SQL SEED DATA ĐỒNG BỘ TOÀN DIỆN MỚI (PHIÊN BẢN CHỐNG LỖI CÚ PHÁP TUYỆT ĐỐI)
-- HƯỚNG DẪN: COPY TOÀN BỘ CODE DƯỚI ĐÂY DÂN VÀO SQL EDITOR CỦA SUPABASE RỒI BẤM RUN
-- CÔNG DỤNG: DÙNG ĐÚNG CÚ PHÁP DOLLAR-QUOTED ($$) CỦA POSTGRESQL ĐỂ TRÁNH MỌI LỖI KÝ TỰ BÀN PHÍM
-- =========================================================================

-- 1. TẮT RLS BẢO MẬT ĐỂ CHO PHÉP KẾT NỐI TỰ DO TỪ ADMIN & BOOKING
ALTER TABLE public.rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_group_relations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns DISABLE ROW LEVEL SECURITY;

-- 2. DỌN SẠCH CÁC PHÒNG CŨ TRONG DATABASE
TRUNCATE TABLE public.rooms CASCADE;

-- 3. NẠP TOÀN BỘ 20 PHÒNG MẪU (DÙNG ĐÚNG ĐỊNH DẠNG $$ ĐỂ KHÔNG BỊ LỖI PHÂN TÍCH NHÁY ĐƠN)
INSERT INTO public.rooms (name, branch, capacity, price, status, thumbnail) VALUES
-- --- CHI NHÁNH 1: TÂN BÌNH CS1 ---
($$Bungalow Hương Thơm$$, $$CS1 - Tân Bình 🏡$$, 2, 850000, $$available$$, $${"imageUrl":"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80","hourlyPrice":100000,"description":"Trải nghiệm Bungalow Hương Thơm tuyệt đẹp tại chi nhánh Dancin Home.","amenities":["Máy pha cà phê","Trà miễn phí","Loa Bluetooth","Wifi tốc độ cao"],"tags":["bath","couple"],"isPublished":true,"isFeatured":false}$$),
($$Nhà Gỗ Mộc Lan$$, $$CS1 - Tân Bình 🏡$$, 4, 1200000, $$occupied$$, $${"imageUrl":"https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80","hourlyPrice":120000,"description":"Rustic Family Suite với không gian gỗ ấm cúng cho cả gia đình.","amenities":["Lò sưởi giả lập","Sân nướng BBQ","Bếp đầy đủ dụng cụ"],"tags":["family","forest"],"isPublished":true,"isFeatured":true}$$),
($$Phòng Đơn Đồi Tiêu$$, $$CS1 - Tân Bình 🏡$$, 1, 600000, $$available$$, $${"imageUrl":"https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=80","hourlyPrice":60000,"description":"Không gian tĩnh lặng thiền định lý tưởng cho người đi một mình.","amenities":["Trà thảo mộc","Đèn đọc sách","Wifi tốc độ cao"],"tags":["couple","budget"],"isPublished":true,"isFeatured":false}$$),
($$Lều Glamping Thung Lũng$$, $$CS1 - Tân Bình 🏡$$, 2, 950000, $$available$$, $${"imageUrl":"https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=80","hourlyPrice":95000,"description":"Trải nghiệm ngủ lều sang chảnh hòa mình cùng thiên nhiên.","amenities":["Ban công võng lưới","Sân nướng BBQ","Wifi tốc độ cao"],"tags":["couple","budget"],"isPublished":true,"isFeatured":false}$$),
($$Căn Hộ Rừng Sầu Riêng$$, $$CS1 - Tân Bình 🏡$$, 2, 1800000, $$maintenance$$, $${"imageUrl":"https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80","hourlyPrice":180000,"description":"Căn hộ cao cấp ẩn mình giữa thiên nhiên xanh mát.","amenities":["Bồn tắm gỗ ngoài trời","Ban công ngắm thành phố","Loa Bluetooth Marshall"],"tags":["family","forest"],"isPublished":true,"isFeatured":true}$$),

-- --- CHI NHÁNH 2: QUẬN 10 CS2 ---
($$Sky Loft Hoàng Hôn$$, $$CS2 - Quận 10 🏙️$$, 2, 1500000, $$occupied$$, $${"imageUrl":"https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80","hourlyPrice":150000,"description":"Tầm nhìn hoàng hôn đắt giá ngắm trọn thành phố từ tầng cao nhất.","amenities":["Bồn tắm kính sang trọng","Máy chiếu phim HD","Ban công kính panorama"],"tags":["bath","couple","cloud"],"isPublished":true,"isFeatured":true}$$),
($$Phòng Suite Thung Lũng$$, $$CS2 - Quận 10 🏙️$$, 2, 2200000, $$occupied$$, $${"imageUrl":"https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80","hourlyPrice":220000,"description":"Không gian hoàng gia sang trọng bậc nhất thành phố.","amenities":["Bồn tắm kính sang trọng","Máy chiếu phim HD","Quầy bar mini miễn phí"],"tags":["bath","couple","cloud"],"isPublished":true,"isFeatured":false}$$),
($$Phòng Đôi Ánh Sáng$$, $$CS2 - Quận 10 🏙️$$, 2, 750000, $$available$$, $${"imageUrl":"https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80","hourlyPrice":75000,"description":"Phòng đôi Deluxe ngập tràn ánh sáng tự nhiên.","amenities":["Wifi tốc độ cao","Máy pha cà phê","Trà thảo mộc miễn phí"],"tags":["couple","cloud"],"isPublished":true,"isFeatured":false}$$),
($$Studio Tối Giản Cát Ấm$$, $$CS2 - Quận 10 🏙️$$, 2, 800000, $$available$$, $${"imageUrl":"https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80","hourlyPrice":80000,"description":"Studio tối giản mang lại cảm giác ấm cúng dễ chịu.","amenities":["Wifi tốc độ cao","Máy pha cà phê","Loa Bluetooth"],"tags":["couple","cloud"],"isPublished":true,"isFeatured":true}$$),
($$Phòng Đơn Ngắm Sao$$, $$CS2 - Quận 10 🏙️$$, 1, 700000, $$available$$, $${"imageUrl":"https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80","hourlyPrice":70000,"description":"Phòng đơn áp mái với trần kính ngắm sao trời cực lãng mạn.","amenities":["Kính ngắm sao trời","Wifi tốc độ cao","Trà thảo mộc"],"tags":["couple","cloud"],"isPublished":true,"isFeatured":false}$$),

-- --- CHI NHÁNH 3: QUẬN 5 CS3 ---
($$Bungalow Hoa Cẩm Tú$$, $$CS3 - Quận 5 🪟$$, 2, 1100000, $$available$$, $${"imageUrl":"https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80","hourlyPrice":110000,"description":"Không gian ngập tràn hoa lá thơ mộng giữa lòng quận 5.","amenities":["Wifi tốc độ cao","Trà miễn phí","Loa Bluetooth"],"tags":["bath","couple"],"isPublished":true,"isFeatured":false}$$),
($$Nhà Gỗ Bên Dòng Suối$$, $$CS3 - Quận 5 🪟$$, 2, 1350000, $$occupied$$, $${"imageUrl":"https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80","hourlyPrice":135000,"description":"Cabin gỗ thông thơm tự nhiên cạnh con suối nhỏ rì rào.","amenities":["Lò sưởi giả lập","Sân nướng BBQ","Wifi tốc độ cao"],"tags":["family","forest"],"isPublished":true,"isFeatured":false}$$),
($$Phòng Đôi Mây Trắng$$, $$CS3 - Quận 5 🪟$$, 2, 900000, $$available$$, $${"imageUrl":"https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80","hourlyPrice":90000,"description":"Phòng đôi Deluxe có ban công rộng ngắm phố cổ.","amenities":["Wifi tốc độ cao","Loa Bluetooth","Máy pha cà phê"],"tags":["couple","forest"],"isPublished":true,"isFeatured":false}$$),
($$Phòng Gia Đình Ấm Cúng$$, $$CS3 - Quận 5 🪟$$, 4, 1650000, $$maintenance$$, $${"imageUrl":"https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80","hourlyPrice":165000,"description":"Lodge gỗ gia đình rộng rãi đầy đủ bếp nấu và bàn ăn lớn.","amenities":["Bếp đầy đủ dụng cụ","Bàn ăn rộng rãi","Board game giải trí"],"tags":["family","forest"],"isPublished":true,"isFeatured":false}$$),
($$Phòng Đơn Yên Bình$$, $$CS3 - Quận 5 🪟$$, 1, 650000, $$available$$, $${"imageUrl":"https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80","hourlyPrice":65000,"description":"Không gian thiền tịnh, thư giãn tuyệt đối cho tâm hồn mỏi mệt.","amenities":["Trà thảo mộc miễn phí","Tinh dầu xông thảo mộc","Wifi tốc độ cao"],"tags":["couple","forest"],"isPublished":true,"isFeatured":false}$$),

-- --- CHI NHÁNH 4: GÒ VẤP CS4 ---
($$Lều Vòm Kính Xinh Xắn$$, $$CS4 - Gò Vấp 🌸$$, 2, 1050000, $$available$$, $${"imageUrl":"https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80","hourlyPrice":105000,"description":"Trải nghiệm ngủ lều vòm kính ngắm trọn bầu trời sao cực nghệ thuật.","amenities":["Hiên thưởng trà vườn hoa","Kính ngắm sao trời","Wifi tốc độ cao"],"tags":["couple","budget"],"isPublished":true,"isFeatured":false}$$),
($$Bungalow Rừng Thông$$, $$CS4 - Gò Vấp 🌸$$, 2, 1400000, $$occupied$$, $${"imageUrl":"https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80","hourlyPrice":140000,"description":"Bungalow mộc mạc thơm mùi gỗ thông rì rào trong nắng sớm.","amenities":["Loa Bluetooth Marshall","Wifi tốc độ cao","Trà miễn phí"],"tags":["bath","couple","budget"],"isPublished":true,"isFeatured":false}$$),
($$Nhà Gỗ Trắng Vintage$$, $$CS4 - Gò Vấp 🌸$$, 2, 1250000, $$available$$, $${"imageUrl":"https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80","hourlyPrice":125000,"description":"Căn cottage trắng kiểu cổ điển châu Âu giữa khu vườn lãng mạn.","amenities":["Bồn tắm sứ nghệ thuật","Wifi tốc độ cao","Máy pha cà phê"],"tags":["bath","couple","budget"],"isPublished":true,"isFeatured":false}$$),
($$Phòng Đôi Hoa Sim$$, $$CS4 - Gò Vấp 🌸$$, 2, 850000, $$available$$, $${"imageUrl":"https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80","hourlyPrice":85000,"description":"Không gian ấm áp, tiện nghi đầy đủ cho cặp đôi.","amenities":["Wifi tốc độ cao","Máy pha cà phê","Trà thảo mộc"],"tags":["couple","budget"],"isPublished":true,"isFeatured":false}$$),
($$Phòng Áp Mái Thơ Mộng$$, $$CS4 - Gò Vấp 🌸$$, 2, 750000, $$available$$, $${"imageUrl":"https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80","hourlyPrice":75000,"description":"Phòng áp mái lãng mạn với ô cửa sổ kính ngắm trọn khu vườn.","amenities":["Trà thảo mộc miễn phí","Đèn đọc sách","Wifi tốc độ cao"],"tags":["couple","budget"],"isPublished":true,"isFeatured":false}$$);

-- 4. BỔ SUNG MỘT DÒNG CHO PHÒNG DUMMY SƠ CẤP ĐỂ LIÊN KẾT BOOKING HÀNH TRÌNH TĨNH
INSERT INTO public.rooms (id, name, branch, capacity, price, status, thumbnail) VALUES
('a0000000-0000-0000-0000-000000000001', 'Dummy System Room', 'Hệ thống', 2, 0, 'available', '{"isPublished":false}');
