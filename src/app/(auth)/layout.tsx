export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-4xl">🏋️‍♂️⭐</div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-white">
            Gymmon<span className="text-amber-400">STARS</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Gotta stack them all.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
