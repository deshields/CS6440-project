import React, { useState } from "react";
import { Redirect } from "react-router-dom";

import { Typography, TextField, Container, Button } from "@mui/material";
import { makeStyles } from "@mui/material";

export default function WelcomePage() {
    return (
        <div>
            <Container>
                <Typography 
                    align="left"
                    variant="h1"
                >
                    HealthDuct
                </Typography>
                <Typography 
                    align="left"
                    variant="h3"
                >
                    Where physical and mental needs meet.
                </Typography>

                <Button>Login</Button>
                <Button>Signup</Button>
            </Container>
        </div>
    )
}
