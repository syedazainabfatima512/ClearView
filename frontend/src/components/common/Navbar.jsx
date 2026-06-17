import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import BrandLogo from './BrandLogo'
import './Navbar.css'

function Navbar() {
    const { user, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const isActive = (path) => location.pathname === path

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <Link to="/dashboard" className="navbar-logo" aria-label="ClearView home">
                    <BrandLogo compact subtitle="Interview practice" />
                </Link>

                <div className="navbar-links">
                    <Link
                        to="/dashboard"
                        className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
                    >
                        Workspace
                    </Link>
                    <Link
                        to="/upload-resume"
                        className={`navbar-link ${isActive('/upload-resume') ? 'active' : ''}`}
                    >
                        New Session
                    </Link>
                </div>

                <div className="navbar-user">
                    <div className="navbar-user-copy">
                        <span className="navbar-user-label">Signed in</span>
                        <span className="navbar-username">{user?.fullName || 'User'}</span>
                    </div>
                    <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                        Sign out
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
