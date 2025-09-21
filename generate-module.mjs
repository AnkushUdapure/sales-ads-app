import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// --- Module name from command ---
const moduleName = process.argv[2];

if (!moduleName) {
  console.error(
    "❌ Please provide a module name! Example: node generate-module.mjs roles"
  );
  process.exit(1);
}

const lowerModule = moduleName.toLowerCase();
const capitalModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

// --- Base directory for modules ---
const baseDir = path.join(process.cwd(), "src", "modules", moduleName);

// --- Folders to generate (core removed) ---
const folders = [
  "data/dataSources/firebase",
  "data/models",
  "data/repositories",
  "data/mappers",
  "business/entities",
  "business/repositories",
  "business/usecases",
  "business/hooks",
  "presentation/pages",
  "presentation/providers",
];

// --- Files to generate (removed core/config/usecaseConfig.ts) ---
const files = [
  {
    path: `business/entities/${capitalModule}Entity.ts`,
    content: `export type ${capitalModule}Entity = {
  id?: string;
  name?: string;
  description?: string;
  createdAt?: number;
  updatedAt?: number;
};`,
  },
  {
    path: `business/repositories/${capitalModule}Repository.ts`,
    content: `import { ${capitalModule}Model } from "@/modules/${moduleName}/data/models/${capitalModule}Model";
import { ApiResponse } from "@/core/apiWrapper";

export interface ${capitalModule}Repository {
  fetchAll(): Promise<ApiResponse<${capitalModule}Model[]>>;
  fetchById(id: string): Promise<ApiResponse<${capitalModule}Model>>;
  create(data: ${capitalModule}Model): Promise<ApiResponse<${capitalModule}Model>>;
  update(id: string, data: ${capitalModule}Model): Promise<ApiResponse<${capitalModule}Model>>;
  deleteData(id: string): Promise<ApiResponse<null>>;
}`,
  },
  {
    path: `business/usecases/${capitalModule}Usecase.ts`,
    content: `import { ${capitalModule}Repository } from "@/modules/${moduleName}/business/repositories/${capitalModule}Repository";
import { ${capitalModule}Entity } from "@/modules/${moduleName}/business/entities/${capitalModule}Entity";
import { map${capitalModule}EntityToModel, map${capitalModule}ModelToEntity } from "@/modules/${moduleName}/data/mappers/${capitalModule}Mapper";

export class ${capitalModule}Usecase {
  constructor(private repo: ${capitalModule}Repository) {}

  async create(entity: ${capitalModule}Entity): Promise<${capitalModule}Entity> {
    const model = map${capitalModule}EntityToModel(entity);
    const result = await this.repo.create(model);
    if (!result.status || !result.data) throw new Error(result.message || "Failed to create");
    return map${capitalModule}ModelToEntity(result.data);
  }

  async fetchAll(): Promise<${capitalModule}Entity[]> {
    const result = await this.repo.fetchAll();
    if (!result.status || !result.data) throw new Error(result.message || "Failed to fetch");
    return result.data.map(map${capitalModule}ModelToEntity);
  }
}`,
  },
  {
    path: `business/hooks/use${capitalModule}Hook.ts`,
    content: `import { ${capitalModule}Usecase } from "@/modules/${moduleName}/business/usecases/${capitalModule}Usecase";
import { ${capitalModule}Entity } from "@/modules/${moduleName}/business/entities/${capitalModule}Entity";

export const use${capitalModule}Hook = (repo: ${capitalModule}Usecase) => {
  const usecase = new ${capitalModule}Usecase(repo);

  const create = async (data: ${capitalModule}Entity) => await usecase.create(data);
  const getAll = async () => await usecase.fetchAll();

  return { create, getAll };
};`,
  },
  {
    path: `data/models/${capitalModule}Model.ts`,
    content: `export type ${capitalModule}Model = {
  id?: string;
  name?: string;
  description?: string;
  createdAt?: number;
  updatedAt?: number;
};`,
  },
  {
    path: `data/mappers/${capitalModule}Mapper.ts`,
    content: `import { ${capitalModule}Entity } from "@/modules/${moduleName}/business/entities/${capitalModule}Entity";
import { ${capitalModule}Model } from "@/modules/${moduleName}/data/models/${capitalModule}Model";

export const map${capitalModule}ModelToEntity = (model: ${capitalModule}Model): ${capitalModule}Entity => ({
  id: model.id ?? "",
  name: model.name ?? "",
  description: model.description ?? "",
  createdAt: model.createdAt ?? 0,
  updatedAt: model.updatedAt ?? 0,
});

export const map${capitalModule}EntityToModel = (entity: ${capitalModule}Entity): ${capitalModule}Model => ({
  name: entity.name,
  description: entity.description,
  createdAt: entity.createdAt ?? 0,
  updatedAt: entity.updatedAt ?? 0,
});`,
  },
  {
    path: `presentation/pages/${capitalModule}Page.tsx`,
    content: `"use client";
import React, { useEffect, useState } from "react";
import { use${capitalModule}Hook } from "@/modules/${moduleName}/business/hooks/use${capitalModule}Hook";
import { ${capitalModule}Entity } from "@/modules/${moduleName}/business/entities/${capitalModule}Entity";

const ${capitalModule}Page = () => {
  const { create, getAll } = use${capitalModule}Hook();
  const [list, setList] = useState<${capitalModule}Entity[]>([]);
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
      <h1 className="text-xl font-bold">${capitalModule} Page</h1>
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

export default ${capitalModule}Page;`,
  },
];

// --- Helper to ask question (promisify readline)
const ask = (query) =>
  new Promise((resolve) => rl.question(query, (ans) => resolve(ans)));

async function main() {
  const answer = await ask(
    "⚡ Do you want to create starter files too? (yes/no): "
  );
  const createFiles = answer.trim().toLowerCase().startsWith("y");

  // Create folders
  for (const folder of folders) {
    const dir = path.join(baseDir, folder);
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📂 Created: ${dir}`);
  }

  // Create files
  if (createFiles) {
    for (const file of files) {
      const filePath = path.join(baseDir, file.path);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, file.content);
        console.log(`📝 Created: ${filePath}`);
      } else {
        console.warn(`⚠️ Skipped (already exists): ${filePath}`);
      }
    }
  }

  console.log(`\n🎉 Module '${capitalModule}' created successfully!`);
  rl.close();
}

main();
