'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { Button, Input } from '@3asoftwares/ui';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faMapMarkerAlt,
  faHeart,
  faEdit,
  faPlus,
  faCheckCircle,
  faExclamationTriangle,
  faPaperPlane,
  faEnvelope,
  faSpinner,
  faTrash,
  faStar,
} from '@fortawesome/free-solid-svg-icons';
import { PageHeader } from '@/components';
import { useSendVerificationEmail, useVerifyEmail } from '@/lib/hooks/useEmailVerification';
import { useCurrentUser } from '@/lib/hooks/useAuth';
import { useUpdateProfile } from '@/lib/hooks/useUpdateProfile';
import {
  useAddresses,
  useAddAddress,
  useDeleteAddress,
  useSetDefaultAddress,
  type Address,
} from '@/lib/hooks/useAddresses';

export default function ProfilePage() {
  const router = useRouter();
  const { userProfile, setUserProfile } = useCartStore();
  const { data: currentUser, refetch: refetchUser, isLoading: isLoadingUser } = useCurrentUser();
  const {
    sendVerificationEmail,
    isLoading: isSendingEmail,
    data: sendEmailResult,
  } = useSendVerificationEmail();
  useVerifyEmail();
  const { updateProfile, isLoading: isUpdatingProfile } = useUpdateProfile();

  // Address hooks
  const { data: addresses = [], isLoading: addressesLoading } = useAddresses();
  const { mutateAsync: addAddressMutation, isPending: addingAddress } = useAddAddress();
  const { mutateAsync: deleteAddressMutation, isPending: deletingAddress } = useDeleteAddress();
  const { mutateAsync: setDefaultAddressMutation, isPending: settingDefault } =
    useSetDefaultAddress();

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'wishlist'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [verificationMessage, setVerificationMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Refetch user on mount to get latest data
  useEffect(() => {
    refetchUser();
  }, [refetchUser]);

  const [profileData, setProfileData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
  });

  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    name: '',
    mobile: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  // Get emailVerified status from currentUser (GraphQL) which is more up-to-date
  const isEmailVerified = currentUser?.emailVerified ?? false;

  const handleSendVerificationEmail = async () => {
    setVerificationMessage(null);
    try {
      const result = await sendVerificationEmail('storefront');
      if (result.success) {
        setVerificationMessage({ type: 'success', text: result.message });
      } else {
        setVerificationMessage({ type: 'error', text: result.message });
      }
    } catch (error: any) {
      setVerificationMessage({
        type: 'error',
        text: error.message || 'Failed to send verification email',
      });
    }
  };

  useEffect(() => {
    if (!userProfile) {
      router.push('/login');
    }
  }, [userProfile, router]);

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    setProfileMessage(null);
    setLoading(true);
    try {
      const result = await updateProfile({ name: profileData.name });
      if (result.success) {
        // Update local state with new data
        setUserProfile({
          ...userProfile,
          name: result.user?.name || profileData.name,
        });
        setIsEditing(false);
        setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Refetch user to ensure all data is in sync
        refetchUser();
      } else {
        setProfileMessage({ type: 'error', text: result.message || 'Failed to update profile' });
      }
    } catch (error: any) {
      setProfileMessage({
        type: 'error',
        text: error.message || 'Failed to update profile',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.name || !newAddress.mobile || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zip) {
      alert('Please fill in all required fields (Name, Mobile, Street, City, State, ZIP)');
      return;
    }

    try {
      const result = await addAddressMutation({
        name: newAddress.name,
        mobile: newAddress.mobile,
        email: newAddress.email || undefined,
        street: newAddress.street,
        city: newAddress.city,
        state: newAddress.state,
        zip: newAddress.zip,
        country: newAddress.country || 'India',
        isDefault: addresses.length === 0,
      });

      if (result?.success) {
        setNewAddress({ name: '', mobile: '', email: '', street: '', city: '', state: '', zip: '', country: '' });
        setIsAddingAddress(false);
        alert('Address added successfully!');
      } else {
        alert(result?.message || 'Failed to add address');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const result = await deleteAddressMutation(addressId);
      if (result?.success) {
        alert('Address deleted successfully!');
      } else {
        alert(result?.message || 'Failed to delete address');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      const result = await setDefaultAddressMutation(addressId);
      if (result?.success) {
        alert('Default address updated!');
      } else {
        alert(result?.message || 'Failed to set default address');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to set default address');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        icon={faUser}
        title="My Account"
        subtitle={
          <span>
            Welcome back, <b>{userProfile.name}</b>
          </span>
        }
        iconGradient="from-gray-700 to-gray-900"
        titleGradient="from-gray-900 to-black"
      />

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white shadow-xl overflow-hidden sticky top-24 border border-gray-200">
              <nav className="flex flex-col">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-6 py-4 text-left font-semibold transition flex items-center gap-3 ${
                    activeTab === 'profile'
                      ? 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-900 border-l-4 border-gray-900'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`px-6 py-4 text-left font-semibold transition flex items-center gap-3 ${
                    activeTab === 'addresses'
                      ? 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-900 border-l-4 border-gray-900'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="w-5 h-5" />
                  Addresses
                </button>
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`px-6 py-4 text-left font-semibold transition flex items-center gap-3 ${
                    activeTab === 'wishlist'
                      ? 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-900 border-l-4 border-gray-900'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FontAwesomeIcon icon={faHeart} className="w-5 h-5" />
                  Wishlist
                </button>
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                {/* Profile Update Message */}
                {profileMessage && (
                  <div
                    className={`mb-6 p-4 rounded-lg ${
                      profileMessage.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={
                          profileMessage.type === 'success' ? faCheckCircle : faExclamationTriangle
                        }
                        className="w-4 h-4"
                      />
                      {profileMessage.text}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="primary"
                      size="md"
                      fullWidth={false}
                      className="flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>

                {!isEditing ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Full Name</p>
                        <p className="text-lg font-semibold text-gray-900">{userProfile.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Email</p>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-semibold text-gray-900">{userProfile.email}</p>
                          {isEmailVerified ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3 mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              <FontAwesomeIcon
                                icon={faExclamationTriangle}
                                className="w-3 h-3 mr-1"
                              />
                              Unverified
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Phone</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {userProfile.phone || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Account ID</p>
                        <p className="text-lg font-semibold text-gray-900">{userProfile.id}</p>
                      </div>
                    </div>

                    {/* Email Verification Section */}
                    {!isEmailVerified && (
                      <div className="mt-6 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <div className="flex items-start gap-4">
                          <FontAwesomeIcon
                            icon={faExclamationTriangle}
                            className="text-yellow-500 text-xl mt-1"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-yellow-800">Email Not Verified</h3>
                            <p className="text-yellow-700 text-sm mt-1">
                              Please verify your email address to access all features and receive
                              important notifications about your orders.
                            </p>
                            {verificationMessage && (
                              <div
                                className={`mt-3 p-3 rounded-lg text-sm ${
                                  verificationMessage.type === 'success'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {verificationMessage.text}
                              </div>
                            )}
                            <div className="flex gap-3 mt-4">
                              <Button
                                onClick={handleSendVerificationEmail}
                                disabled={isSendingEmail}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                              >
                                {isSendingEmail ? (
                                  <>
                                    <span className="animate-spin">⏳</span>
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />
                                    Send Verification Email
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Verified Success Message */}
                    {isEmailVerified && (
                      <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center gap-4">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="text-green-500 text-2xl"
                          />
                          <div>
                            <h3 className="font-semibold text-green-800">Email Verified</h3>
                            <p className="text-green-700 text-sm">
                              Your email address has been verified. You have full access to all
                              features.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <Input
                      type="text"
                      value={profileData.name}
                      onChange={(e: any) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      label="Full Name"
                      className=""
                    />
                    <Input
                      type="email"
                      value={profileData.email}
                      onChange={(e: any) =>
                        setProfileData({ ...profileData, email: e.target.value })
                      }
                      disabled
                      label="Email"
                      className=""
                    />
                    <Input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e: any) =>
                        setProfileData({ ...profileData, phone: e.target.value })
                      }
                      label="Phone Number"
                      className=""
                    />

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        variant="primary"
                        className="flex-1"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        onClick={() => {
                          setIsEditing(false);
                          setProfileData({
                            name: userProfile.name,
                            email: userProfile.email,
                            phone: userProfile.phone || '',
                          });
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Saved Addresses</h2>
                  {!isAddingAddress && (
                    <Button
                      onClick={() => setIsAddingAddress(true)}
                      variant="primary"
                      size="md"
                      fullWidth={false}
                      className="flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                      Add Address
                    </Button>
                  )}
                </div>

                {isAddingAddress && (
                  <div className="mb-8 p-6 bg-gray-50 rounded-lg border-2 border-gray-300">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Address</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          size="md"
                          type="text"
                          placeholder="Full Name *"
                          value={newAddress.name || ''}
                          onChange={(e: any) =>
                            setNewAddress({ ...newAddress, name: e.target.value })
                          }
                        />
                        <Input
                          size="md"
                          type="tel"
                          placeholder="Mobile Number *"
                          value={newAddress.mobile || ''}
                          onChange={(e: any) =>
                            setNewAddress({ ...newAddress, mobile: e.target.value })
                          }
                        />
                      </div>
                      <Input
                        size="md"
                        type="email"
                        placeholder="Email Address (Optional)"
                        value={newAddress.email || ''}
                        onChange={(e: any) =>
                          setNewAddress({ ...newAddress, email: e.target.value })
                        }
                      />
                      <Input
                        size="md"
                        type="text"
                        placeholder="Street Address *"
                        value={newAddress.street || ''}
                        onChange={(e: any) =>
                          setNewAddress({ ...newAddress, street: e.target.value })
                        }
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          type="text"
                          placeholder="City"
                          value={newAddress.city || ''}
                          onChange={(e: any) =>
                            setNewAddress({ ...newAddress, city: e.target.value })
                          }
                        />
                        <Input
                          type="text"
                          placeholder="State"
                          value={newAddress.state || ''}
                          onChange={(e: any) =>
                            setNewAddress({ ...newAddress, state: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          type="text"
                          placeholder="ZIP Code"
                          value={newAddress.zip || ''}
                          onChange={(e: any) =>
                            setNewAddress({ ...newAddress, zip: e.target.value })
                          }
                        />
                        <Input
                          type="text"
                          placeholder="Country"
                          value={newAddress.country || ''}
                          onChange={(e: any) =>
                            setNewAddress({ ...newAddress, country: e.target.value })
                          }
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={handleAddAddress}
                          disabled={addingAddress}
                          className="flex-1"
                        >
                          {addingAddress ? (
                            <>
                              <FontAwesomeIcon
                                icon={faSpinner}
                                className="w-4 h-4 animate-spin mr-2"
                              />
                              Adding...
                            </>
                          ) : (
                            'Add Address'
                          )}
                        </Button>
                        <Button
                          onClick={() => setIsAddingAddress(false)}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {addressesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="w-8 h-8 animate-spin text-indigo-600"
                    />
                    <span className="ml-3 text-gray-600">Loading addresses...</span>
                  </div>
                ) : addresses && addresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address: Address) => (
                      <div key={address.id} className="p-4 border-2 border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            {address.label && (
                              <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded mb-2 inline-block">
                                {address.label}
                              </span>
                            )}
                            <p className="font-semibold text-gray-900">{address.name || 'No name'}</p>
                            <p className="text-gray-600 text-sm">
                              {address.mobile && <span className="mr-2">📱 {address.mobile}</span>}
                              {address.email && <span>✉️ {address.email}</span>}
                            </p>
                            <p className="text-gray-700 text-sm mt-1">{address.street}</p>
                            <p className="text-gray-600 text-sm">
                              {address.city}, {address.state} {address.zip}
                            </p>
                            <p className="text-gray-600 text-sm">{address.country}</p>
                          </div>
                          {address.isDefault && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2 pt-3 border-t">
                          {!address.isDefault && (
                            <Button
                              onClick={() => handleSetDefaultAddress(address.id)}
                              disabled={settingDefault}
                              variant="ghost"
                              size="sm"
                              fullWidth={false}
                            >
                              <FontAwesomeIcon icon={faStar} className="w-3 h-3 mr-1" />
                              Set as Default
                            </Button>
                          )}
                          <Button
                            onClick={() => handleDeleteAddress(address.id)}
                            disabled={deletingAddress}
                            variant="ghost"
                            size="sm"
                            fullWidth={false}
                            className="ml-auto text-red-600 hover:text-red-700"
                          >
                            <FontAwesomeIcon icon={faTrash} className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">No addresses saved yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="bg-white shadow-xl p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist</h2>
                <div className="text-center py-12">
                  <div className="inline-block p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
                    <FontAwesomeIcon icon={faHeart} className="w-16 h-16 text-gray-700" />
                  </div>
                  <p className="text-gray-700 mb-4 text-lg">
                    View and manage your favorite products
                  </p>
                  <Button
                    onClick={() => router.push('/wishlist')}
                    variant="primary"
                    size="lg"
                    fullWidth={false}
                  >
                    Go to Wishlist →
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
