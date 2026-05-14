import react from "react";
import { Link, useNavigate }
    from "react-router-dom";
import SignUp from "./signUp";
const Nav = () => {
    const auth = localStorage.getItem("user");
    const navigate = useNavigate();
    const logout = () => {
        localStorage.clear();
        navigate('/signUp');
    }
    return (
        <div >
<img className="logo" src="https://img.freepik.com/free-psd/3d-shopping-cart-icon-blue-circle-background-online-retail-symbol_84443-55705.jpg?semt=ais_hybrid&w=740&q=80"
 alt="logo" />
            {
                auth ?
                    <ul className="nav-ul">
                        <li><Link to="/">prodects</Link></li>
                        <li><Link to="/add">Add prodect</Link></li>
                        <li><Link to="/update">Update prodect</Link></li>
                        <li><Link to="/profile">Profile</Link></li>
                        <li><Link onClick={logout} to="/signUp">Logout
                         ({JSON.parse(auth).name})</Link></li>
                    </ul>
                    :
                    <ul className="nav-ul nav-right">
                        <li><Link to="/signUp">sign Up</Link></li>
                        <li><Link to="/login">Login</Link></li>
                    </ul>
            }
        </div>
    )
}
export default Nav;