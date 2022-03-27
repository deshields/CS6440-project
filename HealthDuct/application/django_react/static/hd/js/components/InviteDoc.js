import React, { useState } from "react";
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { fetchJSON } from '../utils/requests';
import NextPlanIcon from '@mui/icons-material/NextPlan';
import { IconButton, Typography, Box, Grid, Tooltip } from "@mui/material";
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

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
    background: 'slateblue'
  }
});

const PDFCode = ({type}) => (
    <Tooltip title={`Request new ${type} provider`}>
        <IconButton>
            <NextPlanIcon/>
        </IconButton>
    </Tooltip>
)

const patientCode = (patientId) => {
    postJSON('api/patient/get_invite', {'patientId': patientId}).then(resp => {
        if(!resp.ok){
            throw Error(resp.statusText)
        }
        return resp.json()
    }).then(data => {
        return data["code"]
    })
}

// Create Document Component
const PatientInviteDocument = ({patientData}) => {
    const code = patientCode(patientData.url)
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text>By submission of this document, patient {patientData.title} {patientData.first_name} {patientData.last_name} gives permission to the recipient provider to access the patient's data in regards to
                    their mental or physical health. This may include therapy notes, prescriptions, diagnoses and current treatmen plans.</Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.code}>{code}</Text>
                </View>
            </Page>
        </Document>
    )
};

const NewCode = ({patient, newProviders}) => {
    const [loading, setLoading] = useState(false)
    const [code, setCode] = useState(null)
    const [open, setOpen] = React.useState(false);
    const [newMP, setNewMP] = useState(false)
    const [newPCP, setNewPCP] = useState(false)

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleMPChange = (event) => {
        setNewMP(event.target.checked)
    }

    const handlePCPChange = (event) => {
        setNewPCP(event.target.checked)
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
            setCode(data["code"])
        })
    }

    const InviteDialog = ({}) => {
        return(
            <Dialog 
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
                </DialogContent>
                <DialogActions>
                    <IconButton onClick={() => inviting()}>
                        <NextPlanIcon/>
                    </IconButton>
                </DialogActions>
            </Dialog>
        )
    }

    return(
        <React.Fragment>
            <Tooltip title={`Invite new provider(s)`}>
                <IconButton onClick={() => inviting()}>
                    <NextPlanIcon/>
                </IconButton>
            </Tooltip>
            <InviteDialog/>
            {code != null && <ViewCodeDoc patient={patient}/>}
        </React.Fragment>
    )
}

const openPDF = (url) => {
    window.open(url, '_blank');
};


const ViewCodeDoc = ({patient}) => (
    <PDFDownloadLink document={<PatientInviteDocument patientData={patient}/>}>
      {({ blob, url, loading, error }) =>
                loading ? 'Loading document...' : openPDF(url)
     }
    </PDFDownloadLink>
  )

export default PatientInviteDocument;
