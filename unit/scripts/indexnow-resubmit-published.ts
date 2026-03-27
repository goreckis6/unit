import { prisma } from '../lib/prisma';
import { submitIndexNowForUrls, urlsForCalculatorPage } from '../lib/indexnow';

async function main() {
  const pages = await prisma.page.findMany({
    where: { published: true },
    select: { category: true, slug: true },
  });
  const urls = pages
    .filter((p) => p.category?.trim())
    .flatMap((p) => urlsForCalculatorPage(p.category!, p.slug));
  console.log('Pages', pages.length, '→ URLs', urls.length);
  await submitIndexNowForUrls(urls);
  console.log('IndexNow submit finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
