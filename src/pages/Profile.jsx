import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { updateProfile, changePassword } from "../api/users";
import { getMe } from "../api/auth";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user, token, updateUser } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    contactDetails: user?.contactDetails || "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const hasFetchedFreshUserRef = useRef(false);

  useEffect(() => {
    if (!user || hasFetchedFreshUserRef.current) return;
    if ("contactDetails" in user && "email" in user) return;

    hasFetchedFreshUserRef.current = true;
    let cancelled = false;

    getMe(token)
      .then((data) => {
        if (cancelled) return;
        const freshUser = data?.user ?? data;
        updateUser(freshUser);
        setProfileForm({
          name: freshUser.name || "",
          contactDetails: freshUser.contactDetails || "",
        });
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Failed to fetch /auth/me:", err);
          toast.error("Failed to load your full profile details.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user, token, updateUser]);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  function handleProfileChange(e) {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  }

  function handlePasswordChange(e) {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await updateProfile(profileForm);
      updateUser(updated);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      const message = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success(message || "Password changed");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-background px-6 py-12">
      <div className="mx-auto max-w-lg lg:max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-8 shadow-lg shadow-primary/10 border border-secondary/30">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Profile
            </h2>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full rounded-lg border border-secondary/50 bg-gray-50 px-3 py-2 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Name
                </label>
                <input
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  required
                  className="w-full rounded-lg border border-secondary/50 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Phone Number
                </label>
                <input
                  name="contactDetails"
                  value={profileForm.contactDetails}
                  onChange={handleProfileChange}
                  className="w-full rounded-lg border border-secondary/50 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white hover:bg-secondary transition-colors disabled:opacity-60 cursor-pointer"
              >
                {savingProfile ? "Saving…" : "Save Changes"}
              </button>
            </form>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-lg shadow-primary/10 border border-secondary/30">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Change Password
            </h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Current Password
                </label>
                <input
                  name="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full rounded-lg border border-secondary/50 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  New Password
                </label>
                <input
                  name="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full rounded-lg border border-secondary/50 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Confirm New Password
                </label>
                <input
                  name="confirmNewPassword"
                  type="password"
                  value={passwordForm.confirmNewPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full rounded-lg border border-secondary/50 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white hover:bg-secondary transition-colors disabled:opacity-60 cursor-pointer"
              >
                {changingPassword ? "Changing…" : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
