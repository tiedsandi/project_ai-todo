"use client";

import {
  Timestamp,
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";

import Link from "next/link";
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
  createdAt: Timestamp;
}

export default function HomePage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const allBlogs: Blog[] = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Blog[];
        setBlogs(allBlogs);
      }
    } catch (err) {
      console.error("❌ Gagal ambil blogs:", err);
    }
    setLoading(false);
  };

  const filteredBlogs = blogs.filter((blog) =>
    blog.judul.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center">RoadMind Blog</h1>
      <p className="text-gray-600 text-center mb-6">
        Explore roadmap belajar dari AI ✨
      </p>

      {/* Search */}
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Cari blog..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 border p-2 rounded"
        />
      </div>

      {/* Blog Grid */}
      {loading ? (
        <p className="text-center text-gray-500">Loading blogs...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBlogs.map((blog) => (
            <Link
              key={blog.id}
              href={`/roadmind/${blog.id}`}
              className="block p-4 border rounded-lg shadow hover:shadow-lg transition"
            >
              <h2 className="font-bold text-xl">{blog.judul}</h2>
              <p className="text-sm text-gray-500">{blog.subJudul}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
