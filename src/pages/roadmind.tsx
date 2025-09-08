import { auth, db } from "@/lib/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

import Card from "@/components/Card";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";

interface Roadmind {
  id: string;
  judul: string;
  subJudul: string;
}

export default function RoadmindDashboard() {
  const [showModal, setShowModal] = useState(false);
  const [skill, setSkill] = useState("");
  const [days, setDays] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [roadminds, setRoadminds] = useState<Roadmind[]>([]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchRoadminds = async () => {
      const q = query(collection(db, "blogs"), where("userId", "==", userId));
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Roadmind, "id">),
      }));
      setRoadminds(data);
    };
    fetchRoadminds();
  }, [userId, showModal, deleteId]);

  const handleGenerate = async () => {
    if (!userId) return;
    setLoading(true);

    const res = await fetch("/api/generateRoadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skill, days, userId }),
    });

    const data = await res.json();
    setLoading(false);
    setShowModal(false);

    if (res.ok) {
      router.push(`/roadmind/${data.id}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await deleteDoc(doc(db, "blogs", deleteId));
    setRoadminds((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleting(false);
    setDeleteId(null);
  };

  if (!userId) {
    return (
      <main className="max-w-5xl mx-auto py-4 px-2">
        <h1 className="text-2xl font-bold mb-6">Dashboard RoadMind</h1>
        <p>Harus login dulu untuk mengakses dashboard.</p>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Dashboard RoadMind</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
        >
          + Buat Roadmind
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {roadminds.length === 0 ? (
          <p className="text-gray-500">Belum ada Roadmind yang kamu buat.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 ">
            {roadminds.map((r) => (
              <Card key={r.id}>
                <div
                  onClick={() => router.push(`/roadmind/${r.id}`)}
                  className="cursor-pointer flex-1"
                >
                  <h2 className="font-semibold text-lg hover:underline">
                    {r.judul}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-3">
                    {r.subJudul}
                  </p>
                </div>
                <button
                  onClick={() => setDeleteId(r.id)}
                  className="mt-3 text-sm text-red-500 hover:text-red-700 self-end"
                >
                  Hapus
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(loading ? true : false)}
        >
          <h2 className="text-xl font-bold mb-4">Buat Roadmind Baru</h2>
          <Input
            label="Skill yang ingin dipelajari"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="Misal: Web Development"
            required
          />

          <Input
            label="Dalam berapa hari:"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            placeholder="Misal: 30"
            required
          />

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full mt-2 disabled:opacity-50 transition"
          >
            {loading ? "Loading..." : "Generate Roadmind"}
          </button>
        </Modal>
      )}

      {deleteId && (
        <Modal
          isOpen={!!deleteId}
          onClose={() => (deleting ? null : setDeleteId(null))}
        >
          <h2 className="text-lg font-semibold mb-4">Hapus Roadmind ini?</h2>
          <p className="mb-6 text-gray-600">
            Roadmind akan hilang selamanya. Kamu yakin?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setDeleteId(null)}
              disabled={deleting}
              className="px-4 py-2 rounded border border-gray-300"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 transition"
            >
              {deleting ? "Menghapus..." : "Hapus"}
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}
