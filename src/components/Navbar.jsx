import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/reloop-logo.png";

const HIDDEN_ON = ["/login", "/register"];

function navLinkClass({ isActive }) {
  return isActive
    ? "text-primary font-semibold transition-colors"
    : "text-gray-700 hover:text-primary transition-colors";
}

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (HIDDEN_ON.includes(location.pathname)) {
    return null;
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="bg-white/70 backdrop-blur border-b border-secondary/40 shadow-sm">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Reloop" className="h-10 w-auto" />
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium">
          {user ? (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/listings" className={navLinkClass}>
                Listings
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                Profile
              </NavLink>
              {user.role === "admin" && (
                <NavLink to="/admin" className={navLinkClass}>
                  Admin
                </NavLink>
              )}
              <button
                onClick={handleLogout}
                className="rounded-lg bg-primary px-4 py-2 text-white font-semibold hover:bg-secondary transition-colors cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
              <Link
                to="/register"
                className="rounded-lg bg-primary px-4 py-2 text-white font-semibold hover:bg-secondary transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
