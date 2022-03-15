import React, { useState } from "react";
import { Redirect, Link } from "react-router-dom";

import { Typography, TextField, Container, Button } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles'
import navs from "../utils/navlinks";

const useStyles = makeStyles(theme => ({
    button: {
        width: "50%",
        display: "flex",
        '&:hover': {
            backgroundColor: 'rgba(236,232,232,0.90)',
            color: 'white',
        },
    },
}))

export default function WelcomePage() {

    const classes = useStyles()

    return (
        <div>
            <Container maxWidth="md">
                <Typography 
                    align="left"
                    variant="h1"
                >
                    HealthDuct
                </Typography>
                <Typography 
                    align="center"
                    variant="h4"
                >
                    Where physical and mental needs meet.
                </Typography>
                <div style={{margin: "10%"}}/>
                <Button className={classes.button} style={{display: "flex", borderRadius: 25, margin: "2%" }} variant="outlined" component={Link} to={navs.navlink.to.login()}>Login</Button>
                <Button className={classes.button} style={{display: "flex", borderRadius: 25, margin: "2%" }} variant="outlined" component={Link} to={navs.navlink.to.signup()}>Signup</Button>
            </Container>
        </div>
    )
}
