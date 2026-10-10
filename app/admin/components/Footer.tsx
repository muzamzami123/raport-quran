export default function Footer() {
  return (
    <footer className="py-5 px-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center md:text-left mt-auto shrink-0">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        &copy; {new Date().getFullYear()} <span className="font-semibold text-zinc-700 dark:text-zinc-300">RaportQuran</span>. All rights reserved.
      </p>
    </footer>
  );
}
