/**
 * Get Kraken - Footer Component
 *
 * Displays footer with links
 */

import { FOOTER_LINKS } from "../constants";

export function Footer() {
  return (
    <footer className="mt-12 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
      <p>
        Built by{" "}
        <a
          href={FOOTER_LINKS.portfolio}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700 dark:hover:text-gray-300"
        >
          Sarah Arvidson
        </a>
        {" · "}
        <a
          href={FOOTER_LINKS.github}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700 dark:hover:text-gray-300"
        >
          GitHub
        </a>
        {" · "}
        <a
          href={FOOTER_LINKS.venmo}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700 dark:hover:text-gray-300"
        >
          Venmo
        </a>
      </p>
    </footer>
  );
}

