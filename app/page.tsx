import { db } from "@/db";
import Image from 'next/image'
import { photosTable } from "@/db/schema";

export default async function Home() {
  const photos = await db.select().from(photosTable);

  return (
    <main className="w-full min-h-screen px-2 sm:px-8 md:px-16 lg:px-32 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo) => (
          <div key={photo.id} className="border p-4 rounded-md shadow">
            <Image src={photo.url} alt={photo.title} className="w-full h-64 object-cover mb-2 rounded-md" width={100} height={100} />
            <h2 className="text-xl font-semibold">{photo.title}</h2>
            <p className="text-gray-600">{photo.description}</p>
            <p className="text-sm text-gray-500 mt-1">By: {photo.author}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

