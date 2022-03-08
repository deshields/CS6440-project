import React, { useState } from "react";
import { Redirect } from "react-router-dom";

import { Typography, TextField, Container, Button } from "@mui/material";

const Login = ({ onUsernameChange }) => {
    let [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(false)

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
        <Container>
            <Typography>Sign In</Typography>
            <form noValidate>
                <TextField 
                    variant="outlined"
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    autoFocus
                    onChange={handleUsernameChange}
                    value={username}
                    error={error}
                />
                <TextField 
                    variant="outlined"
                    required
                    fullWidth
                    id="password"
                    label="Password"
                    onChange={handlePasswordChange}
                    value={password}
                    error={error}
                />
                <Button
                    id="login-button"
                    type="submit"
                    onClick={handleSubmit}
                    disabled={username == "" || password == ""}
                >
                    Login
                </Button>
            </form>
        </Container>
    )
}

const LoginPage = ({username, onUsernameChange, setUserData}) => {
    return username ? <Redirect to={{pathname: '/'}}/> : <Login onUsernameChange={onUsernameChange}/>;
}

export default LoginPage;