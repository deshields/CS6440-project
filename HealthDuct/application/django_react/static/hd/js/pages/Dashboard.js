import React, { useState } from "react";
import { Route, Redirect, BrowserRouter as Router, Switch, Link } from "react-router-dom";
import { createTheme, ThemeProvider, Container } from "@mui/material";
import { CssBaseline, Button } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles'
import Fade from '@mui/material/Fade';

import WelcomePage from "./WelcomePage";
import LoginPage from "./Login";
import navs from "../utils/navlinks";

// background: rgb(42,32,215);
// background: linear-gradient(137deg, rgba(42,32,215,1) 0%, rgba(13,13,144,1) 35%, rgba(211,0,255,1) 100%);

// const useStyles = makeStyles(theme => (
//     {
        
//     }
// ))
const WelcomeWrapper  = (url_id) => {
    return url_id ? () => <Redirect to={urls.navlink.to.provider(url_id)}/> : WelcomePage
}

const LoginInWrapped = (username, setUsername) => () => (
 <LoginPage username={username} onUsernameChange={setUsername}/>
)

const HdRoutes = ({username, setUsername, setUserData}) => {
    
       return (
            
            <Switch>
                <Route exact path="/" component={WelcomeWrapper(username)}/>
                <Route path={navs.navlink.to.login()} component={LoginInWrapped(username, setUsername, setUserData)}/>
            </Switch>
        )
 
}



export default function Dashboard() {
    const [username, setUsername] = useState("")
    const [theme, setTheme] = useState()
    const [userData, setUserData] = useState("null")

    return(
        <div>
            {/* Appbar here */}
            <CssBaseline />
            <Router>
                <main>
                    <Container>
                        {/* <Fade> */}
                        <HdRoutes username={username} setUsername={setUsername} setUserData={setUserData}/>
                        {/* </Fade> */}
                    </Container>
                </main>
            </Router>
        </div>
    )
}
// export default function Dashboard() {
//     return (
//       <Router>
//         <div>
//           <ul>
//             <li>
//               <Link to="/">Home</Link>
//             </li>
//             <li>
//               <Link to="/about">About</Link>
//             </li>
//             <li>
//               <Link to="/dashboard">Dashboard</Link>
//             </li>
//           </ul>
  
//           <hr />
  
//           {/*
//             A <Switch> looks through all its children <Route>
//             elements and renders the first one whose path
//             matches the current URL. Use a <Switch> any time
//             you have multiple routes, but you want only one
//             of them to render at a time
//           */}
//           <Switch>
//             <Route exact path="/">
//               <Home />
//             </Route>
//             <Route path="/about">
//               <About />
//             </Route>
//             <Route path="/dashboard">
//               <Rashboard />
//             </Route>
//           </Switch>
//         </div>
//       </Router>
//     );
//   }
  
//   // You can think of these components as "pages"
//   // in your app.
  
//   function Home() {
//     return (
//       <div>
//         <h2>Home</h2>
//       </div>
//     );
//   }
  
//   function About() {
//     return (
//       <div>
//         <h2>About</h2>
//       </div>
//     );
//   }
  
//   function Rashboard() {
//     return (
//       <div>
//         <h2>Dashboard</h2>
//       </div>
//     );
//   }
  