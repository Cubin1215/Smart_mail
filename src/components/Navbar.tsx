import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { User, AuthService } from "../services/auth";

interface NavbarProps {
  user: User | null;
  onSignOut: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onSignOut }) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const toggleNavbar = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
      onSignOut();
      navigate("/");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 py-3 bg-transparent backdrop-blur-sm border-b border-white/10">
      <div className="container px-4 mx-auto relative lg:text-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center flex-shrink-0 pt-2">
            <Link to="/" className="flex items-center">
              <img className="h-8 w-8 mr-2" src={logo} alt="Logo" />
              <span className="text-xl tracking-tight text-white -mt-3">
                Replied.com
              </span>
            </Link>
          </div>
          <ul className="hidden lg:flex ml-14 space-x-12">
            <li>
              <Link
                to="/features"
                className="text-white/80 hover:text-white transition-colors duration-200">
                Features
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="text-white/80 hover:text-white transition-colors duration-200">
                About
              </Link>
            </li>
          </ul>
          <div className="hidden lg:flex justify-center space-x-12 items-center">
            {user ? (
              <>
                <span className="text-white/80">
                  {user.user_metadata?.name || "User"}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-white/80 hover:text-white py-2 px-3 border border-white/20 rounded-md hover:border-white/40 transition-colors duration-200">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="text-white/80 hover:text-white py-2 px-3 border border-white/20 rounded-md hover:border-white/40 transition-colors duration-200">
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-blue-500 to-pink-500 py-2 px-3 rounded-md text-white hover:opacity-90 transition-opacity duration-200">
                  Create an account
                </Link>
              </>
            )}
          </div>
          <div className="lg:hidden md:flex flex-col justify-end">
            <button
              onClick={toggleNavbar}
              className="text-white/80 hover:text-white transition-colors duration-200">
              {mobileDrawerOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {mobileDrawerOpen && (
          <div className="fixed right-0 z-20 bg-black/95 backdrop-blur-sm w-full p-12 flex flex-col justify-center items-center lg:hidden">
            <ul className="space-y-8">
              <li>
                <Link
                  to="/features"
                  className="text-white/80 hover:text-white transition-colors duration-200 text-xl">
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-white/80 hover:text-white transition-colors duration-200 text-xl">
                  About
                </Link>
              </li>
              {user ? (
                <>
                  <li>
                    <span className="text-white/80 text-xl">
                      {user.user_metadata?.name || "User"}
                    </span>
                  </li>
                  <li>
                    <button
                      onClick={handleSignOut}
                      className="text-white/80 hover:text-white py-2 px-3 border border-white/20 rounded-md hover:border-white/40 transition-colors duration-200 text-xl">
                      Sign Out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      to="/signin"
                      className="text-white/80 hover:text-white py-2 px-3 border border-white/20 rounded-md hover:border-white/40 transition-colors duration-200 text-xl">
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/signup"
                      className="bg-gradient-to-r from-blue-500 to-pink-500 py-2 px-3 rounded-md text-white hover:opacity-90 transition-opacity duration-200 text-xl">
                      Create an account
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
