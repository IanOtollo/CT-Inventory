"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"portal" | "admin">("portal");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const loginDepartment = useMutation(api.auth.loginDepartment);
  const loginAdmin = useMutation(api.auth.loginAdmin);

  const handlePortalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res: any = await loginDepartment({ email, password });
      
      if (!res.success) {
        setErrorMsg(res.error || "Invalid credentials");
        setIsLoading(false);
        return;
      }
      
      // Store credentials in localStorage for a simple auth state check on client
      localStorage.setItem("ct_inventory_token", res.token);
      localStorage.setItem("ct_inventory_role", res.role);
      localStorage.setItem("ct_inventory_dept", res.departmentId);
      localStorage.setItem("ct_inventory_account_id", res.accountId);
      
      router.push("/portal");
    } catch (error: any) {
      console.error("Unexpected login error:", error);
      setErrorMsg("An unexpected error occurred during login.");
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res: any = await loginAdmin({ email: adminEmail, password: adminPassword });
      
      if (!res.success) {
        setErrorMsg(res.error || "Invalid admin credentials");
        setIsLoading(false);
        return;
      }
      
      localStorage.setItem("ct_inventory_token", res.token);
      localStorage.setItem("ct_inventory_role", res.role);
      localStorage.setItem("ct_inventory_account_id", res.accountId);
      
      router.push("/admin/dashboard");
    } catch (error: any) {
      console.error("Unexpected admin login error:", error);
      setErrorMsg("An unexpected error occurred during admin login.");
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 w-full">
        <div className="w-full max-w-md text-center">
          <div className="inline-block h-16 w-auto mb-2">
            <img src="/logo.png" alt="Busia County Emblem" className="object-contain h-full w-auto" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--color-busia-black)] font-heading">
            Busia County
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Departmental Inventory Management System
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-t-4 border-[var(--color-busia-green)]">
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("portal")}
              className={`flex-1 py-2 text-center text-sm font-medium ${
                activeTab === "portal"
                  ? "border-b-2 border-[var(--color-busia-blue)] text-[var(--color-busia-blue)]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Department Login
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex-1 py-2 text-center text-sm font-medium ${
                activeTab === "admin"
                  ? "border-b-2 border-[var(--color-busia-blue)] text-[var(--color-busia-blue)]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Admin Login
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md text-center">
              {errorMsg}
            </div>
          )}

          {activeTab === "portal" ? (
            <form className="space-y-6" onSubmit={handlePortalLogin}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-busia-blue)] focus:border-[var(--color-busia-blue)] sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-busia-blue)] focus:border-[var(--color-busia-blue)] sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-busia-blue)] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-busia-blue)] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Sign in to Portal"}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleAdminLogin}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Admin Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-busia-green)] focus:border-[var(--color-busia-green)] sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-busia-green)] focus:border-[var(--color-busia-green)] sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-busia-green)] hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-busia-green)] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Access Admin Shell"}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>

      <footer className="mt-auto py-6 text-center text-xs text-gray-500">
        &copy; 2026 The County Government of Busia. All Rights Reserved.
      </footer>
    </div>
  );
}
