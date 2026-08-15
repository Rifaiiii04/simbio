import bcrypt from 'bcryptjs';
import { prisma } from './prisma.js';

async function seed() {
  console.log('🌱 Seeding database with global taxonomy and real user accounts...');

  // Seed Admin Account
  const adminPasswordHash = await bcrypt.hash('adminPassword123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@simbioly.com' },
    update: { role: 'ADMIN', country: 'United States' },
    create: {
      name: 'Simbioly Administrator',
      username: 'admin',
      email: 'admin@simbioly.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      country: 'United States',
    },
  });
  console.log('👤 Admin account seeded: admin@simbioly.com');

  // Seed Demo Users across various countries for dynamic database stats
  const sampleUsers = [
    { name: 'Alex Morgan', email: 'alex@example.com', country: 'United States', username: 'alex_m' },
    { name: 'Budi Santoso', email: 'budi@example.com', country: 'Indonesia', username: 'budi_s' },
    { name: 'Siti Rahma', email: 'siti@example.com', country: 'Indonesia', username: 'siti_r' },
    { name: 'Hans Muller', email: 'hans@example.com', country: 'Germany', username: 'hans_m' },
    { name: 'Kenji Sato', email: 'kenji@example.com', country: 'Japan', username: 'kenji_s' },
    { name: 'Lucas Silva', email: 'lucas@example.com', country: 'Brazil', username: 'lucas_s' },
    { name: 'Emma Watson', email: 'emma@example.com', country: 'United Kingdom', username: 'emma_w' },
    { name: 'Chloe Dubois', email: 'chloe@example.com', country: 'France', username: 'chloe_d' },
    { name: 'Liam Smith', email: 'liam@example.com', country: 'Australia', username: 'liam_s' },
  ];

  const userPasswordHash = await bcrypt.hash('userPassword123', 12);
  for (const u of sampleUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { country: u.country },
      create: {
        name: u.name,
        email: u.email,
        username: u.username,
        passwordHash: userPasswordHash,
        country: u.country,
        role: 'USER',
      },
    });
  }

  const categoriesData = [
    { name: 'Technology & Software', slug: 'technology' },
    { name: 'Engineering & Robotics', slug: 'engineering' },
    { name: 'Design & Visual Arts', slug: 'design' },
    { name: 'Music & Audio Production', slug: 'music' },
    { name: 'Business & Finance', slug: 'business' },
    { name: 'Languages & Literature', slug: 'language' },
    { name: 'Medical & Health Sciences', slug: 'medical' },
    { name: 'Humanities & Social Sciences', slug: 'humanities' },
    { name: 'Culinary & Gastronomy', slug: 'culinary' },
    { name: 'Sports & Fitness', slug: 'sports' },
    { name: 'Trades & Craftsmanship', slug: 'trades' },
    { name: 'Natural Sciences & Math', slug: 'science' },
  ];

  const categoryMap = new Map<string, string>();

  for (const cat of categoriesData) {
    const created = await prisma.skillCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    });
    categoryMap.set(cat.slug, created.id);
  }

  const skillsData = [
    { categorySlug: 'technology', name: 'React', slug: 'react', description: 'Web UI library' },
    { categorySlug: 'technology', name: 'Node.js', slug: 'nodejs', description: 'Server-side JavaScript runtime' },
    { categorySlug: 'technology', name: 'Python', slug: 'python', description: 'Data science & backend language' },
    { categorySlug: 'technology', name: 'Cybersecurity', slug: 'cybersecurity', description: 'Ethical hacking & system protection' },

    { categorySlug: 'engineering', name: 'Robotics Engineering', slug: 'robotics', description: 'Microcontrollers & kinematics' },
    { categorySlug: 'engineering', name: 'CAD Modeling & 3D Design', slug: 'cad-modeling', description: 'SolidWorks & AutoCAD fundamentals' },

    { categorySlug: 'design', name: 'UI/UX Design', slug: 'ui-ux-design', description: 'User interfaces & prototyping' },
    { categorySlug: 'design', name: 'Figma', slug: 'figma', description: 'Collaborative vector design' },

    { categorySlug: 'music', name: 'Acoustic Guitar', slug: 'acoustic-guitar', description: 'Fingerstyle & chord progression' },
    { categorySlug: 'music', name: 'Piano & Music Theory', slug: 'piano', description: 'Keyboard performance & harmony' },

    { categorySlug: 'business', name: 'Digital Marketing & SEO', slug: 'digital-marketing', description: 'Growth strategies & search analytics' },
    { categorySlug: 'business', name: 'Financial Modeling', slug: 'financial-modeling', description: 'Valuation & corporate finance' },

    { categorySlug: 'language', name: 'English Fluency', slug: 'english', description: 'Conversational & business English' },
    { categorySlug: 'language', name: 'Spanish', slug: 'spanish', description: 'Grammar, vocabulary & speaking' },

    { categorySlug: 'medical', name: 'Human Anatomy & Physiology', slug: 'anatomy', description: 'Biomedical foundations' },

    { categorySlug: 'humanities', name: 'World History & Philosophy', slug: 'history-philosophy', description: 'Ethics & historical analysis' },

    { categorySlug: 'culinary', name: 'French Culinary Arts', slug: 'french-culinary', description: 'Sauces, knife skills & plating' },

    { categorySlug: 'sports', name: 'Calisthenics & Strength', slug: 'calisthenics', description: 'Bodyweight training' },

    { categorySlug: 'trades', name: 'Woodworking & Joinery', slug: 'woodworking', description: 'Furniture making & hand tools' },

    { categorySlug: 'science', name: 'Linear Algebra & Calculus', slug: 'mathematics', description: 'Vector spaces & differential equations' },
  ];

  for (const item of skillsData) {
    const categoryId = categoryMap.get(item.categorySlug);
    if (categoryId) {
      await prisma.skill.upsert({
        where: { slug: item.slug },
        update: { categoryId, name: item.name, description: item.description },
        create: { categoryId, name: item.name, slug: item.slug, description: item.description },
      });
    }
  }

  console.log('✅ Seeding completed with real users & dynamic country data!');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
