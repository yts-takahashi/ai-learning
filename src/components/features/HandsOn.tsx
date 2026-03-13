'use client';

import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';

interface HandsOnProps {
  source: MDXRemoteSerializeResult;
}

export default function HandsOn({ source }: HandsOnProps) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4 text-green-700">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
        <span className="font-semibold">ハンズオン</span>
      </div>
      <div className="prose prose-green max-w-none">
        <MDXRemote {...source} />
      </div>
    </div>
  );
}
