import React, { useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
import makeStyles from '@mui/styles/makeStyles'
import { alpha, styled } from '@mui/material/styles';
import { HDTextField } from "../components/CustomInputs";
import { Typography, Grid, Container, Button, } from "@mui/material";

import { postJSON } from "../utils/requests";

const useStyles = makeStyles(theme => ({
    button: {
        width: "25%",
        display: "flex",
        '&:hover': {
            backgroundColor: 'rgba(236,232,232,0.90)',
            color: 'white',
        },
    },
    input: {
        borderColor: "white !important",
        display: "flex",
        margin: "0% 0% 2% 2%"
    },
    form: {
        padding: "3%"
    }
}))

const Login = ({ setUserData }) => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(false)
    const [providerType, setProviderType] = useState("")
    const classes = useStyles()
    const history = useHistory()

    const handlePasswordChange = (event) => {
        setPassword(event.target.value)
    }

    const handleUsernameChange = (event) => {
        setUsername(event.target.value)
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        let data = {
            username: username,
            password: password,
            provider_type: providerType

        }
        postJSON("api/login/", data).then(response => {
            if(!response.ok){
                throw Error(response.statusText)
            }
            return response.json()
        }).then(userdata => {
            console.log(userdata)
            setUserData(userdata["user_data"])
            history.push("")

        }).catch(err => {
            setError(err)
            alert(err)
            console.log(err)
        })
        setPassword("")
    }

    return (
        <Container >
            <Typography variant="h2">Sign In</Typography>
            <form noValidate className={classes.form}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={5}>
                        <Button variant="outlined" disabled={providerType == "mental"} onClick={() => setProviderType("mental")} fullWidth>Mental Health Provider</Button> 
                    </Grid>
                    <Grid item xs={12} sm={5}>
                        <Button variant="outlined" disabled={providerType == "phys"} onClick={() => setProviderType("phys")} fullWidth>Physical Health Provider</Button>
                    </Grid>
                    <Grid item xs={12} sm={5}>
                        <Button variant="outlined" disabled={providerType == "patient"} onClick={() => setProviderType("patient")} fullWidth>Patient</Button>
                    </Grid>
                </Grid>
                <div style={{margin: "2%"}}/>
                <HDTextField 
                    variant="outlined"
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    className={classes.input}
                    autoFocus
                    onChange={handleUsernameChange}
                    value={username}
                    error={error}
                />
                <HDTextField 
                    variant="outlined"
                    required
                    fullWidth
                    color="primary"
                    id="password"
                    label="Password"
                    type="password"
                    className={classes.input}
                    style={{ marginTop: "2%", borderColor: "white" }}
                    onChange={handlePasswordChange}
                    value={password}
                    error={error}
                />
                <Button
                    id="login-button"
                    type="submit"
                    variant="outlined"
                    onClick={handleSubmit}
                    className={classes.button}
                    style={{ marginTop: "2%", borderColor: "white" }}
                    disabled={username == "" || password == "" || providerType == ""}
                >
                    <Typography variant="overline">Login</Typography>
                </Button>
            </form>
        </Container>
    )
}

const LoginPage = ({userData, setUserData}) => {
    return userData != null ? <Redirect to={{pathname: '/'}}/> : <Login setUserData={setUserData}/>;
}

export default LoginPage;