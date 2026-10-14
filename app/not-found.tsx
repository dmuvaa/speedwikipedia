import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-20">
      <h1 className="font-serif text-5xl leading-none">That page is not here.</h1>
      <p className="mt-4 text-muted">The challenge may have moved. Pick another one.</p>
      <p className="mt-6">
        <Link href="/challenges" className="underline underline-offset-4">
          Browse challenges
        </Link>
      </p>
    </main>
  );
}
