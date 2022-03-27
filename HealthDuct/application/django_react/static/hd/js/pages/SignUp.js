import React, { useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
import makeStyles from '@mui/styles/makeStyles'
import { HDSelectField, HDTextField } from "../components/CustomInputs";
import { Typography,Container, Button, MenuItem, Stepper, Grid, Step, StepLabel, Link } from "@mui/material";

import { postJSON } from "../utils/requests";


const useStyles = makeStyles(theme => ({
    button: {
        width: "25%",
        display: "flex",
        '&:hover': {
            backgroundColor: 'rgba(236,232,232,0.90)',
            color: 'white',
        },
    },
    input: {
        borderColor: "white !important",
        display: "flex",
        margin: "0% 0% 2% 2%"
    },
    form: {
        padding: "3%"
    },
    bgSetting: {
        background: 'rebeccapurple',
        outline: "auto"
    }
}))

const NeedsVerify = ({userdata}) => {
    const [verifying, setVerifying] = useState(false)
    const history = useHistory()

    const handleVerify = () => {
        setVerifying(true)
        postJSON("api/verify/", userdata).then(resp => {
            if(!resp.ok){
                throw Error(resp.statusText)
            }
            setVerifying(false)
            history.push("")
            return 

        })
    }
    return (
        <React.Fragment>
            <Typography variant="h2">Hello, {userdata.first_name}! </Typography>
            <Typography>Seems like you haven't verified your account yet. For testing purposes, <Link onClick={() => handleVerify()}>click here to do so.</Link></Typography>
        </React.Fragment>
    )

}

const BasicInfoStep = ({first, last, title, contact, email, setFirst, setLast, setTitle, setContact, setEmail, error}) =>{

    const handleTextChange = (event, stateFunc) => {
        stateFunc(event.target.value)
    }

    const handleContact = (event, keyval) => {
        contact[keyval] = event.target.value
        setContact[contact]
    }

    return (
        <React.Fragment>
            <Typography variant="h4">Basic Information</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={2}>
                    <HDTextField variant="outlined" value={title} onChange={(event) => handleTextChange(event, setTitle)} label="Title" fullWidth /> {/* should be select */}
                </Grid>
                <Grid item xs={12} sm={5}>
                    <HDTextField variant="outlined" required error={error} value={first} onChange={(event) => handleTextChange(event, setFirst)} label="First Name" fullWidth />
                </Grid>
                <Grid item xs={12} sm={5}>
                    <HDTextField variant="outlined" required error={error} value={last} onChange={(event) => handleTextChange(event, setLast)} label="Last Name" fullWidth />
                </Grid>
                <Grid item xs={12}>
                    <HDTextField variant="outlined" required error={error} value={email} onChange={(event) => handleTextChange(event, setEmail)} label="Email" fullWidth />
                </Grid>
            </Grid>

        </React.Fragment>
    )
}

const AffiliatesStep = ({affiliate, setAffil, institutions, setProviderType, providerType}) => {

    const handleAffilChange = (event) => {
        setAffil(event.target.value)
    }

    const handleTypeChange = (pt) => {
        setProviderType(pt)
    }

    const classes = useStyles()

    return(
        <React.Fragment>
            <Typography variant="h4">Affiliated Institution</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={5}>
                    <Button variant="outlined" disabled={providerType == "mental"} onClick={() => handleTypeChange("mental")} fullWidth>Mental Health Provider</Button> 
                </Grid>
                <Grid item xs={12} sm={5}>
                    <Button variant="outlined" disabled={providerType == "phys"} onClick={() => handleTypeChange("phys")}fullWidth>Physical Health Provider</Button>
                </Grid>
                <Grid item xs={12} sm={5}>
                    <Button variant="outlined" disabled={providerType == "patient"} onClick={() => handleTypeChange("patient")} fullWidth>Patient</Button> 
                </Grid>
                {(providerType == "phys" || providerType == "mental") && <Grid item xs={12}>
                    <HDSelectField style={{width: 300}} labelId="instaSelect" label="Affiliated Institutions" variant="outlined" onChange={handleAffilChange} value={affiliate}>
                        <div className={classes.bgSetting}>{institutions.map(i => (<MenuItem key={i} value={i} className={classes.bgSetting}>{i}</MenuItem>))}</div>
                    </HDSelectField>
                </Grid>}
            </Grid>
        </React.Fragment>
    )
}

const CredentialsStep = ({username, setUsername, password, setPassword, error}) => {

    const handlePasswordChange = (event) => {
        setPassword(event.target.value)
    }

    const handleUsernameChange = (event) => {
        setUsername(event.target.value)
    }

    const classes = useStyles()

    return (
        <React.Fragment>
                <HDTextField 
                    variant="outlined"
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    className={classes.input}
                    autoFocus
                    onChange={handleUsernameChange}
                    value={username}
                    error={error}
                />
                <HDTextField 
                    variant="outlined"
                    required
                    fullWidth
                    color="primary"
                    id="password"
                    label="Password"
                    type="password"
                    className={classes.input}
                    style={{ marginTop: "2%", borderColor: "white" }}
                    onChange={handlePasswordChange}
                    value={password}
                    error={error}
                />
        </React.Fragment>
    )
}

const SignUp = ({ setCurrentUserData, userData }) => {
    let [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setlastName] = useState("")
    const [email, setEmail] = useState("")
    const [title, setTitle] = useState("")
    const [affiliatedInst, setAffiliatedInst] = useState("")
    const [contact, setContact] = useState({"phone": "", "address": "", "fax":""})
    const [providerType, setProviderType] = useState(null)

    const steps = ['Basic information', 'Affiliation', 'Credentials']
    const [error, setError] = useState(false)
    const [activeStep, setActiveStep] = useState(0);
    const [skipped, setSkipped] = useState(new Set());
  
    const isLastStep = activeStep === steps.length - 1

    const required = [username, password, email, firstName, lastName, providerType]
    React.useEffect(() => {
        let leftovers = required.filter(val => {return (val == undefined || val == null || val == '')} )
        if(leftovers.length != 0){
            setError(true)
        } else {
            setError(false)
        }

    }, required)


    const classes = useStyles()

    const isStepOptional = (step) => {
      return step === 1;
    };
  
    const isStepSkipped = (step) => {
      return skipped.has(step);
    };
  
    const handleNext = () => {
      let newSkipped = skipped;
      if (isStepSkipped(activeStep)) {
        newSkipped = new Set(newSkipped.values());
        newSkipped.delete(activeStep);
      }
  
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setSkipped(newSkipped);
    };
  
    const handleBack = () => {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };
  
    const handleSkip = () => {
      if (!isStepOptional(activeStep)) {
        // You probably want to guard against something like this,
        // it should never occur unless someone's actively trying to break something.
        throw new Error("You can't skip a step that isn't optional.");
      }
  
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setSkipped((prevSkipped) => {
        const newSkipped = new Set(prevSkipped.values());
        newSkipped.add(activeStep);
        return newSkipped;
      });
    };
  
    const handleReset = () => {
      setActiveStep(0);
    };
  

    const handleSubmit = (event) => {
        event.preventDefault();

        // send to user/pass to backend
        let data = {
            model: {
                user:{
                    username: username,
                    password: password,
                    email: email,
                    first_name: firstName,
                    last_name: lastName,
                },
                provider:{
                    title: title,
                    contact: contact,
                },
            },
            provider_type: providerType
        }

        postJSON("api/signup/", data).then(response => {
            if(!response.ok){
                throw Error(response.statusText)
            }
            return response.json()
        }).then(userdata => {
            setCurrentUserData(userdata["user_data"])
        })
        setPassword("")
    }

    function _renderStepContent(step) {
        switch (step) {
          case 0:
            return <BasicInfoStep first={firstName} lastName={lastName} title={title} contact={contact} email={email} 
                                setFirst={setFirstName} setLast={setlastName} setTitle={setTitle} setContact={setContact} setEmail={setEmail}/>;
          case 1:
            return <AffiliatesStep affiliate={affiliatedInst} setAffil={setAffiliatedInst} institutions={["InstA"]} providerType={providerType} setProviderType={setProviderType}/>;
          case 2:
            return <CredentialsStep username={username} password={password} setPassword={setPassword} setUsername={setUsername}/>;
          default:
            return  <NeedsVerify userdata={userData}/>;
        }
      }


    return (
        <Container >
            <Typography variant="h2">Sign In</Typography>
            
            <div>
            {activeStep === steps.length ? (
                <div>
                    {/* All steps completed
                    An email has been sent to {email}. */}
                    <NeedsVerify userdata={userData}/>
                </div>
                ) : (
                <form noValidate className={classes.form}>
                    <div>
                        {_renderStepContent(activeStep)}
                        <div style={{marginTop: "10%", textAlign: "center" }}>
                            <Button disabled={activeStep === 0} style={{marginRight: "25%"}} onClick={handleBack}>
                                Back
                            </Button>
                            {activeStep === steps.length - 1 ? <Button disabled={error} onClick={(e) => handleSubmit(e)}>Finish</Button> : <Button variant="outlined" color="primary" onClick={handleNext}>Next</Button>}
                        </div>
                    </div>
                </form>
                )}
            </div>
            <Stepper activeStep={activeStep} sx={{ py: 3 }} alternativeLabel>
                {steps.map((steps) => (
                <Step key={steps}>
                    <StepLabel>{steps}</StepLabel>
                </Step>
                ))}
            </Stepper>
        </Container>
    )
}

const SignUpPage = ({ setUserData, userData }) => {
    return userData != null ? <Redirect to={{pathname: '/'}}/> : <SignUp setCurrentUserData={setUserData} userData={userData}/>;
}

export default SignUpPage;