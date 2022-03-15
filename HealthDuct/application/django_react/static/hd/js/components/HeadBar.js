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
        <ListItem button components={Link} key={"Login"} to={navs.navlink.to.login()}>
            <ListItemText primary={"Login"} />
        </ListItem>
        <ListItem button components={Link} key={"Signup"} to={navs.navlink.to.signup()}>
            <ListItemText primary={"Sign Up"} />
        </ListItem>
    </div>
)

const LoggedInLinks = () => (
    <div>
        <ListItem button components={Link} key={"Patients"} to={navs.navlink.to.patientList()}>
            <ListItemText primary={"View Your Patients"} />
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
            <AppBar position="fixed" style={{background:"transparent"}}>
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
                    userData.first_name && (
                        <div>
                            <IconButton
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleMenu}
                                color="inherit"
                            >
                                <Typography>
                                    {userData.first_name}
                                </Typography>
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                                }}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={() => logOut()}>Log out</MenuItem>
                            </Menu>
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
                            userData.first_name ? <LoggedInLinks /> : <AnonLinks />
                        }
                    </List>
                </Box>

            </HDDrawer>
        </div>
    )
}