// src/useCollection.js
// Hook genérico para ler e escrever em qualquer coleção do Firestore

import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

export function useCollection(name) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, name), orderBy("criadoEm", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [name]);

  async function add(obj) {
    await addDoc(collection(db, name), { ...obj, criadoEm: serverTimestamp() });
  }

  async function update(id, obj) {
    await updateDoc(doc(db, name, id), obj);
  }

  async function remove(id) {
    await deleteDoc(doc(db, name, id));
  }

  return { data, loading, add, update, remove };
}
