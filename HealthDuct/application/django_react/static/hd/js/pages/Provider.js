import React, { useState } from "react";
import { Redirect, useHistory, NavLink } from "react-router-dom";
import makeStyles from '@mui/styles/makeStyles'
import PropTypes from 'prop-types';
import { fetchJSON } from "../utils/requests";
import { Typography, CircularProgress, Tab, Tabs, Box, Grid, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import navs from "../utils/navlinks";

function TabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`vertical-tabpanel-${index}`}
        aria-labelledby={`vertical-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
      id: `vertical-tab-${index}`,
      'aria-controls': `vertical-tabpanel-${index}`,
    };
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

const OwnPatientsPanel = ({patients, value, index}) => {
    if(patients.length == 0){
        return (
            <TabPanel value={value} index={index}>
            <Typography variant="h2">No patients listed.</Typography>
            </TabPanel>
        )
    }

    return (
        <TabPanel value={value} index={index}>
            <Typography variant="h2">Your Patient List</Typography>
            <Table>
                {patients.forEach(patient => {
                    return(
                        <TableRow component={NavLink} to={navs.pattern.for.patient(patient.url)}>
                            <TableCell>{patient.last_name}</TableCell>
                            <TableCell>{patient.first_name}</TableCell>
                        </TableRow>
                    )
                    })}
            </Table>
            

        </TabPanel>
    )
}

const InformationPanel = ({profileData, value, index}) => {
    return (
        <TabPanel value={value} index={index}>
            
            <Grid container spacing={2}>
                <Grid item container direction="column" justifyContent="space-evenly" alignItems="flex-start" xs={6}>
                <Typography variant="h4">Contact Info</Typography>
                <Typography variant="body2">Email: {profileData.email}</Typography>
                {
                    Object.keys(profileData.contact).map(key => {
                        return (
                            <Grid item><Typography variant="body2">{capitalizeFirstLetter(key)}: {profileData[key]}</Typography></Grid>
                        )
                    })
                }
                </Grid>
                <div style={{margin: "2%"}}/>
                <Grid xs={4}>
                    <Typography variant="h4">Affiliated Institution</Typography>
                    {profileData.institute}
                </Grid>
            </Grid>
            
        </TabPanel>
    )
}

const ProviderPage = ({current_userdata, chosen_url}) => {
    const [value, setValue] = React.useState(0);
    const [user, setUser] = useState({})
    const [oneTime, setOneTime] = useState(null)
    const [patients, setPatients] = useState([])
    const editable = user.url == current_userdata.url

    React.useEffect(() => {
        fetchJSON(`api/provider/${chosen_url}`).then(data => {
            console.log(`provider: ${data}`)
            setUser(data["user_data"])
            setPatients(data["user_data"]["patients"])
        })

    }, [oneTime])

    const handleChange = (event, newValue) => {
        setValue(newValue);
      };

    if(Object.keys(user).length === 0){
        return (
            <div>
                <CircularProgress />
                <Typography variant="overline">Loading . . .</Typography>
            </div>
        )
    }


    return (
    <React.Fragment>
        
        <Box sx={{ flexGrow: 1, background: "transparent", display: 'block'}}>
            <Typography variant="h2">{user.title}{user.first_name} {user.last_name}</Typography>
            <div style={{margin: "2%"}}/>
            <div style={{display: "flex"}}>
                <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    value={value}
                    onChange={handleChange}
                    aria-label="Vertical tabs example"
                    sx={{ borderRight: 1, borderColor: 'divider' }}
                >
                    <Tab label="General Info" {...a11yProps(0)} />
                    <Tab label="Patients" {...a11yProps(1)} />
                </Tabs>
                <InformationPanel profileData={user} value={value} index={0}/>
                <OwnPatientsPanel patients={patients} value={value} index={1}/>
            </div>

        </Box>


    </React.Fragment>)
}

const Provider = ({current_userdata, chosen_url}) => {
    return (
        current_userdata ? <ProviderPage current_userdata={current_userdata} chosen_url={chosen_url} /> : <Redirect to={navs.navlink.to.login()} />
    )
}

export default Provider;