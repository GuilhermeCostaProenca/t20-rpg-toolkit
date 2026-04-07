import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

function worldNotesDir(worldId: string) {
  return path.join(process.cwd(), "storage", "worlds", worldId, "notes");
}

export function noteFilePath(worldId: string, noteId: string): string {
  return path.join(worldNotesDir(worldId), `${noteId}.md`);
}

export async function writeNoteFile(worldId: string, noteId: string, contentMd: string): Promise<string> {
  const filePath = noteFilePath(worldId, noteId);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, contentMd, "utf8");
  return filePath;
}

export async function readNoteFile(worldId: string, noteId: string): Promise<string> {
  const filePath = noteFilePath(worldId, noteId);
  return readFile(filePath, "utf8");
}

export async function deleteNoteFile(worldId: string, noteId: string): Promise<void> {
  const filePath = noteFilePath(worldId, noteId);
  await unlink(filePath).catch(() => undefined);
}