const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-eu-west-3.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.xjizbwrzqwvvpgewshan',
  password: 'AselButikDb2026#SecurePassword',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log('Connecting to Supabase PostgreSQL database via connection pooler...');
    await client.connect();
    console.log('Connected successfully!');

    // Enable UUID extension
    console.log('Enabling uuid-ossp extension...');
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // Drop tables if they exist to start fresh and clean
    console.log('Cleaning up old tables...');
    await client.query('DROP TABLE IF EXISTS invoices CASCADE;');
    await client.query('DROP TABLE IF EXISTS orders CASCADE;');
    await client.query('DROP TABLE IF EXISTS stock CASCADE;');
    await client.query('DROP TABLE IF EXISTS products CASCADE;');
    await client.query('DROP TABLE IF EXISTS suppliers CASCADE;');
    await client.query('DROP TABLE IF EXISTS settings CASCADE;');

    // Create suppliers table
    console.log('Creating suppliers table...');
    await client.query(`
      CREATE TABLE suppliers (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
      );
    `);

    // Create products table
    console.log('Creating products table...');
    await client.query(`
      CREATE TABLE products (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price NUMERIC NOT NULL,
        purchase_price NUMERIC,
        images TEXT[] DEFAULT '{}',
        is_active BOOLEAN DEFAULT TRUE,
        supplier_name TEXT,
        supplier_phone TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
      );
    `);

    // Create stock table
    console.log('Creating stock table...');
    await client.query(`
      CREATE TABLE stock (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
        size TEXT NOT NULL,
        color TEXT NOT NULL,
        quantity INTEGER DEFAULT 0 NOT NULL,
        UNIQUE(product_id, size, color)
      );
    `);

    // Create orders table
    console.log('Creating orders table...');
    await client.query(`
      CREATE TABLE orders (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        client_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        wilaya TEXT NOT NULL,
        baladiya TEXT NOT NULL,
        delivery_type TEXT NOT NULL,
        product_id UUID REFERENCES products(id) ON DELETE SET NULL,
        product_name TEXT NOT NULL,
        size TEXT NOT NULL,
        color TEXT NOT NULL,
        total_price NUMERIC NOT NULL,
        status TEXT DEFAULT 'جديد' NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
      );
    `);

    // Create invoices table
    console.log('Creating invoices table...');
    await client.query(`
      CREATE TABLE invoices (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
        invoice_number SERIAL NOT NULL,
        client_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        wilaya TEXT NOT NULL,
        baladiya TEXT NOT NULL,
        delivery_type TEXT NOT NULL,
        product_name TEXT NOT NULL,
        size TEXT NOT NULL,
        color TEXT NOT NULL,
        total_price NUMERIC NOT NULL,
        printed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
      );
    `);

    // Create settings table
    console.log('Creating settings table...');
    await client.query(`
      CREATE TABLE settings (
        id INT PRIMARY KEY DEFAULT 1,
        hero_title TEXT NOT NULL,
        hero_subtitle TEXT NOT NULL,
        about_text TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        email TEXT NOT NULL,
        location_url TEXT NOT NULL,
        facebook_url TEXT,
        instagram_url TEXT,
        tiktok_url TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL,
        CONSTRAINT only_one_row CHECK (id = 1)
      );
    `);

    // Disable RLS for all tables to allow direct access via Anon Key
    console.log('Disabling RLS on tables for easy access...');
    await client.query('ALTER TABLE products DISABLE ROW LEVEL SECURITY;');
    await client.query('ALTER TABLE stock DISABLE ROW LEVEL SECURITY;');
    await client.query('ALTER TABLE orders DISABLE ROW LEVEL SECURITY;');
    await client.query('ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;');
    await client.query('ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;');
    await client.query('ALTER TABLE settings DISABLE ROW LEVEL SECURITY;');

    // Insert demo settings
    console.log('Inserting demo settings...');
    await client.query(`
      INSERT INTO settings (id, hero_title, hero_subtitle, about_text, phone_number, email, location_url, facebook_url, instagram_url, tiktok_url)
      VALUES (
        1,
        'مرحباً بكم في أسيل بوتيك',
        'للأزياء النسائية الفاخرة',
        'تأسست أسيل بوتيك لتوفير أرقى التصاميم والملابس النسائية التقليدية والعصرية. نحرص دائماً على اختيار أجود الأقمشة وتوفير تجربة تسوق فريدة لزبائننا الكريم.',
        '0555123456',
        'contact@aselbutik.com',
        'https://maps.google.com',
        'https://facebook.com/aselbutik',
        'https://instagram.com/aselbutik',
        'https://tiktok.com/@aselbutik'
      );
    `);

    // Insert demo suppliers
    console.log('Inserting demo suppliers...');
    await client.query(`
      INSERT INTO suppliers (name, phone) VALUES
      ('ورشة القفطان الملكي تلمسان', '0550112233'),
      ('مورد الحرير الفاخر الجزائر', '0661445566'),
      ('مصنع العباءات التركية وهران', '0770998877'),
      ('مستورد الأطقم الفاخرة قسنطينة', '0555334455')
      ON CONFLICT (name) DO NOTHING;
    `);

    // Insert luxury products
    console.log('Inserting demo products...');
    const insertProductsQuery = `
      INSERT INTO products (name, description, price, purchase_price, images, supplier_name, supplier_phone) VALUES
      (
        'فستان القفطان الملكي الذهبي',
        'قفطان فاخر مصمم بأرقى خيوط الحرير والذهب، مطرز يدوياً بحرفية عالية ليمنحك إطلالة ملكية في المناسبات السعيدة.',
        18900,
        11000,
        ARRAY['./images/kaftan_gold_1.png', './images/kaftan_gold_2.png'],
        'ورشة القفطان الملكي تلمسان',
        '0550112233'
      ),
      (
        'فستان السهرة الحريري الأبيض',
        'فستان سهرة ناعم وأنيق مصنوع من قماش الحرير الطبيعي ذو اللمعة الساحرة، مثالي للأعراس والمناسبات الخاصة.',
        15500,
        9000,
        ARRAY['./images/dress_white_1.png', './images/dress_white_2.png'],
        'مورد الحرير الفاخر الجزائر',
        '0661445566'
      ),
      (
        'عباءة النخبة المخملية السوداء',
        'عباءة كلاسيكية فاخرة من المخمل الفاخر المزين بتطريزات ذهبية مميزة على الأكمام والحاشية، تجمع بين الاحتشام والأناقة.',
        11200,
        6500,
        ARRAY['./images/abaya_black_1.png', './images/abaya_black_2.png'],
        'مصنع العباءات التركية وهران',
        '0770998877'
      ),
      (
        'طقم فستان وسترة البيج الفاخر',
        'طقم مكون من قطعتين فستان ناعم مع سترة مطرزة بتفاصيل دقيقة وراقية باللون البيج والذهبي الخفيف.',
        13800,
        8000,
        ARRAY['./images/dress_beige_1.png', './images/dress_beige_2.png'],
        'مستورد الأطقم الفاخرة قسنطينة',
        '0555334455'
      )
      RETURNING id, name;
    `;
    const res = await client.query(insertProductsQuery);
    const productMap = {};
    res.rows.forEach(row => {
      productMap[row.name] = row.id;
    });

    console.log('Inserting stock levels...');
    const stockData = [
      { name: 'فستان القفطان الملكي الذهبي', size: 'S', color: 'ذهبي', qty: 5 },
      { name: 'فستان القفطان الملكي الذهبي', size: 'M', color: 'ذهبي', qty: 8 },
      { name: 'فستان القفطان الملكي الذهبي', size: 'L', color: 'ذهبي', qty: 6 },
      { name: 'فستان القفطان الملكي الذهبي', size: 'XL', color: 'ذهبي', qty: 3 },
      { name: 'فستان القفطان الملكي الذهبي', size: 'XXL', color: 'ذهبي', qty: 2 },
      { name: 'فستان القفطان الملكي الذهبي', size: 'M', color: 'بيج', qty: 4 },
      { name: 'فستان القفطان الملكي الذهبي', size: 'L', color: 'بيج', qty: 3 },

      { name: 'فستان السهرة الحريري الأبيض', size: 'S', color: 'أبيض', qty: 4 },
      { name: 'فستان السهرة الحريري الأبيض', size: 'M', color: 'أبيض', qty: 7 },
      { name: 'فستان السهرة الحريري الأبيض', size: 'L', color: 'أبيض', qty: 5 },
      { name: 'فستان السهرة الحريري الأبيض', size: 'XL', color: 'أبيض', qty: 3 },
      { name: 'فستان السهرة الحريري الأبيض', size: 'M', color: 'ذهبي', qty: 3 },
      { name: 'فستان السهرة الحريري الأبيض', size: 'L', color: 'ذهبي', qty: 2 },

      { name: 'عباءة النخبة المخملية السوداء', size: 'M', color: 'أسود', qty: 10 },
      { name: 'عباءة النخبة المخملية السوداء', size: 'L', color: 'أسود', qty: 12 },
      { name: 'عباءة النخبة المخملية السوداء', size: 'XL', color: 'أسود', qty: 8 },
      { name: 'عباءة النخبة المخملية السوداء', size: 'XXL', color: 'أسود', qty: 5 },

      { name: 'طقم فستان وسترة البيج الفاخر', size: 'S', color: 'بيج', qty: 3 },
      { name: 'طقم فستان وسترة البيج الفاخر', size: 'M', color: 'بيج', qty: 6 },
      { name: 'طقم فستان وسترة البيج الفاخر', size: 'L', color: 'بيج', qty: 5 },
      { name: 'طقم فستان وسترة البيج الفاخر', size: 'XL', color: 'بيج', qty: 4 },
      { name: 'طقم فستان وسترة البيج الفاخر', size: 'M', color: 'أبيض', qty: 3 }
    ];

    for (const item of stockData) {
      const pId = productMap[item.name];
      if (pId) {
        await client.query(
          'INSERT INTO stock (product_id, size, color, quantity) VALUES ($1, $2, $3, $4) ON CONFLICT (product_id, size, color) DO UPDATE SET quantity = $4',
          [pId, item.size, item.color, item.qty]
        );
      }
    }

    console.log('Inserting some demo orders...');
    const orderData = [
      { name: 'فاطمة الزهراء', phone: '0661234567', wilaya: 'الجزائر', baladiya: 'باب الوادي', delivery: 'home', prod: 'فستان القفطان الملكي الذهبي', size: 'M', color: 'ذهبي', price: 18900, status: 'جديد' },
      { name: 'مريم بن يوسف', phone: '0555987654', wilaya: 'وهران', baladiya: 'بير الجير', delivery: 'office', prod: 'فستان السهرة الحريري الأبيض', size: 'L', color: 'أبيض', price: 15500, status: 'جديد' },
      { name: 'أمينة رحماني', phone: '0772345678', wilaya: 'قسنطينة', baladiya: 'الخروب', delivery: 'home', prod: 'عباءة النخبة المخملية السوداء', size: 'XL', color: 'أسود', price: 11200, status: 'مؤكد' },
      { name: 'سارة بوثلجة', phone: '0663456789', wilaya: 'تلمسان', baladiya: 'المنصورة', delivery: 'home', prod: 'طقم فستان وسترة البيج الفاخر', size: 'M', color: 'بيج', price: 13800, status: 'مؤكد' },
      { name: 'أسماء بلحاج', phone: '0550123456', wilaya: 'البليدة', baladiya: 'أولاد يعيش', delivery: 'office', prod: 'عباءة النخبة المخملية السوداء', size: 'M', color: 'أسود', price: 11200, status: 'ملغي' }
    ];

    for (const ord of orderData) {
      const pId = productMap[ord.prod];
      await client.query(`
        INSERT INTO orders (client_name, phone, wilaya, baladiya, delivery_type, product_id, product_name, size, color, total_price, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW() - INTERVAL '${Math.floor(Math.random() * 5)} day')
      `, [ord.name, ord.phone, ord.wilaya, ord.baladiya, ord.delivery, pId, ord.prod, ord.size, ord.color, ord.price, ord.status]);
    }

    console.log('Inserting printed invoices...');
    const confirmedOrders = await client.query("SELECT id, client_name, phone, wilaya, baladiya, delivery_type, product_name, size, color, total_price FROM orders WHERE status = 'مؤكد'");
    for (const row of confirmedOrders.rows) {
      await client.query(`
        INSERT INTO invoices (order_id, client_name, phone, wilaya, baladiya, delivery_type, product_name, size, color, total_price)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [row.id, row.client_name, row.phone, row.wilaya, row.baladiya, row.delivery_type, row.product_name, row.size, row.color, row.total_price]);
    }

    console.log('Database initialization completed successfully!');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    await client.end();
    console.log('Connection closed.');
  }
}

run();
