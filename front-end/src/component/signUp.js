import react,{ useState ,useEffect} from "react";
import { useNavigate } from "react-router-dom";

const SignUp=()=>{
    const [name,setName]= useState("");
    const [email,setEmail]= useState("");
    const [password,setPassword]= useState("");
    const navigate = useNavigate();
    useEffect( ()=>{
        const auth = localStorage.getItem("user");
        if(auth){
            navigate('/')
        }
    },[])
    const cloectionData=async ()=>{
     console.warn( name, email, password);
     let result = await fetch('http://localhost:5000/register',{
        method:'post',
        body:JSON.stringify({name,email,password}),
        headers:{
            'Content-Type':'application/json'
        }
        });
        result= await result.json();
        console.warn(result);
        localStorage.setItem("user",JSON.stringify(result));
        navigate('/add');
}
    return (
        <div>
            <h1>Registration</h1>
            <input className ="inputBox" type="text" placeholder= "Enter Name" 
            value={name} onChange={(e)=>setName(e.target.value)}/>
            <input className ="inputBox" type="text" placeholder= "Enter email" 
            value={email} onChange={(e)=>setEmail(e.target.value)}/>
            <input className ="inputBox" type="password" placeholder= "Enter password" 
            value={password} onChange={(e)=>setPassword(e.target.value)}/>
            <button onClick={cloectionData} className="appButton" type="button">Sign Up</button>
        </div>
    )
}
export default SignUp