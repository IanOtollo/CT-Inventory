"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Users, Monitor, FileText, LogOut, KeyRound, Settings, X, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");

  const updateAdminCredentials = useMutation(api.auth.updateAdminCredentials);

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSettingsError("");
    setSettingsSuccess("");

    const accountId = localStorage.getItem("ct_inventory_account_id");
    if (!accountId) {
      setSettingsError("Session expired. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    try {
      await updateAdminCredentials({
        accountId: accountId as any,
        currentPassword,
        newEmail: newEmail || undefined,
        newPassword: newPassword || undefined,
      });
      setSettingsSuccess("Admin credentials updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => {
        setIsSettingsOpen(false);
        setSettingsSuccess("");
      }, 2000);
    } catch (error: any) {
      setSettingsError(error.message.replace("Uncaught Error: ", ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // If scrolling down, hide navbar. If scrolling up, show it.
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const navLinks = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Depts", href: "/admin/departments", icon: Users },
    { name: "Equipment", href: "/admin/equipment", icon: Monitor },
    { name: "Accounts", href: "/admin/accounts", icon: KeyRound },
    { name: "Log", href: "/admin/audit-log", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 shadow-sm sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-auto">
            <img src="/logo.png" alt="Busia County Emblem" className="object-contain h-full w-auto" />
          </div>
          <div>
            <h1 className="text-lg font-heading font-bold text-[var(--color-busia-black)] leading-tight">Busia County</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Inventory Management System</p>
          </div>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center text-gray-500 hover:text-[var(--color-busia-green)] transition-colors" 
            title="Settings"
          >
            <Settings size={20} />
          </button>
          <Link href="/login" className="flex items-center text-gray-500 hover:text-red-600 transition-colors" title="Sign Out">
            <span className="text-sm font-medium mr-2 hidden sm:inline">Sign Out</span>
            <LogOut size={20} />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-8 pb-28">
        {children}
      </main>

      {/* Floating Bottom Bar */}
      <div 
        className={`fixed bottom-12 left-0 right-0 flex justify-center z-50 px-4 transition-transform duration-300 ease-in-out ${
          isVisible ? "translate-y-0" : "translate-y-32"
        }`}
      >
        <nav className="bg-[var(--color-busia-black)] text-white shadow-xl rounded-full px-2 sm:px-4 py-1.5 flex items-center space-x-0 sm:space-x-4 w-full max-w-xl justify-between border border-gray-800">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex flex-col items-center justify-center py-1.5 px-2 sm:px-6 rounded-full transition-all duration-200 flex-1 sm:flex-none ${
                  isActive 
                    ? "bg-[var(--color-busia-green)] text-white shadow-inner" 
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-[18px] sm:h-[18px] ${isActive ? "text-white" : "mb-0.5"}`} />
                <span className={`text-[9px] sm:text-[10px] font-medium mt-0.5 truncate max-w-full ${isActive ? "font-bold" : ""}`}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <footer className="py-4 text-center text-xs text-gray-400 mt-auto relative z-40">
        &copy; 2026 The County Government of Busia. All Rights Reserved.
      </footer>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={() => setIsSettingsOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full border-t-4 border-t-[var(--color-busia-green)]">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg leading-6 font-medium text-[var(--color-busia-black)] font-heading" id="modal-title">
                    Admin Account Settings
                  </h3>
                  <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-gray-500">
                    <X size={20} />
                  </button>
                </div>
                
                {settingsError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
                    {settingsError}
                  </div>
                )}
                {settingsSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded-md">
                    {settingsSuccess}
                  </div>
                )}

                <form onSubmit={handleSettingsSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Update Admin Email (Optional)</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-busia-green)] focus:border-[var(--color-busia-green)] sm:text-sm"
                      placeholder="Leave blank to keep current"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Update Password (Optional)</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-busia-green)] focus:border-[var(--color-busia-green)] sm:text-sm"
                      placeholder="Leave blank to keep current"
                    />
                  </div>
                  <hr className="my-4 border-gray-200" />
                  <div>
                    <label className="block text-sm font-medium text-gray-900">Current Password (Required)</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[var(--color-busia-green)] focus:border-[var(--color-busia-green)] sm:text-sm"
                      placeholder="Verify your current password"
                    />
                  </div>
                  <div className="pt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsSettingsOpen(false)}
                      className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !currentPassword}
                      className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--color-busia-green)] hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-busia-green)] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center min-w-[100px]"
                    >
                      {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
