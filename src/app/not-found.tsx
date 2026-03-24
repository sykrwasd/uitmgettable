import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-600/60 flex flex-col items-center justify-center p-4 text-center space-y-6">
        {/* Big 404 */}
        <h1 className="text-8xl font-extrabold text-blue-600/80 leading-none">
          404
        </h1>

        {/* Gif */}
        <img
          src="https://tenor.com/gkwvjqWLQZR.gif"
          alt="404 gif"
          className="w-72 h-72 object-cover rounded-xl mx-auto"
        />

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Page Not Found</h2>
          <p className="text-white text-sm">
            Looks like this page took the wrong timetable slot.
          </p>
        </div>

        <Link
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200"
        >
          Back to Home
        </Link>
    </div>

  );
}
