
import { IconButton, Typography, Box, Grid, CircularProgress, Tab, Tabs, Divider, Drawer, Collapse, List, ListItem, ListItemButton, ListItemText} from "@mui/material";
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import React, { useState } from "react";
import { styled, useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { Redirect, useHistory, Link } from "react-router-dom";
import { fetchJSON, postJSON } from "../utils/requests";
import NextPlanIcon from '@mui/icons-material/NextPlan';
import NewPatientCode from "../components/InviteDoc";
import navs from "../utils/navlinks";
import { HDTextField } from "../components/CustomInputs";
import { quantile, interquartileRange } from "simple-statistics"

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
  }));

const DetailDrawer = styled(Drawer)(({ theme }) => ({
   backgroundColor: "transparent",
   '& .MuiDrawer-paper': {
    backgroundColor: 'transparent', 
    padding: "50px 0px 0px 10px" 
   }
  }));

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

  const DataSection = ({header, body}) => {
      const [open, setOpen] = useState(false)
      const handleClick = () => {
        setOpen(!open);
      };

      const tableOrString = (str) => {
        if(str.includes("<table")){
            return  <div dangerouslySetInnerHTML={{ __html: str }} />
        } else {
            return str
        }
    }
      
      return(
        <React.Fragment>
            <ListItemButton onClick={handleClick}>
                <ListItemText primary={<Typography variant="h5">{header}</Typography>}/>
                {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    <ListItemButton sx={{ pl: 4 }}>
                        <ListItemText primary={<Typography>{tableOrString(body)}</Typography>} />
                    </ListItemButton>
                </List>
            </Collapse>
        </React.Fragment>
      )

  }

  function DataHeader(props){
    const { children, header, defaultOpen, ...other } = props;

    const [open, setOpen] = useState(defaultOpen)
    const handleClick = () => {
      setOpen(!open);
    };
    return (
        <React.Fragment>
            <ListItemButton onClick={handleClick}>
                <ListItemText primary={header}/>
                {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    {children}
                </List>
            </Collapse>
        </React.Fragment>
        
    )


  }

  DataHeader.propTypes = {
    children: PropTypes.node,
    header: PropTypes.node.isRequired,
    defaultOpen: PropTypes.bool,
};
DataHeader.defaultProps = {
    defaultOpen: false
}

  const InformationPanel = ({patientData, editable, value, index}) => { 
    return (
        <TabPanel value={value} index={index}>
            <Grid container spacing={2}>
                <Grid item container direction="column" justifyContent="space-evenly" alignItems="flex-start" xs={6}>
                    <Typography variant="h4">Contact Info</Typography>
                    <Typography variant="body2">Email: {patientData.email}</Typography>
                    {
                        Object.keys(patientData.contact).map(key => {
                            return (
                                <Grid item key={key}><Typography variant="body2">{capitalizeFirstLetter(key)}: {patientData[key]}</Typography></Grid>
                            )
                        })
                    }
                </Grid>
                    <div style={{margin: "2%"}}/>
                    <Grid xs={4} item>
                    <Typography variant="h4">Providers</Typography>
                        <Typography>Mental health provider? {patientData.provider.mental ? <IconButton component={Link} key={"user"} to={navs.navlink.to.provider(patientData.provider.mental.url)}>{patientData.provider.mental.first_name} {patientData.provider.mental.last_name}</IconButton> : "no"}</Typography>
                        <Typography>Primary Care Provider? {patientData.provider.phys ? "yes" : "no"}</Typography>
                        {editable && <NewPatientCode patient={patientData}/>}
                </Grid>
            </Grid>
        </TabPanel>
    )
  }

  const MedicalDataPanel = ({ patientData, setCurrentProduct, setDrawerOpen, value, index }) => { 
    // where the de-jargoning will happen
    const drugs = patientData["prescriptions"]
    const drugList = drugs.split(",")
    function getDrugLabel(drug) {
        fetchJSON(`api/drug/${drug}`).then(data =>{
            setCurrentProduct({"drug": drug, "results": data["label"]["results"], "counts": data["reaction_counts"]["results"].slice(0, 9)})
            setDrawerOpen(true)
        })
    }

    return (
        <TabPanel value={value} index={index}>
            <Grid container spacing={2}>
                <Grid item container direction="column" justifyContent="space-evenly" alignItems="flex-start">
                    <Typography variant="h4">Prescriptions</Typography>
                    <ul>
                    {drugList.map(drug => {
                        const product = drug.split(" | ")[1]
                        return(
                            <li>
                                <IconButton key={product} onClick={() => getDrugLabel(product)}><Typography>{drug}</Typography></IconButton>
                            </li>
                        )
                    })}
                    </ul>
                </Grid>
            </Grid>
            
        </TabPanel>
    )
  }

  const TreatmentPanel = ({plan, setPlan, author, patientId, value, index}) => { 
    const [note, setNote] = useState("")
    const handleNoteChange = (event) => {
        setNote(event.target.value)
    }

    const handlePlanRefresh = () => {
        setPlan(null)
        fetchJSON("api/treatment/get").then(data => {
            setPlan(data.plan_note)
        })
    }

    const handleSubmitNote = () => {
        data = {
            "authorId": author.url_id,
            "authorType": author.provider_type,
            "patientId": patientId,
            "note": note,
        }
        postJSON("api/treatment/note/add", data).then(response => {
            if(!response.ok){
                throw Error(response.statusText)
            }
            return response.json()
        }).then(ret_data => {
            handlePlanRefresh()
        })

    }

    // send note to back then refresh notes

    return (
        <TabPanel value={value} index={index}>
            <Grid container spacing={2}>
                <Grid item container direction="column" justifyContent="space-evenly" alignItems="flex-start">
                    {plan == null && <CircularProgress />}
                    {plan != null && plan.length < 0 ? <Grid item><Typography variant="h4">No treatment plan implemented.</Typography></Grid> : 
                        <Grid container spacing={2} direction="row" item>
                            {plan != null && plan.map(tnote => {
                                return(
                                    <Grid container direction="column" item>
                                        <Box sx={{ borderRadius: 16 }}>
                                            <Typography>{tnote.note}</Typography>
                                            <Typography variant="caption">{tnote.timestamp} - {tnote.author}</Typography>
                                            {tnote.comments.map(comment => {
                                                return(
                                                    <Box>
                                                        <Typography variant="subtitle1">{comment.contents}</Typography>
                                                        <Typography variant="caption">{comment.timestamp} - {comment.author}</Typography>
                                                    </Box>
                                                )
                                            })}
                                        </Box>
                                    </Grid>
                                )
                            })}
                        </Grid> 
                    }
                </Grid>
                <Grid item justifyContent="space-evenly" alignItems="flex-start" style={{width: "100%"}}>
                        <HDTextField style={{width: "60%"}} multiline variant="outlined" value={note} onChange={handleNoteChange} placeholder="Add new treatment note..."/>
                        <IconButton onClick={() => handleSubmitNote()} disabled={note.length == 0}><Typography variant="overline">Add Treatment Note</Typography></IconButton>
                </Grid>
            </Grid>
        </TabPanel>
    )
  }

const PatientPage = ({ loggedInUserData, patientUrlId }) => {
    const [value, setValue] = React.useState(0);
    const [patientData, setPatientData] = useState({})
    const [loadOnce, setLoadOnce] = useState(null)
    const editable = loggedInUserData.url == patientUrlId
    const [isProvider, setIsProvider] = useState(false)
    const [patientPlan, setPatientPlan] = useState(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [product, setCurrentProduct] = useState({})

    React.useEffect(() => {
        fetchJSON(`api/patient/${patientUrlId}`).then(data => {
            setIsProvider((loggedInUserData.provider_type == "mental" && loggedInUserData.url == data["user_data"].provider.mental.url) || (loggedInUserData.provider_type == "phys" && loggedInUserData.url == data["user_data"].provider.phys.url))
            setPatientData(data["user_data"])
        })

    }, [loadOnce])
    console.log(product)

    React.useEffect(() => {
        if(isProvider){
            postJSON(`api/treatment/get`, {patientId: patientUrlId}).then(response => {
                if(!response.ok){
                    throw Error(response.statusText)
                }
                return response.json()
            }).then(data => {
                console.log(data)
                setPatientPlan(data.plan_note)
            })
        }
    }, [isProvider])

    const handleDrawerClose = () => {
        setDrawerOpen(false)
        setCurrentProduct({})
    }

    if(Object.keys(patientData).length === 0){
        return (
            <div>
                <CircularProgress />
                <Typography variant="overline">Loading . . .</Typography>
            </div>
        )
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
      };

    function CapString(str){
        const arr = str.split(" ");
        for (var i = 0; i < arr.length; i++) {
            arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);

        }
        return arr.join(" ");
    }

    const
      isObject = v => v && typeof v === 'object' && !Array.isArray(v),
      recursion = (item, path = '') => isObject(item)
          ? Object
              .keys(item)
              .flatMap(k => recursion(item[k], k))
          : { item, path };

    const formatKey = (key) => {
        return CapString(key.replaceAll("_", " "))
    }

    const omitHeaders = ["set_id", "effective_time", "version", "spl_set_id", "spl_id"]

    const removeOutliers = (count_dict) => {
        count_dict.sort(function (a, b) {
            return a.count - b.count;
        });
        const counts = count_dict.map(c => c.count)
        const q1 = quantile(counts, 0.25)
        const q3 = quantile(counts, 0.75)
        const qrange = interquartileRange(counts)

        let step2 = qrange * 1.5
        let upperLimit = step2 + q3
        let lowerLimit = q1 - step2

        return count_dict.filter(c => c.count > lowerLimit && c.count < upperLimit)
    }


    return(
        <React.Fragment>
             <Box sx={{ flexGrow: 1, background: "transparent", display: 'block', height: "100%"}}>
                <Typography variant="h2">{patientData.title}{patientData.first_name} {patientData.last_name}</Typography>
                <div style={{margin: "2%"}}/>
                <div style={{display: "flex"}}>
                    <Tabs
                        orientation="vertical"
                        variant="scrollable"
                        value={value}
                        onChange={handleChange}
                        aria-label="Vertical tabs example"
                        sx={{ borderRight: 1, borderColor: 'divider',  height: "inherit" }}
                    >
                        <Tab label="General Info" {...a11yProps(0)} />
                        {isProvider && <Tab label="Medical Data" {...a11yProps(1)} />}
                        {isProvider && <Tab label="Treatment Plan" {...a11yProps(2)} />}
                    </Tabs>
                    <InformationPanel patientData={patientData} editable={editable} value={value} index={0}/>
                    {isProvider && <MedicalDataPanel patientData={patientData} setCurrentProduct={setCurrentProduct} setDrawerOpen={setDrawerOpen} value={value} index={1} />}
                    {isProvider && <TreatmentPanel plan={patientPlan} setPlan={setPatientPlan} author={loggedInUserData} value={value} index={2} />}
                </div>
            </Box>
                {isProvider && <DetailDrawer
                    sx={{
                    width: "30%",
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: "30%",
                    }}}
                    variant="persistent"
                    anchor="right"
                    open={drawerOpen}
                >
                    <DrawerHeader>
                        <IconButton onClick={handleDrawerClose}>X</IconButton>
                        <Typography>{product["drug"]}</Typography>
                    </DrawerHeader>
                    <Divider />
                    <Typography variant="overline">The following data from the FDA is intended only for your informational purposes. Please do not use it to make medical decisions.</Typography>
                    <Divider />
                        <List>                
                            {product["results"] && product["results"].map((result, index) => {
                                return (
                                        <DataHeader header={<Typography variant="h4">Result {product["results"].length > 1 && index}</Typography>} defaultOpen={product["results"].length == 1}>
                                            <List>
                                                {recursion(result).map(deet => {
                                                    // if ingredients in path; offer ingredient search
                                                    if(omitHeaders.findIndex(element => element.includes(deet["path"])) == -1){
                                                        return(
                                                                <DataSection header={formatKey(deet["path"])} body={deet["item"]}/>
                                                        )
                                                    }
                                                })}
                                            </List>
                                        </DataHeader>
                                        
                                )
                            })}
                            {product["counts"] && (
                                    <DataHeader header={<Typography variant="h4">Surveyed Symptom Count</Typography>}>
                                        <Typography variant="subtitle1">Top 10 Results</Typography>
                                        <List>
                                            {product["counts"].map(result => {
                                                return(
                                                    <ListItem>
                                                        <ListItemText primary={<Typography variant="body2">{result["term"]}: {result["count"]}</Typography>}/>
                                                    </ListItem>
                                                )
                                            })}
                                        </List>
                                    </DataHeader>
                                )
                            }
                        </List>
                            
                </DetailDrawer>}
        </React.Fragment>
    )
}

export default PatientPage;