
import { IconButton, Typography, Box, Grid, CircularProgress } from "@mui/material";
import React, { useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
import { fetchJSON } from "../utils/requests";
import NextPlanIcon from '@mui/icons-material/NextPlan';


const PatientPage = ({ loggedInUserData, patientUrlId }) => {

    const [patientData, setPatientData] = useState({})
    const [loadOnce, setLoadOnce] = useState(null)
    const editable = loggedInUserData.url == patientUrlId
    const [isProvider, setIsProvider] = useState(false)

    React.useEffect(() => {
        fetchJSON(`api/patient/${patientUrlId}`).then(data => {
            
            setIsProvider((loggedInUserData.provider_type == "mental" && loggedInUserData.url == data["user_data"].provider.mental.url) || (loggedInUserData.provider_type == "phys" && loggedInUserData.url == data["user_data"].provider.phys.url))
            setPatientData(data["user_data"])
        })

    }, [loadOnce])

    if(Object.keys(patientData).length === 0){
        return (
            <div>
                <CircularProgress />
                <Typography variant="overline">Loading . . .</Typography>
            </div>
        )
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }

    return(
        <React.Fragment>
             <Box sx={{ flexGrow: 1, background: "transparent", display: 'block'}}>
                <Typography variant="h2">{patientData.title}{patientData.first_name} {patientData.last_name}</Typography>
                <Grid container spacing={2}>
                    <Grid item container direction="column" justifyContent="space-evenly" alignItems="flex-start" xs={6}>
                    <Typography variant="h4">Contact Info</Typography>
                    <Typography variant="body2">Email: {patientData.email}</Typography>
                    {
                        Object.keys(patientData.contact).map(key => {
                            return (
                                <Grid item><Typography variant="body2">{capitalizeFirstLetter(key)}: {patientData[key]}</Typography></Grid>
                            )
                        })
                    }
                    </Grid>
                    <div style={{margin: "2%"}}/>
                    <Grid xs={4}>
                    <Typography variant="h4">Providers</Typography>
                        <Typography>Mental health provider? {patientData.provider.mental ? "yes" : "no"}</Typography>
                        <Typography>Primary Care Provider? {patientData.provider.phys ? "yes" : "no"}</Typography>
                        {editable && <IconButton>Want to request a new provider?</IconButton>}
                </Grid>
                </Grid>
            </Box>
        </React.Fragment>
    )
}

export default PatientPage;