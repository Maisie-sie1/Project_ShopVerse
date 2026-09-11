import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { slugify } from "../src/lib/slugify";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "เครื่องดื่ม", slug: "drinks", description: "กาแฟ ชา โกโก้ และเครื่องดื่มซิกเนเจอร์" },
  { name: "เบเกอรี่", slug: "bakery", description: "ขนมอบสดใหม่ อร่อยทุกวัน" },
  { name: "ของทานเล่น", slug: "snacks", description: "ขนมขบเคี้ยวและของว่าง" },
  { name: "แฟชั่น", slug: "fashion", description: "เสื้อผ้าและเครื่องแต่งกาย" },
  { name: "อิเล็กทรอนิกส์", slug: "electronics", description: "อุปกรณ์และแกดเจ็ต" },
];

type SeedProduct = {
  name: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  imageUrl: string;
  description: string;
};

const PRODUCTS: SeedProduct[] = [
  {
    name: "กาแฟดริป สายชง (250g)",
    category: "เครื่องดื่ม",
    price: 290,
    compareAtPrice: 350,
    stock: 24,
    imageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&auto=format&fit=crop",
    description:
      "เมล็ดกาแฟคั่วกลางจากดอยช้าง คัดสรรและคั่วสดใหม่ทุกออเดอร์ กลิ่นหอมช็อกโกแลตและคาราเมล เหมาะสำหรับการดริปที่บ้าน",
  },
  {
    name: "ชานมไข่มุกพร้อมดื่ม (24 กล่อง)",
    category: "เครื่องดื่ม",
    price: 620,
    compareAtPrice: 720,
    stock: 60,
    imageUrl:
      "https://images.unsplash.com/photo-1558857563-b371033873b8?w=900&auto=format&fit=crop",
    description:
      "ชานมไต้หวันรสเข้มข้น พร้อมไข่มุกดำนุ่มหนึบ ผลิตจากวัตถุดิบคุณภาพ พร้อมดื่มได้ทันที สะดวกต่อการเก็บ",
  },
  {
    name: "กาแฟกระป๋องเย็น (12 กระป๋อง)",
    category: "เครื่องดื่ม",
    price: 480,
    stock: 40,
    imageUrl:
      "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=900&auto=format&fit=crop",
    description:
      "กาแฟเย็นกระป๋อง รสชาติกลมกล่อม คาเฟอีน 120 มก. ต่อกระป๋อง พกพาง่าย เก็บได้นาน เหมาะสำหรับคอกาแฟสายเร่งรีบ",
  },
  {
    name: "ครัวซองต์เนยสด (ชิ้น)",
    category: "เบเกอรี่",
    price: 75,
    compareAtPrice: 90,
    stock: 30,
    imageUrl:
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=900&auto=format&fit=crop",
    description:
      "ครัวซองต์อบสดใหม่ทุกเช้า ด้วยเนยสดแท้จากฝรั่งเศส กรอบนอกนุ่มใน หอมเข้มข้น",
  },
  {
    name: "เค้กช็อกโกแลตลาวา (กล่อง)",
    category: "เบเกอรี่",
    price: 189,
    compareAtPrice: 230,
    stock: 15,
    imageUrl:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=900&auto=format&fit=crop",
    description:
      "เค้กช็อกโกแลตลาวาเนื้อนุ่มชุ่มฉ่ำ ใจกลางเป็นช็อกโกแลตเหลวเข้มข้น อุ่นไมโครเวฟ 30 วินาทีก็พร้อมทาน",
  },
  {
    name: "มันฝรั่งทอดกรอบ รสชีส (120g)",
    category: "ของทานเล่น",
    price: 59,
    compareAtPrice: 69,
    stock: 100,
    imageUrl:
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=900&auto=format&fit=crop",
    description:
      "มันฝรั่งทอดกรอบ อบกรอบเต็มรสชีสเข้มข้น ไม่ใช้น้ำมันทอดซ้ำ อร่อยทุกชิ้น",
  },
  {
    name: "เสื้อยืดคอตตอน 100% Oversize",
    category: "แฟชั่น",
    price: 390,
    compareAtPrice: 490,
    stock: 50,
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&auto=format&fit=crop",
    description:
      "เสื้อยืดผ้าคอตตอน 100% เนื้อหนานุ่ม ทรง Oversize สวมใส่สบาย มีให้เลือกหลายสี",
  },
  {
    name: "หูฟังไร้สาย Bluetooth 5.3",
    category: "อิเล็กทรอนิกส์",
    price: 1290,
    compareAtPrice: 1990,
    stock: 35,
    imageUrl:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=900&auto=format&fit=crop",
    description:
      "หูฟัง TWS ไร้สาย ระบบตัดเสียงรบกวน พร้อมเคสชาร์จ แบตเตอรี่ใช้งานรวม 30 ชั่วโมง กันน้ำ IPX5",
  },
  {
    name: "สมาร์ตวอตช์ หน้าจอ AMOLED",
    category: "อิเล็กทรอนิกส์",
    price: 2490,
    compareAtPrice: 2990,
    stock: 20,
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop",
    description:
      "สมาร์ตวอตช์หน้าจอ AMOLED ขนาด 1.96 นิ้ว ติดตามสุขภาพ ออกกำลังกาย แจ้งเตือนข้อความ แบตเตอรี่ 10 วัน",
  },
  {
    name: "กระติกน้ำเก็บความเย็น 750ml",
    category: "ของทานเล่น",
    price: 250,
    compareAtPrice: 320,
    stock: 80,
    imageUrl:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=900&auto=format&fit=crop",
    description:
      "กระติกน้ำสแตนเลส เก็บความเย็นได้นานถึง 24 ชั่วโมง ฝาปิดกันรั่ว พกพาง่าย ใช้ได้ทั้งร้อนและเย็น",
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Categories (upsert by name since it is unique; sets the friendly slug)
  const categoryByName = new Map<string, string>();
  for (const c of CATEGORIES) {
    const created = await prisma.category.upsert({
      where: { name: c.name },
      update: { slug: c.slug, description: c.description },
      create: { name: c.name, slug: c.slug, description: c.description },
    });
    categoryByName.set(c.name, created.id);
  }

  // Users
  const adminHash = await bcrypt.hash("admin123", 10);
  const customerHash = await bcrypt.hash("customer123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@shop.com" },
    update: {},
    create: {
      name: "ผู้ดูแลระบบ",
      email: "admin@shop.com",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@shop.com" },
    update: {},
    create: {
      name: "ลูกค้าตัวอย่าง",
      email: "customer@shop.com",
      passwordHash: customerHash,
      role: "CUSTOMER",
    },
  });

  // Products
  for (const p of PRODUCTS) {
    const slug = slugify(p.name);
    await prisma.product.upsert({
      where: { slug },
      update: {
        name: p.name,
        description: p.description,
        price: new Prisma.Decimal(p.price),
        compareAtPrice: p.compareAtPrice ? new Prisma.Decimal(p.compareAtPrice) : null,
        imageUrl: p.imageUrl,
        stock: p.stock,
        isActive: true,
        categoryId: categoryByName.get(p.category)!,
      },
      create: {
        name: p.name,
        slug,
        description: p.description,
        price: new Prisma.Decimal(p.price),
        compareAtPrice: p.compareAtPrice ? new Prisma.Decimal(p.compareAtPrice) : null,
        imageUrl: p.imageUrl,
        stock: p.stock,
        isActive: true,
        categoryId: categoryByName.get(p.category)!,
      },
    });
  }

  console.log("✅ Seeded users:", admin.email, "&", customer.email);
  console.log("✅ Seeded", PRODUCTS.length, "products");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });