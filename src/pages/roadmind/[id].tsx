import { doc, getDoc } from "firebase/firestore";

import { GetServerSideProps } from "next";
import { db } from "@/lib/firebase";

interface RoadmapItem {
  hari: number;
  tanggal: string;
  kegiatan: string;
}

interface Blog {
  id: string;
  judul: string;
  subJudul: string;
  roadmap: RoadmapItem[];
}

export default function BlogDetail({ blog }: { blog: Blog | null }) {
  if (!blog) {
    return <p className="text-center py-10">Blog tidak ditemukan 😢</p>;
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{blog.judul}</h1>
      <p className="text-gray-600 mb-6">{blog.subJudul}</p>

      <div className="space-y-4">
        {blog.roadmap.map((item) => (
          <div
            key={item.hari}
            className="p-4 border rounded-lg shadow-sm bg-white"
          >
            <h2 className="font-semibold">
              Hari {item.hari} - {item.tanggal}
            </h2>
            <p className="text-gray-700">{item.kegiatan}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

// Server-side fetch berdasarkan ID
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  const ref = doc(db, "blogs", id as string);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return { props: { blog: null } };
  }

  const blog = { id: snap.id, ...snap.data() };

  return {
    props: {
      blog: JSON.parse(JSON.stringify(blog)), // biar aman dipass ke client
    },
  };
};
