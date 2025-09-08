import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

import ReactMarkdown from "react-markdown";
import { db } from "@/lib/firebase";
import { useRouter } from "next/router";

interface RoadmapItem {
  hari: number;
  kegiatan: string;
}

interface Roadmind {
  judul: string;
  subJudul: string;
  roadmap: RoadmapItem[];
}

export default function RoadmindDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [roadmind, setRoadmind] = useState<Roadmind | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const ref = doc(db, "blogs", id as string);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setRoadmind(snap.data() as Roadmind);
      } else {
        setNotFound(true);
      }
    };
    fetchData();
  }, [id]);

  if (notFound) {
    return (
      <main className="max-w-2xl mx-auto p-6 text-center">
        <h1 className="text-xl font-semibold mb-2">
          😕 Roadmap tidak ditemukan
        </h1>
        <p className="text-gray-600">
          Mungkin sudah dihapus atau ID yang kamu masukkan salah.
        </p>
      </main>
    );
  }

  if (!roadmind) return <p className="p-4">Loading...</p>;

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">{roadmind.judul}</h1>
      <div className="text-gray-600 mb-6">
        <ReactMarkdown>{roadmind.subJudul}</ReactMarkdown>
      </div>

      <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4">
        {roadmind.roadmap.map((item) => (
          <div key={item.hari} className="p-4 border rounded-lg">
            <h3 className="font-semibold">Hari {item.hari}</h3>
            <ReactMarkdown>{item.kegiatan}</ReactMarkdown>
          </div>
        ))}
      </div>
    </main>
  );
}
