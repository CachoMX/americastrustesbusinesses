export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">🎉 Success!</h1>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          America's Trusted Businesses
        </h2>
        <p className="text-gray-600 mb-6">
          Your Next.js application is running successfully!
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>✅ Next.js 14.2.32 Running</p>
          <p>✅ Tailwind CSS Working</p>
          <p>✅ TypeScript Compiled</p>
          <p>✅ All Dependencies Installed</p>
        </div>
        <div className="mt-6 pt-4 border-t space-y-2">
          <p className="text-xs text-gray-400">
            Ready to connect to your SQL Server database
          </p>
          <div className="flex flex-col space-y-2">
            <a 
              href="/businesses" 
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              🔍 Test Business Search →
            </a>
            <a 
              href="/" 
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              🏠 View Home Page →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}