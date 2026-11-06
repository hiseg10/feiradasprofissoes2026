import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const TIPOS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const MAX_BYTES = 5 * 1024 * 1024;

export async function salvarArquivo(file: File): Promise<string> {
  const extensao = TIPOS[file.type];
  if (!extensao) {
    throw new Error("Formato inválido. Use JPG, PNG ou WEBP.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Cada foto deve ter no máximo 5 MB.");
  }

  const nome = `${randomUUID()}${extensao}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`anuncios/${nome}`, file, { access: "public" });
    return blob.url;
  }

  if (process.env.VERCEL) {
    throw new Error("Configure BLOB_READ_WRITE_TOKEN para armazenar fotos na Vercel.");
  }

  const pasta = join(process.cwd(), "public", "uploads");
  await mkdir(pasta, { recursive: true });
  await writeFile(join(pasta, nome), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${nome}`;
}

export async function salvarFotos(files: File[]): Promise<string[]> {
  const validos = files.filter((file) => file && file.size > 0);
  if (validos.length > 5) {
    throw new Error("Envie no máximo 5 fotos.");
  }
  const urls: string[] = [];
  for (const file of validos) {
    urls.push(await salvarArquivo(file));
  }
  return urls;
}
