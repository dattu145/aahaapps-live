import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Profile = () => {
    const { user, login } = useAuth();
    const [activeTab, setActiveTab] = useState('update_profile'); // update_profile | add_user

    // Forms
    const [profileData, setProfileData] = useState({ username: user?.username || '', email: user?.email || '', password: '' });
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '' });

    // Verification State
    const [isVerified, setIsVerified] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [enteredOtp, setEnteredOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Refs
    const formRef = useRef();

    const sendVerificationEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const userId = user?.id || user?.username; // Fallback
            if (!userId) {
                setMessage('Error: User not identified.');
                setLoading(false);
                return;
            }

            const actionText = activeTab === 'update_profile' ? 'Update Profile' : 'Add New User';
            await api.post('/users/send-otp', { action: actionText });

            setVerificationSent(true);
            setMessage('OTP sent to your email.');
        } catch (error) {
            console.error(error);
            setMessage(error.response?.data?.message || 'Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        try {
            const { data } = await api.post('/users/verify-otp', { otp: enteredOtp });
            if (data.success) {
                setIsVerified(true);
                setMessage('Verified! usage authorized.');
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'Invalid OTP.');
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/users/profile', profileData);
            setMessage('Profile updated successfully!');
            // Re-login to update context if needed, or simple alert
        } catch (error) {
            setMessage(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
            resetVerification();
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/users/register', newUser);
            setMessage('New User Added Successfully!');
            setNewUser({ username: '', email: '', password: '' });
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to add user');
        } finally {
            setLoading(false);
            resetVerification();
        }
    };

    const resetVerification = () => {
        setIsVerified(false);
        setVerificationSent(false);
        setOtp('');
        setEnteredOtp('');
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Admin Profile & Security</h2>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
                <button
                    onClick={() => { setActiveTab('update_profile'); resetVerification(); setMessage(''); }}
                    className={`pb-2 px-4 font-medium transition ${activeTab === 'update_profile' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
                >
                    Update Profile
                </button>
                <button
                    onClick={() => { setActiveTab('add_user'); resetVerification(); setMessage(''); }}
                    className={`pb-2 px-4 font-medium transition ${activeTab === 'add_user' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
                >
                    Add New User
                </button>
            </div>

            {/* Content */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">

                {!isVerified ? (
                    <div className="text-center py-8">
                        <h3 className="text-lg font-bold mb-2">Verification Required</h3>
                        <p className="text-gray-500 mb-6 text-sm">To {activeTab === 'update_profile' ? 'update your profile' : 'add a new user'}, you must verify authorization via email OTP.</p>

                        {!verificationSent ? (
                            <button
                                onClick={sendVerificationEmail}
                                disabled={loading}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Send Verification OTP'}
                            </button>
                        ) : (
                            <div className="max-w-xs mx-auto">
                                <label className="block text-xs font-bold text-gray-400 mb-1 text-left">Enter OTP</label>
                                <div className="flex gap-2">
                                    <input
                                        value={enteredOtp}
                                        onChange={(e) => setEnteredOtp(e.target.value)}
                                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-center tracking-widest font-mono"
                                        placeholder="000000"
                                    />
                                    <button
                                        onClick={verifyOtp}
                                        className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700"
                                    >
                                        Verify
                                    </button>
                                </div>
                                <button onClick={() => setVerificationSent(false)} className="text-xs text-blue-500 underline mt-4">Resend</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {activeTab === 'update_profile' && (
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">Username</label>
                                    <input value={profileData.username} onChange={e => setProfileData({ ...profileData, username: e.target.value })} className="w-full border p-2 rounded" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">Email</label>
                                    <input value={profileData.email} onChange={e => setProfileData({ ...profileData, email: e.target.value })} className="w-full border p-2 rounded" type="email" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">New Password (leave blank to keep current)</label>
                                    <input value={profileData.password} onChange={e => setProfileData({ ...profileData, password: e.target.value })} className="w-full border p-2 rounded" type="password" placeholder="Min 6 characters" />
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-black text-white py-3 rounded-lg font-bold">
                                    {loading ? 'Updating...' : 'Save Changes'}
                                </button>
                            </form>
                        )}

                        {activeTab === 'add_user' && (
                            <form onSubmit={handleAddUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">New Username</label>
                                    <input value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} className="w-full border p-2 rounded" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">New User Email</label>
                                    <input value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="w-full border p-2 rounded" type="email" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">Password</label>
                                    <input value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="w-full border p-2 rounded" type="password" required placeholder="Min 6 characters" />
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-black text-white py-3 rounded-lg font-bold">
                                    {loading ? 'Adding User...' : 'Add User'}
                                </button>
                            </form>
                        )}
                    </>
                )}

                {message && (
                    <div className={`mt-4 p-3 rounded text-sm text-center ${message.includes('Success') || message.includes('Verified') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
