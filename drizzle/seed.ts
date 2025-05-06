import { db } from '@/db/index';
import { photosTable } from '@/db/schema';

async function seed() {
  await db.insert(photosTable).values([
    {
      title: "Sunset Beach",
      description: "A beautiful sunset over the ocean.",
      url: "https://example.com/sunset.jpg",
      author: "Alice",
    },
    {
      title: "Mountain View",
      description: "Snowy mountain with a clear sky.",
      url: "https://example.com/mountain.jpg",
      author: "Bob",
    },
  ]);

  console.log("Photos table seeded.");
}

seed()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit());

