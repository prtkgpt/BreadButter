export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-orange-100 dark:from-zinc-900 dark:to-zinc-800">
      <main className="flex flex-col items-center gap-8 px-6 text-center">
        <div className="text-6xl">🍞</div>
        <h1 className="text-5xl font-bold tracking-tight text-amber-900 dark:text-amber-100">
          BreadButter
        </h1>
        <p className="max-w-md text-lg text-amber-800 dark:text-amber-200">
          Your essential daily companion. Simple, reliable, and always there when you need it.
        </p>
        <div className="flex gap-4">
          <a
            href="#get-started"
            className="rounded-full bg-amber-600 px-6 py-3 font-medium text-white transition-colors hover:bg-amber-700"
          >
            Get Started
          </a>
          <a
            href="#learn-more"
            className="rounded-full border border-amber-600 px-6 py-3 font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-zinc-700"
          >
            Learn More
          </a>
        </div>
      </main>
    </div>
  );
}
