import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

    const handleAdminLogin = () => {
    localStorage.setItem("isAdmin", "true");
    navigate("/admin/dashboard");
    };

  return (
    <div
      className="flex items-center justify-center h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/wmsu-bg-img.jpg')" }}
    >
      <div className="flex w-[900px] h-[600px] bg-white bg-opacity-95 shadow-2xl rounded-2xl overflow-hidden">
        <div className="w-1/2 bg-maroon flex flex-col justify-center items-center text-white">
          <div className="flex gap-6 mb-4 relative -top-4">
            <img src="/wmsu-logo.jpg" alt="WMSU Logo" className="w-40 h-40 rounded-full object-cover" />
            <img src="/study-squad-logo.png" alt="Study Squad Logo" className="w-40 h-40 rounded-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-white">Crimsons Study Squad</h1>
          <p className="text-lg mt-2 opacity-90">Admin Portal</p>
        </div>

        <div className="w-1/2 flex flex-col justify-center items-center p-10">
          <h2 className="text-3xl font-semibold mb-6 text-maroon">
            Admin Login
          </h2>
          <p className="text-gray-600 mb-6 text-sm">Only authorized administrators can access this portal</p>

          <div className="w-72 flex flex-col gap-3">
            <input
              type="email"
              placeholder="Admin Email"
              className="w-full p-2 rounded bg-gray-200 focus:ring-1 focus:ring-maroon placeholder-gray-500"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full p-2 pr-10 rounded bg-gray-200 focus:ring-1 focus:ring-maroon"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-maroon"
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>

            <button
              onClick={handleAdminLogin}
              className="w-full mt-5 bg-maroon text-white font-medium py-2 rounded hover:brightness-90 transition"
            >
              Log In
            </button>

            <p className="mt-6 text-xs text-gray-500 text-center">
              Restricted Access • Admin Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
