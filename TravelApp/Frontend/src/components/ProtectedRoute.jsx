import { Navigate } from "react-router-dom"
import { useAuth } from "./authProvider"

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { token, role } = useAuth()

  if (!token) {
    return <Navigate to="/login" />
  }

  if (!allowedRoles.includes(role)) {
    return <h3>Access Denied</h3>
  }

  return children
}

export default ProtectedRoute