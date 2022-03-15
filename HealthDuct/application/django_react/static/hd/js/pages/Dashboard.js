import React, { useState } from "react";
import { Route, Redirect, BrowserRouter as Router, Switch, Link, useLocation } from "react-router-dom";
import { Container } from "@mui/material";
import { CssBaseline, Button } from "@mui/material";
import { ThemeProvider, createTheme, styled } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import {TransitionGroup, CSSTransition} from "react-transition-group";

import WelcomePage from "./WelcomePage";
import LoginPage from "./Login";
import SignUpPage from "./SignUp";

import HeadBar from "../components/HeadBar";
import navs from "../utils/navlinks";
import "../utils/transitions.css"

const useStyles = makeStyles(theme => ({
    root: {
        background: "linear-gradient(157deg, rgba(28,18,181,1) 0%, rgba(79,70,227,1) 37%, rgba(211,0,255,1) 100%)",
        display: "flex"
    },
    content: {
        flexGrow: 1,
        height: "100vh",
        overflow: "auto",
        position: "sticky"
    },
    toolbar: {
        paddingRight: 24,
        background: "transparent"
    },
}))


const WelcomeWrapper  = (url_id) => {
    return url_id ? () => <Redirect to={urls.navlink.to.provider(url_id)}/> : WelcomePage
}

const LoginInWrapped = (username, setUsername) => () => (
 <LoginPage username={username} onUsernameChange={setUsername}/>
)

const SignUpWrapped = (setUserData, userData) => () => (
    <SignUpPage setUserData={setUserData} userData={userData}/>
   )

const HdRoutes = ({username, setUsername, setUserData, userData}) => {
    let location = useLocation();
    return (
        <TransitionGroup>
            <CSSTransition
                key={location.pathname}
                classNames="fade"
                timeout={300}
                unmountOnExit
            >
                <Switch location={location}>
                    <Route exact path="/" component={WelcomeWrapper(userData.url_id)}/>
                    <Route path={navs.navlink.to.login()} component={LoginInWrapped(username, setUsername, setUserData)}/>
                    <Route path={navs.navlink.to.signup()} component={SignUpWrapped(setUserData, userData)}/>
                </Switch>
            </CSSTransition>
         </TransitionGroup>
    )
}

export default function Dashboard() {
    const [username, setUsername] = useState("")
    const [name, setName] = useState(null)
    const [theme, setTheme] = useState(createTheme({
        components: {
            MuiCssBaseline: {
                styleOverrides:{
                    "@global": {
                        body: {
                            transition: "background-color 0.5s linear, color 0.5s linear",
                            background: 'linear-gradient(157deg, rgba(28,18,181,1) 0%, rgba(79,70,227,1) 37%, rgba(211,0,255,1) 100%)',
                            // background: "rgba(79,70,227,1)",
                            backgroundRepeat: "no-repeat",
                            backgroundAttachment: "fixed",
                        }
                    },
                    '.MuiDrawer-paper': {
                        backgroundColor: 'rgba(0,0,0,0.4)', 
                        borderRight: '5px solid white',
                    },
                    
                }
            },
            MuiButton: {
                outlinedPrimary: {
                    color: '#fafafa',
                    border: "1px solid white"
                },
                outlinedSecondary: {
    
                }
            },
            MuiInputAdornment: {
                root: {
                    color: "white"
                },
                filled: {
                    color: "white"
                }
            },
            MuiOutlinedInput: {
                notchedOutline: {
                    borderColor: "white !important"
                }
            },
            MuiDrawer: { 
                paper: {
                    backgroundColor: 'rgba(0,0,0,0.4)', 
                    borderRight: '5px solid white',
                } 
            },
    
        },
        palette: {
            text: {
                primary: "#ffffff",
                secondary: "#00000",
                contrastText: '#ffffff'
            }, 
            primary: {
                main: "#ffffff",
                contrastText: '#ffffff'
            },
            secondary: {
                light: '#0066ff',
                main: '#0044ff',
                // dark: will be calculated from palette.secondary.main,
                contrastText: '#ffcc00',
            },
        }
    }))
    const [userData, setUserData] = useState({})
    
    const classes = useStyles(theme)
    const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

    return(
        <ThemeProvider theme={theme}>
            <div className={classes.root}>
                <CssBaseline />
                <Router>
                    <HeadBar userData={userData} setData={setUserData}/>
                    <main className={classes.content}>
                        <Offset/>
                        <Container>
                            <HdRoutes username={username} setUsername={setUsername} setUserData={setUserData} userData={userData}/>
                        </Container>
                    </main>
                </Router>
            </div>
        </ThemeProvider>
    )
}