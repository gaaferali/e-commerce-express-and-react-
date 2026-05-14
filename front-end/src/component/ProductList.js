import react from "react";
import{ useState, useEffect } from "react";
import { Link } from "react-router-dom";
const ProductList =()=>{
    const [products, setProducts] = useState([]);
        useEffect(() => { 
            getProducts();
        }, []);

        const getProducts = async () => {
            let result = await fetch("http://localhost:5000/products");
            result = await result.json();
            setProducts(result);
        };
    
       /* console.warn(products);*/

        const deleteProduct = async (id) => {
            let result = await fetch(`http://localhost:5000/product/${id}`, {
                method: "Delete",
            });
            result = await result.json();
            getProducts();
        };

        const searchHandel = async (event) => {
            let key = event.target.value;
            if (key) {
                let result = await fetch(`http://localhost:5000/search/${key}`);
                result = await result.json();
                if (result) {
                    setProducts(result);
                }
            } else {
                getProducts();
            }
        };


    return <div className="product-List">
        <h1>Product List</h1>
        <input className="search-product-box" 
        type="text" placeholder="Search Product" onChange={searchHandel} />
        <ul>
            <li>S. .NO</li>
            <li>Name</li>
            <li>Price</li>
            <li>Category</li>
            <li>Operation</li>
            
        </ul>
                {
              products.length > 0 ? products.map((item, index) => 
                    <ul key={item._id}>
                        <li>{index+1}</li>
                        <li>{item.name}</li>
                        <li>{item.price}</li>
                        <li>{item.category}</li>
                        <li><button type="button" 
                        onClick={() => deleteProduct(item._id)}>Delete</button>
                        <Link to={"/update/" + item._id}>Update</Link>
                        </li>
                    </ul>
                )
                : <h1>No result found</h1>
            }
                </div>;

}
export default ProductList;