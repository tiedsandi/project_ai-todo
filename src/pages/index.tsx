"use client";

import {
  Timestamp,
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";

import Input from "@/components/Input";
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const allBlogs: Blog[] = snap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
          } as Blog;
        });
        setBlogs(allBlogs);
      } else {
        setBlogs([]);
      }
    } catch (err) {
      console.error("❌ Gagal ambil blogs:", err);
      setError("Gagal memuat data. Silakan coba lagi.");
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

      <div className="flex justify-center mb-6">
        <Input
          type="text"
          placeholder="Cari blog..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2  "
        />
      </div>

      {error && <p className="text-center text-red-500 mb-6">{error}</p>}

      {loading ? (
        <p className="text-center text-gray-500">Loading blogs...</p>
      ) : filteredBlogs.length === 0 ? (
        <p className="text-center text-gray-500">
          {search
            ? "Tidak ada blog yang cocok dengan pencarian."
            : "Belum ada blog tersedia."}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBlogs.map((blog) => {
            const date = blog.createdAt?.toDate
              ? blog.createdAt.toDate().toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "-";

            return (
              <Link
                key={blog.id}
                href={`/roadmind/${blog.id}`}
                className="block p-4 border rounded-lg shadow hover:shadow-lg transition"
              >
                <h2 className="font-bold text-xl mb-1">{blog.judul}</h2>
                <p className="text-sm text-gray-500 mb-2">
                  {blog.subJudul || "Tidak ada deskripsi"}
                </p>
                <span className="text-xs flex justify-end text-gray-400">
                  📅 {date}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
