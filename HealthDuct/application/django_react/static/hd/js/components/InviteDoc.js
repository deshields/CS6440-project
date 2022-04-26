import React, { useState } from "react";
// import { Buffer } from 'buffer';
// global.Buffer = Buffer
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { postJSON } from '../utils/requests';
import NextPlanIcon from '@mui/icons-material/NextPlan';
import IosShareIcon from '@mui/icons-material/IosShare';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { IconButton, Typography, Box, Grid, Link, Tooltip } from "@mui/material";
import { Redirect } from "react-router-dom";
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Checkbox from '@mui/material/Checkbox';
import { HDDialog } from "./CustomInputs";
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import navs from "../utils/navlinks";


// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#E4E4E4'
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  },
  code: {
    color: 'white',
    backgroundColor: 'slateblue'
  }
});


const patientCode = (patientId) => {
    postJSON('api/patient/invite/get', {'patientId': patientId}).then(resp => {
        if(!resp.ok){
            throw Error(resp.statusText)
        }
        return resp.json()
    }).then(data => {
        return data["code"]
    })
}

// Create Document Component
const PatientInviteDocument = ({patientData, code}) => {
    const get_code = patientCode(patientData.url)
    console.log(code)
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text>By submission of this document, patient {patientData.title} {patientData.first_name} {patientData.last_name} gives permission to the recipient provider to access the patient's data in regards to
                    their mental or physical health. This may include therapy notes, prescriptions, diagnoses and current treatmen plans.</Text>
                    <Text style={styles.code}>{code}</Text>
                </View>
            </Page>
        </Document>
    )
};

const NewPatientCode = ({patient}) => {
    const [loading, setLoading] = useState(false)
    const [loadOnce, setLoadOnce] = useState(null)
    const [code, setCode] = useState(null)
    const [open, setOpen] = React.useState(false);
    const [newMP, setNewMP] = useState(false)
    const [newPCP, setNewPCP] = useState(false)
    const [docOpen, setDocOpen] = React.useState(false);

    React.useEffect(() => {
        if(code == null){
            checkExistingInvite()
        }
    }, [loadOnce])

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleMPChange = (event) => {
        setNewMP(event.target.checked)
    }

    const handleDocOpen = () => {
        setDocOpen(true)
    }

    const handlePCPChange = (event) => {
        setNewPCP(event.target.checked)
    }

    const checkExistingInvite = () => {
        postJSON('api/patient/invite/get', {'patientId': patient.url}).then(resp => {
            if(!resp.ok){
                setCode(null)
            }
            return resp.json()
        }).then(data => {
            setLoading(false)
            setCode(data)
        })
    }

    const parseValid = (code_details) => {
        let valid_string = []
        Object.keys(code_details["valid_for"]).map(provider => {
            if(code_details["valid_for"][provider]) valid_string.push(`a new ${provider} provider`)
        })
        return valid_string.join(" and ")
    }
    
    const inviting = () => {
        setLoading(true)
        postJSON('api/patient/invite/new', {'patientId': patient.url, "newPhys": newPCP, "newMP": newMP }).then(resp => {
            if(!resp.ok){
                throw Error(resp.statusText)
            }
            return resp.json()
        }).then(data => {
            setLoading(false)
            setCode(data)
        })
    }

    const InviteDialog = ({}) => {
        return(
            <HDDialog 
            open={open}
            onClose={handleClose}
            >
                <DialogTitle>
                    Invite New Provider(s)
                </DialogTitle>
                <DialogContent>
                <FormGroup>
                    <FormControlLabel
                        control={
                        <Checkbox checked={newMP} onChange={handleMPChange} name="New MP" />
                        }
                        label="New Mental Health Provider"
                    />
                    <FormControlLabel
                        control={
                        <Checkbox checked={newPCP} onChange={handlePCPChange} name="New PCP" />
                        }
                        label="New Primary Care Provider"
                    />
                </FormGroup>
                {code != null && <Typography>You have an unused code still available. It's valid for {parseValid(code)}. </Typography>}
                </DialogContent>
                <DialogActions>
                    <IconButton onClick={() => inviting()}>
                        <NextPlanIcon/>
                    </IconButton>
                </DialogActions>
            </HDDialog>
        )
    }

    const openPDF = (url) => {
        window.open(url, '_blank');

    };
    
    
    const ViewCodeDoc = ({patient, code}) => (
        <PDFDownloadLink document={<PatientInviteDocument patientData={patient} code={code}/>}>
          {({ blob, url, loading, error }) => 
            loading && (code == null || code == undefined) ? 'Loading document...' : <Tooltip title={"Download document with your current usable code."}><IconButton onClick={() => openPDF(url)}><FileDownloadIcon/></IconButton></Tooltip>
         }
        </PDFDownloadLink>
      )
    
    return(
        <React.Fragment>
            <Tooltip title={`Invite new provider(s)`}>
                <IconButton onClick={() => handleClickOpen()}>
                    <IosShareIcon/>
                </IconButton>
            </Tooltip>
            <InviteDialog/>
            {(code != null && code != undefined) && <ViewCodeDoc patient={patient} code={code["code"]}/>}
        </React.Fragment>
    )
}


export default NewPatientCode;
