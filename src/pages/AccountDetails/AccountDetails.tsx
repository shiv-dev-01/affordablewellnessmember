import { Phone, Mail, User } from 'lucide-react';
import { LoadingBar } from '../../components/ui/LoadingBar';
import { useAccountDetails } from './hooks/useAccountDetails';
import { AccountDetailsSkeleton } from './components/AccountDetailsSkeleton';
import { Button } from '../../components/ui/Button';

export function AccountDetails() {
  const { accountDetails, isLoading, error } = useAccountDetails();

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Account Details</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  const userDetails = accountDetails?.user_details;

  return (
    <>
      <LoadingBar isLoading={isLoading} />
      
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">👤 Account Details</h2>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            View your personal information
          </p>
        </div>

        {isLoading ? (
          <AccountDetailsSkeleton />
        ) : userDetails ? (
          <>
            {/* Personal Information */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-gray-900 font-medium mt-1">
                    {userDetails.first_name} {userDetails.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="text-gray-900 font-medium mt-1">
                    {userDetails.gender || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="text-gray-900 font-medium mt-1">
                    {userDetails.dob || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="text-gray-900 font-medium mt-1">{userDetails.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="text-gray-900 font-medium mt-1">
                      {userDetails.phone_number || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}