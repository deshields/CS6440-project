import React, { useState } from "react";
import { Redirect, useHistory, NavLink } from "react-router-dom";
import makeStyles from '@mui/styles/makeStyles'
import PropTypes from 'prop-types';
import { fetchJSON, postJSON } from "../utils/requests";
import { Typography, CircularProgress, Tab, Tabs, Box, Grid, Table, TableBody, TableCell, TableHead, TableRow , Button} from "@mui/material";
import navs from "../utils/navlinks";
import { HDTextField } from "../components/CustomInputs";

function TabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`vertical-tabpanel-${index}`}
        aria-labelledby={`vertical-tab-${index}`}
        {...other}
        style={{width: "80%"}}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            {children}
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

const OwnPatientsPanel = ({patients, refresh, url, value, index}) => {
    const [code, setCode] = React.useState("");

    const handleCodeChange = (event) => {
        setCode(event.target.value)
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        let data = {
            code: code,
            url: url,
        }
        postJSON("api/provider/patient/add", data).then(response => {
            if(!response.ok){
                throw Error(response.statusText)
            }
            return response
        }).then(userdata => {
            refresh()

        }).catch(err => {
            alert(err)
            console.log(err)
        })
    }

    return (
        <TabPanel value={value} index={index}>
            <Typography variant="h2">Your Patient List</Typography>
            {patients.length == 0 ? <Typography variant="h3">No patients listed.</Typography> : <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            Title
                        </TableCell>
                        <TableCell>
                            Last Name
                        </TableCell>
                        <TableCell>
                            First Name
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {patients.map((patient) => (
                    <TableRow key={patient.url_id} component={NavLink} to={navs.navlink.to.patient(patient.url_id)}>
                        <TableCell>{patient.title}</TableCell>
                        <TableCell>{patient.user__last_name}</TableCell>
                        <TableCell>{patient.user__first_name}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>}
            <div style={{display: "flex", margin: "2%", justifyContent: "space-around", alignItems: "center"}}>
                <Typography variant="body2">Add patient via code:</Typography>
                <HDTextField 
                    variant="outlined"
                    fullWidth
                    id="addPatient"
                    label="Add Patient"
                    onChange={handleCodeChange}
                    value={code}
                />
                <Button
                type="submit"
                variant="outlined"
                onClick={handleSubmit}
                disabled={code.length != 10}>
                    <Typography variant="overline">Add</Typography>
                </Button>
            </div>
            
            

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
                            <Grid item key={key}><Typography variant="body2">{capitalizeFirstLetter(key)}: {profileData[key]}</Typography></Grid>
                        )
                    })
                }
                </Grid>
                <div style={{margin: "2%"}}/>
                <Grid xs={4} item>
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
    const [loading, setLoading] = useState(false)
    const editable = user.url == current_userdata.url

    const refresh = () => {
        setLoading(true)
        fetchJSON(`api/provider/${chosen_url}`).then(data => {
            console.log(`provider: ${data}`)
            setUser(data["user_data"])
            setPatients(data["user_data"]["patients"])
        })
        setLoading(false)
    }

    React.useEffect(() => {
        fetchJSON(`api/provider/${chosen_url}`).then(data => {
            console.log(data)
            setUser(data["user_data"])
            setPatients(data["user_data"]["patients"])
        })

    }, [oneTime])

    const handleChange = (event, newValue) => {
        setValue(newValue);
      };

    if(Object.keys(user).length === 0 || loading){
        return (
            <div>
                <CircularProgress />
                <Typography variant="overline">Loading . . .</Typography>
            </div>
        )
    }


    return (
    // <React.Fragment>
        
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
                    {editable && <Tab label="Patients" {...a11yProps(1)} />}
                </Tabs>
                <InformationPanel profileData={user} value={value} index={0}/>
                {editable && <OwnPatientsPanel patients={patients} refresh={refresh} url={current_userdata.url} value={value} index={1}/>}
            </div>

        </Box>
    // </React.Fragment>
    )
}

const Provider = ({current_userdata, chosen_url}) => {
    return (
        current_userdata ? <ProviderPage current_userdata={current_userdata} chosen_url={chosen_url} /> : <Redirect to={navs.navlink.to.login()} />
    )
}

export default Provider;