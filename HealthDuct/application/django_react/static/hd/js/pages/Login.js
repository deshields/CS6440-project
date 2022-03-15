import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import makeStyles from '@mui/styles/makeStyles'
import { alpha, styled } from '@mui/material/styles';
import { HDTextField } from "../components/CustomInputs";
import { Typography, TextField, Container, Button, FormControl, OutlinedInput } from "@mui/material";

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

const Login = ({ onUsernameChange, setCurrentUserData }) => {
    let [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(false)

    const classes = useStyles()

    const handlePasswordChange = (event) => {
        setPassword(event.target.value)
    }

    const handleUsernameChange = (event) => {
        setUsername(event.target.value)
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        // send to user/pass to backend
        onUsernameChange(username)
        setPassword("")
    }

    return (
        <Container >
            <Typography variant="h2">Sign In</Typography>
            <form noValidate className={classes.form}>
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
                    disabled={username == "" || password == ""}
                >
                    <Typography variant="overline">Login</Typography>
                </Button>
            </form>
        </Container>
    )
}

const LoginPage = ({username, onUsernameChange, setUserData}) => {
    return username ? <Redirect to={{pathname: '/'}}/> : <Login onUsernameChange={onUsernameChange} setCurrentUserData={setUserData}/>;
}

export default LoginPage;