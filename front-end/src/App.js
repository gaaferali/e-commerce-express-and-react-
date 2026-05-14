import './App.css';
import Nav from './component/nav';
import Footer from './component/footer';
import SignUp from './component/signUp';
import PrivateComponent from './component/PrivateComponent';
import Login from './component/Login';
import AddProduct from './component/AddProduct';
import ProductList from './component/ProductList';
import UpdateComponent from './component/UpdateComponent';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
function App() {
  return (
    <div className="App">
          <BrowserRouter>
          <Nav />
          <Routes>
          <Route element={<PrivateComponent/>}>
          <Route path="/" element={<ProductList />} />
          <Route path="/add" element={<AddProduct />} />
          <Route path="/update/:id" element={<UpdateComponent />} />
          <Route path="/logout" element={<h1>Logout</h1>} />
          <Route path="/profile" element={<h1>profile</h1>} />
          </Route>
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          </Routes>
          </BrowserRouter> 
          <Footer />

    </div>
  );
}

export default App;
