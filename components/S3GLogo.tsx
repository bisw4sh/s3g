import Link from 'next/link';

export default function S3GLogo() {

  return (
    <Link href="/" className="inline-block">
      <div
        className="inline-flex items-center font-bold italic"
      >
        <span
          className="text-2xl text-indigo-600 transform inline-block transition-all duration-300"
        >
          s
        </span>

        <span
          className="text-4xl text-pink-500 transform inline-block transition-all duration-300 -rotate-[30deg] reflected"
        >
          3
        </span>

        <span
          className="text-2xl text-indigo-600 transform inline-block transition-all duration-300"
        >
          g
        </span>
      </div>
    </Link>
  );
}
