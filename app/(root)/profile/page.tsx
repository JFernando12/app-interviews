import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/ProfileForm'
import PageHeader from '@/components/PageHeader';

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-2 sm:py-4">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="mb-4 sm:mb-6">
          <PageHeader
            title="Profile Settings"
            description="Manage your profile information and professional description"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Profile Form */}
          <div>
            <ProfileForm />
          </div>

          {/* Profile Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              About Professional Description
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>Your professional description will be displayed:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>In the application header when you're signed in</li>
                <li>On interview reports and evaluations</li>
                <li>In team member listings (if applicable)</li>
              </ul>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Suggested Formats:
                </h4>
                <ul className="text-blue-700 space-y-1 text-xs">
                  <li>• Backend Developer</li>
                  <li>• Frontend Engineer</li>
                  <li>• Full Stack Developer</li>
                  <li>• DevOps Engineer</li>
                  <li>• Data Scientist</li>
                  <li>• Product Manager</li>
                  <li>• UX/UI Designer</li>
                </ul>
              </div>

              <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                <h4 className="font-medium text-amber-900 mb-2">
                  Current Role:
                  <span className="font-normal text-amber-700 ml-1">
                    {session.user.role || 'user'}
                  </span>
                </h4>
                <p className="text-amber-700 text-xs">
                  Role changes must be made by an administrator
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a href="/" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}