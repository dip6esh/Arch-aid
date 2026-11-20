"use client";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { PROJECT_TYPES } from "@/lib/content";

const Ctx = createContext<() => void>(() => {});
export const useEnquiry = () => useContext(Ctx);

type State = "idle" | "sending" | "done" | "error";

export function EnquiryProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState<State>("idle");
  const [msg, setMsg] = useState("");
  const open = useCallback(() => { setState("idle"); setMsg(""); ref.current?.showModal(); }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState("sending");
    try {
      const res = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setState("done"); form.reset();
    } catch (err) { setState("error"); setMsg(err instanceof Error ? err.message : "Something went wrong"); }
  }

  const field = "w-full border-0 border-b border-ink bg-transparent py-2 text-ink outline-none focus:border-acc";
  const label = "mt-5 mb-1 block text-sm text-mute";
  return (
    <Ctx.Provider value={open}>
      {children}
      <dialog ref={ref} data-lenis-prevent onClick={(e) => e.target === ref.current && ref.current?.close()}
        className="m-auto w-[min(760px,92vw)] rounded-[2rem] bg-bg p-0 text-ink backdrop:bg-black/70 backdrop:backdrop-blur-sm">
        <div className="p-6 sm:p-12">
          <button aria-label="Close" onClick={() => ref.current?.close()} className="float-right text-3xl leading-none">×</button>
          <h3 className="mb-2 text-3xl">Discuss your project</h3>
          <p className="text-mute">Tell us a little about the space you have in mind.</p>
          {state === "done" ? (
            <p className="mt-8 text-lg">Thank you. We’ve received your enquiry and will be in touch shortly.</p>
          ) : (
            <form onSubmit={submit}>
              <label className={label} htmlFor="name">Your name</label>
              <input id="name" name="name" required minLength={2} className={field} />
              <label className={label} htmlFor="contact">Phone or email</label>
              <input id="contact" name="contact" required className={field} />
              <label className={label} htmlFor="type">Type of project</label>
              <select id="type" name="type" className={field}>{PROJECT_TYPES.map((t) => <option key={t} className="text-black">{t}</option>)}</select>
              <label className={label} htmlFor="message">About your project</label>
              <textarea id="message" name="message" rows={3} className={field} />
              <button disabled={state === "sending"} className="btn btn-solid mt-8 disabled:opacity-50">
                {state === "sending" ? "Sending…" : "Send enquiry"} <span className="btn-dot">→</span>
              </button>
              {state === "error" && <p role="alert" className="mt-4 text-sm text-red-600">{msg}</p>}
            </form>
          )}
        </div>
      </dialog>
    </Ctx.Provider>
  );
}
