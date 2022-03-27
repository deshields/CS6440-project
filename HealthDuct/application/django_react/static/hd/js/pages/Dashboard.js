import React, { useState } from "react";
import { Route, Redirect, BrowserRouter as Router, Switch, Link, useLocation } from "react-router-dom";
import queryString from "query-string"
import { Container } from "@mui/material";
import { CssBaseline, Button } from "@mui/material";
import { ThemeProvider, createTheme, styled } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import {TransitionGroup, CSSTransition} from "react-transition-group";

import WelcomePage from "./WelcomePage";
import LoginPage from "./Login";
import SignUpPage from "./SignUp";
import Provider from "./Provider";
import PatientPage from "./Patient";

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


const WelcomeWrapper  = (userData) => {
    return userData != null ? () => <Redirect to={userData.provider_type == "patient" ? navs.navlink.to.patient(userData.url) : navs.navlink.to.provider(userData.url)}/> : WelcomePage
}

const ProviderPageWrapper = userData => ({ location }) => (
    <Provider current_userdata={userData} chosen_url={queryString.parse(location.search).id} />
)

const PatientPageWrapper = userData => ({ location }) => (
    <PatientPage loggedInUserData={userData} patientUrlId={queryString.parse(location.search).id} />
)

const LoginInWrapped = (userData, setUserData) => () => (
    <LoginPage userData={userData} setUserData={setUserData}/>
)

const SignUpWrapped = (setUserData, userData) => () => (
    <SignUpPage setUserData={setUserData} userData={userData}/>
   )

const HdRoutes = ({ setUserData, userData}) => {
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
                    <Route exact path="/" component={WelcomeWrapper(userData)}/>
                    <Route path={navs.navlink.to.login()} component={LoginInWrapped(userData, setUserData)}/>
                    <Route path={navs.navlink.to.signup()} component={SignUpWrapped(setUserData, userData)}/>
                    <Route path={navs.pattern.for.provider()} component={ProviderPageWrapper(userData)} />
                    <Route path={navs.pattern.for.patient()} component={PatientPageWrapper(userData)}/>
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
    const [userData, setUserData] = useState(null)
    
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
                            <HdRoutes setUserData={setUserData} userData={userData}/>
                        </Container>
                    </main>
                </Router>
            </div>
        </ThemeProvider>
    )
}