export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50 flex items-center justify-center relative overflow-hidden py-12">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-200/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-200/30 rounded-full blur-[100px]" />
      <div className="relative z-10 w-full max-w-lg mx-auto px-6">
        {children}
      </div>
    </div>
  )
}
