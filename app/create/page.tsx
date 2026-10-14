import type { Metadata } from "next";
import { CreateForm } from "@/components/create-form";

export const metadata: Metadata = {
  title: "Create a challenge",
  description: "Choose a start article, a target, and a mode. Share the link.",
};

export default function CreatePage() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-8 sm:py-12">
      <h1 className="display-tight font-serif text-3xl font-semibold sm:text-5xl">Build a race.</h1>
      <p className="mt-3 text-sm text-muted sm:mt-4 sm:text-base">
        Search is only for choosing the two articles. Once the run starts, the search box is gone.
      </p>
      <div className="mt-6 sm:mt-8">
        <CreateForm />
      </div>
    </main>
  );
}
