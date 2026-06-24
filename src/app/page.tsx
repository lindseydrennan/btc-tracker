import Tracker from "@/components/organisms/Tracker";

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-6">
      <h1 className="mb-6 text-2xl font-semibold">Bitcoin Return Tracker</h1>
      <Tracker />
      <footer className="mt-10 border-t border-neutral-800 pt-4 text-xs text-neutral-500">
        <p>
          Your data is stored in your browser&apos;s localStorage — nothing
          leaves your machine. Clone this repo to customize.
        </p>
      </footer>
    </main>
  );
}
