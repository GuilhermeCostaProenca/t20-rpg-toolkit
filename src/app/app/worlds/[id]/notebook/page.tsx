"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { useWorldInspect } from "@/components/world-os/world-inspect-context";

type NoteLink = {
  id: string;
  syntaxType: "wikilink" | "mention_entity" | "mention_note";
  rawRef: string;
  status: "resolved" | "unresolved";
  toEntityId: string | null;
  toNoteId: string | null;
};

type NoteItem = {
  id: string;
  title: string;
  slug: string;
  contentMd: string;
  updatedAt: string;
  outgoingLinks: NoteLink[];
};

type Backlink = {
  id: string;
  syntaxType: string;
  rawRef: string;
  fromNote: {
    id: string;
    title: string;
    slug: string;
    updatedAt: string;
  };
};

export default function WorldNotebookPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const worldId = params.id;
  const { setPayload } = useWorldInspect();

  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [contentMd, setContentMd] = useState("");
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shouldCreate = searchParams.get("create") === "note";

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/worlds/${worldId}/notes`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Falha ao carregar notas");
      const list = (json.data || []) as NoteItem[];
      setNotes(list);
      if (!selectedNoteId && list[0]) {
        setSelectedNoteId(list[0].id);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Falha ao carregar notas");
    } finally {
      setLoading(false);
    }
  }, [selectedNoteId, worldId]);

  const loadNote = useCallback(async (noteId: string) => {
    const res = await fetch(`/api/worlds/${worldId}/notes/${noteId}`, { cache: "no-store" });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || "Falha ao carregar nota");
    const note = json.data as NoteItem;
    setTitle(note.title);
    setContentMd(note.contentMd);

    setPayload({
      title: note.title,
      subtitle: "Nota",
      body: `Slug: ${note.slug}`,
      meta: [
        { label: "Atualizado", value: new Date(note.updatedAt).toLocaleString("pt-BR") },
        { label: "Links", value: String(note.outgoingLinks?.length ?? 0) },
      ],
    });
  }, [setPayload, worldId]);

  const loadBacklinks = useCallback(async (noteId: string) => {
    const res = await fetch(`/api/worlds/${worldId}/notes/${noteId}/backlinks`, { cache: "no-store" });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || "Falha ao carregar backlinks");
    setBacklinks(json.data || []);
  }, [worldId]);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    if (!selectedNoteId) return;
    void loadNote(selectedNoteId).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : "Falha ao carregar nota");
    });
    void loadBacklinks(selectedNoteId).catch(() => setBacklinks([]));
  }, [loadBacklinks, loadNote, selectedNoteId]);

  useEffect(() => {
    if (!shouldCreate) return;
    setSelectedNoteId("");
    setTitle("");
    setContentMd("");
  }, [shouldCreate]);

  const selectedNote = useMemo(() => notes.find((note) => note.id === selectedNoteId), [notes, selectedNoteId]);

  async function createNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/worlds/${worldId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), contentMd }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Nao foi possivel criar nota");
      const note = json.data as NoteItem;
      await loadNotes();
      setSelectedNoteId(note.id);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Falha ao criar nota");
    } finally {
      setSaving(false);
    }
  }

  async function saveNote() {
    if (!selectedNoteId || !title.trim()) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/worlds/${worldId}/notes/${selectedNoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), contentMd }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Nao foi possivel salvar nota");
      await loadNotes();
      await loadBacklinks(selectedNoteId);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Falha ao salvar nota");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg font-semibold text-white">Caderno</h1>
          <button
            type="button"
            onClick={() => {
              setSelectedNoteId("");
              setTitle("");
              setContentMd("");
              setBacklinks([]);
            }}
            className="rounded-lg border border-white/20 px-2 py-1 text-xs text-white/80"
          >
            Nova nota
          </button>
        </div>
        <p className="mt-2 text-xs text-white/65">
          Markdown hibrido com `[[wikilink]]`, `@e:slug` e `@n:slug`. Links nao resolvidos sao mantidos com status `unresolved`.
        </p>

        {loading ? <p className="mt-3 text-sm text-white/60">Carregando...</p> : null}
        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
        <div className="mt-3 space-y-2">
          {notes.map((note) => (
            <button
              key={note.id}
              type="button"
              onClick={() => setSelectedNoteId(note.id)}
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                selectedNoteId === note.id
                  ? "border-primary/45 bg-primary/20 text-white"
                  : "border-white/10 bg-black/25 text-white/80"
              }`}
            >
              <p className="font-semibold">{note.title}</p>
              <p className="text-xs text-white/50">{note.slug}</p>
            </button>
          ))}
        </div>
      </aside>

      <div className="space-y-4">
        <form onSubmit={selectedNoteId ? (event) => { event.preventDefault(); void saveNote(); } : createNote} className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Titulo da nota"
              className="min-w-[260px] flex-1 rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-white/35"
            />
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg border border-emerald-300/40 bg-emerald-400/20 px-3 py-2 text-xs font-semibold text-emerald-100 disabled:opacity-60"
            >
              {saving ? "Salvando..." : selectedNoteId ? "Salvar nota" : "Criar nota"}
            </button>
          </div>
          <textarea
            value={contentMd}
            onChange={(event) => setContentMd(event.target.value)}
            placeholder="Escreva em markdown..."
            rows={20}
            className="mt-3 w-full rounded-xl border border-white/10 bg-[#06080f] p-3 text-sm leading-6 text-white outline-none focus:border-white/30"
          />
        </form>

        {selectedNote ? (
          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h2 className="text-sm font-semibold text-white">Links da nota</h2>
              {selectedNote.outgoingLinks?.length ? (
                <ul className="mt-3 space-y-2 text-xs">
                  {selectedNote.outgoingLinks.map((link) => (
                    <li key={link.id} className="rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-white/80">
                      <p className="font-semibold text-white">{link.syntaxType}</p>
                      <p className="mt-1 text-white/65">{link.rawRef}</p>
                      <p className={`mt-1 ${link.status === "resolved" ? "text-emerald-300" : "text-amber-300"}`}>
                        {link.status}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-xs text-white/60">Sem links detectados.</p>
              )}
            </article>

            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h2 className="text-sm font-semibold text-white">Referenciado por</h2>
              {backlinks.length ? (
                <ul className="mt-3 space-y-2 text-xs">
                  {backlinks.map((link) => (
                    <li key={link.id} className="rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-white/80">
                      <p className="font-semibold text-white">{link.fromNote.title}</p>
                      <p className="mt-1 text-white/60">{link.syntaxType}: {link.rawRef}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-xs text-white/60">Nenhum backlink para esta nota.</p>
              )}
            </article>
          </section>
        ) : null}
      </div>
    </section>
  );
}
