"use client";
import React, { useEffect, useState } from "react";
import { useRolesHook } from "@/modules/roles/business/hooks/useRolesHook";
import { RolesEntity } from "@/modules/roles/business/entities/RolesEntity";

const RolesPage = () => {
  const { create, getAll } = useRolesHook();
  const [list, setList] = useState<RolesEntity[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => { (async () => setList(await getAll()))(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create({ name, description });
    setList(await getAll());
    setName(""); setDescription("");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Roles Page</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <input className="border p-2 w-full" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <textarea className="border p-2 w-full" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button className="bg-purple-600 text-white px-4 py-2 rounded">Add</button>
      </form>
      <ul className="mt-4 space-y-2">
        {list.map((item) => (
          <li key={item.id} className="border p-2 rounded">
            <strong>{item.name}</strong> - {item.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RolesPage;