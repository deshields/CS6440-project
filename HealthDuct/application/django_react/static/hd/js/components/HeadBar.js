import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AppBar, Toolbar, Drawer, IconButton, Typography, List, ListItem, ListItemText, Box } from "@mui/material";
import { MenuItem, Menu } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import navs from "../utils/navlinks";
import { styled } from "@mui/material/styles";

const HDDrawer = styled(Drawer)({
    backgroundColor: 'rgba(0,0,0,0.4)', 
    borderRight: '5px solid white',
    '& .MuiDrawer-paper': {
        backgroundColor: 'rgba(0,0,0,0.4)', 
        borderRight: '5px solid white',
    },
  });


const AnonLinks = () => (
    <div>
        <ListItem button component={Link} key={"Login"} to={navs.navlink.to.login()}>
            <ListItemText primary={"Login"} />
        </ListItem>
        <ListItem button component={Link} key={"Signup"} to={navs.navlink.to.signup()}>
            <ListItemText primary={"Sign Up"} />
        </ListItem>
    </div>
)

const LoggedInLinks = (provider) => (
    <div>
        {provider && (
        <div>
            <ListItem button component={Link} key={"Patients"} to={navs.navlink.to.patientList()}>
                <ListItemText primary={"View Your Patients"} />
            </ListItem>
            <ListItem button component={Link} key={"Code"} to={navs.navlink.to.patientList()}>
                <ListItemText primary={"Enter Patient Invite Code"} />
            </ListItem>
        </div>)
        }
        <ListItem button key={"Patients"} onClick={() => logOut()}>
            <ListItemText primary={"Log Out"} />
        </ListItem>
    </div>
)


export default function HeadBar({ userData,  setData}){
    const [openDrawer, setOpenDrawer] = useState(false)
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleOpenDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
          }
        setOpenDrawer(open)
    }

    const handleClose = () => {
        setAnchorEl(null);
      };

    const logOut = () => {
        setData({})
        handleClose({})
    }

    return(
        <div>
            <AppBar position="fixed" style={{background:"transparent", boxShadow: "none"}}>
                <Toolbar>
                    <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    sx={{ mr: 2 }}
                    onClick={handleOpenDrawer(true)}
                >
                        <MenuIcon />
                    </IconButton>

                {
                    userData != null && (
                        <div style={{borderLeft: "solid"}}>
                            <Typography>
                                {userData.first_name} {userData.last_name}
                            </Typography>
                        </div>
                    )
                }
                </Toolbar>
            </AppBar>
            <HDDrawer
                anchor="left"
                open={openDrawer}
                onClose={handleOpenDrawer(false)}
                style={{}}    
            >
                <Box
                    onClick={handleOpenDrawer(false)}
                    onKeyDown={handleOpenDrawer(false)}
                    // style={{backgroundColor: 'rgba(0,0,0,0.4)', borderRight: '5px solid white'}} 
                >
                    <List>
                        <ListItem button component={Link} key={"Home"} to="/">
                            <ListItemText primary={"Home"} />
                        </ListItem>
                        {
                            userData != null ? <LoggedInLinks provider={userData.provider_type != "patient"}/> : <AnonLinks />
                        }
                    </List>
                </Box>

            </HDDrawer>
        </div>
    )
}