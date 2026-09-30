// Serene sky background with soft clouds and ambient orbital arcs
export function AuthSkyBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-gradient-to-b from-[#BEE3FD] via-[#D8ECFE] to-[#EFF7FE]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full border border-white/60" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] h-[950px] rounded-full border border-white/40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1300px] h-[1300px] rounded-full border border-white/25" />
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[120%] h-96 bg-white/70 rounded-[100%] blur-3xl" />
      <div className="absolute -bottom-16 -left-20 w-[600px] h-[400px] bg-white/60 rounded-full blur-2xl" />
      <div className="absolute -bottom-20 -right-20 w-[600px] h-[400px] bg-white/60 rounded-full blur-2xl" />
      <div className="absolute top-12 left-1/4 w-96 h-48 bg-white/30 rounded-full blur-3xl" />
    </div>
  );
}
