import React from 'react';
import { ExternalLink } from 'lucide-react';

export const REPO_URL = 'https://github.com/Learnerbypassion/demo_live';

export default function RepoButton({ variant = 'default', className = '' }) {
  if (variant === 'dark') {
    return (
      <a
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        title="View source code on GitHub"
        className={`flex items-center gap-2 text-xs bg-white/10 hover:bg-white/20 text-white/90 hover:text-white px-3 py-1.5 rounded-full border border-white/15 transition-all group ${className}`}
      >
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current shrink-0">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
        <span className="font-medium">GitHub</span>
        <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
      </a>
    );
  }

  return (
    <a
      href={REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      title="View source code on GitHub"
      className={`inline-flex items-center gap-2 bg-white/95 hover:bg-white text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl shadow-xs hover:shadow-md transition-all text-xs sm:text-sm font-semibold group ${className}`}
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-gray-800 group-hover:text-black shrink-0 transition-colors">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
      <span>GitHub Repo</span>
      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" />
    </a>
  );
}
