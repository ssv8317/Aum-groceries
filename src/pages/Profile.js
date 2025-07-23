import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';
import { useForm } from 'react-hook-form';
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  MapPinIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, userProfile, updateProfile, fetchUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [editingProfile, setEditingProfile] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors }, reset: resetProfile } = useForm();
  const { register: registerAddress, handleSubmit: handleAddressSubmit, formState: { errors: addressErrors }, reset: resetAddress, setValue: setAddressValue } = useForm();

  useEffect(() => {
    if (userProfile) {
      resetProfile({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        phone: userProfile.phone
      });
    }
    fetchAddresses();
  }, [userProfile, resetProfile]);

  const fetchAddresses = async () => {
    try {
      const response = await authService.getAddresses();
      setAddresses(response.data.addresses || []);
    } catch (error) {
      console.error('Failed to load addresses:', error);
      // If addresses endpoint fails, try to get from user profile
      if (userProfile?.addresses) {
        setAddresses(userProfile.addresses);
      }
    }
  };

  const handleProfileUpdate = async (data) => {
    setIsLoading(true);
    try {
      await updateProfile(data);
      setEditingProfile(false);
      await fetchUserProfile();
    } catch (error) {
      console.error('Profile update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = async (data) => {
    setIsLoading(true);
    try {
      await authService.addAddress({
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country || 'India',
        isDefault: data.isDefault || false
      });
      toast.success('Address added successfully!');
      setShowAddAddress(false);
      resetAddress();
      await fetchAddresses();
      await fetchUserProfile();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAddress = async (data) => {
    if (!editingAddress) return;
    
    setIsLoading(true);
    try {
      await authService.updateAddress(editingAddress._id, {
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country || 'India',
        isDefault: data.isDefault || false
      });
      toast.success('Address updated successfully!');
      setEditingAddress(null);
      resetAddress();
      await fetchAddresses();
      await fetchUserProfile();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    setIsLoading(true);
    try {
      await authService.deleteAddress(addressId);
      toast.success('Address deleted successfully!');
      await fetchAddresses();
      await fetchUserProfile();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete address');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditingAddress = (address) => {
    setEditingAddress(address);
    setAddressValue('street', address.street);
    setAddressValue('city', address.city);
    setAddressValue('state', address.state);
    setAddressValue('zipCode', address.zipCode);
    setAddressValue('country', address.country);
    setAddressValue('isDefault', address.isDefault);
  };

  const cancelEditingAddress = () => {
    setEditingAddress(null);
    resetAddress();
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-8">
            <div className="flex items-center">
              <div className="h-20 w-20 bg-primary-600 rounded-full flex items-center justify-center">
                <UserCircleIcon className="h-12 w-12 text-white" />
              </div>
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {userProfile.firstName} {userProfile.lastName}
                </h1>
                <p className="text-gray-600">{userProfile.email}</p>
                <div className="flex items-center mt-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    userProfile.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
                  </span>
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                    userProfile.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {userProfile.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'addresses'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
              }`}
            >
              Addresses
            </button>
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                {!editingProfile ? (
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="btn-secondary flex items-center"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingProfile(false)}
                      className="btn-secondary flex items-center"
                    >
                      <XMarkIcon className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-6">
              {editingProfile ? (
                <form onSubmit={handleProfileSubmit(handleProfileUpdate)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name</label>
                      <input
                        {...registerProfile('firstName', { required: 'First name is required' })}
                        type="text"
                        className="input-field mt-1"
                      />
                      {profileErrors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{profileErrors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name</label>
                      <input
                        {...registerProfile('lastName', { required: 'Last name is required' })}
                        type="text"
                        className="input-field mt-1"
                      />
                      {profileErrors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{profileErrors.lastName.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      {...registerProfile('phone', { 
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[0-9]{10,15}$/,
                          message: 'Invalid phone number'
                        }
                      })}
                      type="tel"
                      className="input-field mt-1"
                    />
                    {profileErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{profileErrors.phone.message}</p>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary flex items-center"
                    >
                      <CheckIcon className="h-4 w-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">First Name</label>
                      <p className="mt-1 text-sm text-gray-900">{userProfile.firstName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Last Name</label>
                      <p className="mt-1 text-sm text-gray-900">{userProfile.lastName}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Email</label>
                      <div className="mt-1 flex items-center">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="text-sm text-gray-900">{userProfile.email}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Phone</label>
                      <div className="mt-1 flex items-center">
                        <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="text-sm text-gray-900">{userProfile.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Member Since</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(userProfile.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(userProfile.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            {/* Add Address Button */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Delivery Addresses</h2>
                <button
                  onClick={() => setShowAddAddress(true)}
                  className="btn-primary flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add New Address
                </button>
              </div>
            </div>

            {/* Add Address Form */}
            {showAddAddress && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Address</h3>
                <form onSubmit={handleAddressSubmit(handleAddAddress)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Street Address</label>
                    <input
                      {...registerAddress('street', { required: 'Street address is required' })}
                      type="text"
                      className="input-field mt-1"
                      placeholder="Enter street address"
                    />
                    {addressErrors.street && (
                      <p className="mt-1 text-sm text-red-600">{addressErrors.street.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <input
                        {...registerAddress('city', { required: 'City is required' })}
                        type="text"
                        className="input-field mt-1"
                        placeholder="City"
                      />
                      {addressErrors.city && (
                        <p className="mt-1 text-sm text-red-600">{addressErrors.city.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">State</label>
                      <input
                        {...registerAddress('state', { required: 'State is required' })}
                        type="text"
                        className="input-field mt-1"
                        placeholder="State"
                      />
                      {addressErrors.state && (
                        <p className="mt-1 text-sm text-red-600">{addressErrors.state.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                      <input
                        {...registerAddress('zipCode', { required: 'Zip code is required' })}
                        type="text"
                        className="input-field mt-1"
                        placeholder="Zip Code"
                      />
                      {addressErrors.zipCode && (
                        <p className="mt-1 text-sm text-red-600">{addressErrors.zipCode.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <input
                      {...registerAddress('country')}
                      type="text"
                      className="input-field mt-1"
                      placeholder="Country"
                      defaultValue="India"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      {...registerAddress('isDefault')}
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Set as default address
                    </label>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary"
                    >
                      {isLoading ? 'Adding...' : 'Add Address'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Address List */}
            <div className="space-y-4">
              {addresses.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-6 text-center">
                  <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No addresses found. Add your first address above.</p>
                </div>
              ) : (
                addresses.map((address) => (
                  <div key={address._id} className="bg-white shadow rounded-lg p-6">
                    {editingAddress?._id === address._id ? (
                      // Edit form
                      <form onSubmit={handleAddressSubmit(handleUpdateAddress)} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Street Address</label>
                          <input
                            {...registerAddress('street', { required: 'Street address is required' })}
                            type="text"
                            className="input-field mt-1"
                          />
                          {addressErrors.street && (
                            <p className="mt-1 text-sm text-red-600">{addressErrors.street.message}</p>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">City</label>
                            <input
                              {...registerAddress('city', { required: 'City is required' })}
                              type="text"
                              className="input-field mt-1"
                            />
                            {addressErrors.city && (
                              <p className="mt-1 text-sm text-red-600">{addressErrors.city.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">State</label>
                            <input
                              {...registerAddress('state', { required: 'State is required' })}
                              type="text"
                              className="input-field mt-1"
                            />
                            {addressErrors.state && (
                              <p className="mt-1 text-sm text-red-600">{addressErrors.state.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                            <input
                              {...registerAddress('zipCode', { required: 'Zip code is required' })}
                              type="text"
                              className="input-field mt-1"
                            />
                            {addressErrors.zipCode && (
                              <p className="mt-1 text-sm text-red-600">{addressErrors.zipCode.message}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Country</label>
                          <input
                            {...registerAddress('country')}
                            type="text"
                            className="input-field mt-1"
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            {...registerAddress('isDefault')}
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 block text-sm text-gray-900">
                            Set as default address
                          </label>
                        </div>
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={cancelEditingAddress}
                            className="btn-secondary"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary"
                          >
                            {isLoading ? 'Updating...' : 'Update Address'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      // Display address
                      <div>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                              {address.isDefault && (
                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full mr-2">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-gray-900 font-medium">{address.street}</p>
                            <p className="text-gray-600">
                              {address.city}, {address.state} {address.zipCode}
                            </p>
                            <p className="text-gray-600">{address.country}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => startEditingAddress(address)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
