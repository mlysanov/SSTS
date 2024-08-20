import React, { useState, useEffect } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {useAuth} from "./authContext";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";


const ProjectList = ({projects, fetchProjects}) => {
    const { authHeader, userRole } = useAuth();
    const [expanded, setExpanded] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [projectMetaData, setProjectMetaData] = useState({
        pathToSourceArchive: '',
        counterOfUntranslatedWords: null,
        pathsToHTML: [],
    });
    const [initialCredentials, setInitialCredentials] = useState(null)
    const [projectCredentials, setProjectCredentials] = useState(initialCredentials);
    const [open, setOpen] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [isSaveChangesButtonDisabled, setIsSaveChangesButtonDisabled] = useState(true);


    useEffect(() => {
        const credentialsUnchanged = initialCredentials &&
            initialCredentials.login === projectCredentials.login &&
            initialCredentials.password === projectCredentials.password

        const credentialsFilled = projectCredentials && projectCredentials.login.length > 0 && projectCredentials.password.length > 0;

        if (credentialsFilled) {
            if (credentialsUnchanged) {
                setIsSaveChangesButtonDisabled(true);
            } else {
                setIsSaveChangesButtonDisabled(false);
            }
        } else {
            setIsSaveChangesButtonDisabled(true);
        }
    }, [projectCredentials]);

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
        if (isExpanded) {
            handleClickOpen(panel);
        }
    };

    const handleChangeCredentials = (e) => {
        const { name, value } = e.target;

        if (name === "login") {
            setProjectCredentials({
                "login": value,
                "password": projectCredentials.password
            })
        } else if (name === "password") {
            setProjectCredentials({
                "login": projectCredentials.login,
                "password": value
            })
        }
    };

    const handleClickOpen = (project) => {
        setInitialCredentials({
            login: project.login,
            password: project.password,
        })
        setProjectCredentials({
            login: project.login,
            password: project.password,
        })
        setSelectedProject(project);

        // setOpen(true);
        fetchProjectData(project.name);
    };

    const handleClickOpenEditBtn = () => {
        setIsSaveChangesButtonDisabled(true);
        setOpenEditDialog(true);
    }

    const handleSaveChangesEditDialog = () => {
        try {
            fetch(`${window.location.protocol}//${window.location.hostname}/api/changeProjectCredentials`, {
                method: 'POST',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json',
                    credentials: "include"
                },
                body: JSON.stringify({
                    "projectName": selectedProject.name,
                    "currentLogin": initialCredentials.login,
                    "currentPassword": initialCredentials.password,
                    "newLogin": projectCredentials.login,
                    "newPassword": projectCredentials.password
                }),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('HTTP Error: ' + response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    handleClose();
                    fetchProjects();
                })
                .catch((error) => {
                    console.error('Error when sending data:', error);
                });
        } catch (error) {
            console.error("Error when changing login and password:", error);
        }
        handleCloseEditDialog();
    }

    const handleCloseEditDialog = () => {
        setIsSaveChangesButtonDisabled(true);
        setOpenEditDialog(false);
    }

    const handleClose = () => {
        setIsSaveChangesButtonDisabled(true);
        setOpen(false);
    };

    const handleClickOpenDeleteDialog = () => {
        setOpenDeleteModal(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteModal(false);
    };

    const handleConfirmDelete = () => {
        if (selectedProject) {
            fetch(`${window.location.protocol}//${window.location.hostname}/api/deleteProject/${selectedProject.name}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json',
                },
                credentials: "include"
            })
            .then(response => {
                if (response.ok) {
                    setOpenDeleteModal(false);
                    fetchProjects();
                } else {
                    console.error('Project deletion error:', response.statusText);
                }
            }).catch(error => {
                console.error(error);
            })
            setOpenDeleteModal(false);
            console.log(selectedProject + " was deleted");
        }
    };

    const handlePrepareProject = () => {
        try {
            fetch(`${window.location.protocol}//${window.location.hostname}/api/prepareProject`, {
                method: 'POST',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({projectName: selectedProject.name}),
                credentials: "include"
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('HTTP Error: ' + response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    handleClose();
                    fetchProjects();
                })
                .catch((error) => {
                    console.error('Error when sending data:', error);
                });
        } catch (error) {
            console.error("Error occurred during the preparation of the project:", error);
        }
        handleClose();
    };

    const handleGetResult = () => {
        try {
            fetch(`${window.location.protocol}//${window.location.hostname}/api/resultZip/${selectedProject.name}`, {
                method: 'GET',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json'
                },
                credentials: "include"
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('HTTP Error: ' + response.status);
                    }
                    return response.blob();
                })
                .then(blob => {
                    const url = window.URL.createObjectURL(new Blob([blob]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `${selectedProject.name}.zip`);
                    document.body.appendChild(link);
                    link.click();
                    link.parentNode.removeChild(link);

                    handleClose();
                    fetchProjects();
                })
                .catch((error) => {
                    console.error('Error loading the archive:', error);
                });
        } catch (error) {
            console.error("An error occurred during the preparation of the project:", error);
        }
        handleClose();
    };

    const handleGetFileWithSourceText = () => {
        try {
            fetch(`${window.location.protocol}//${window.location.hostname}/api/downloadSourceText/${selectedProject.name}`, {
                method: 'GET',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json'
                },
                credentials: "include"
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('HTTP Error: ' + response.status);
                    }
                    return response.blob();
                })
                .then(blob => {
                    const url = window.URL.createObjectURL(new Blob([blob]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `${selectedProject.name}_SourceText.txt`);
                    document.body.appendChild(link);
                    link.click();
                    link.parentNode.removeChild(link);

                    handleClose();
                    fetchProjects();
                })
                .catch((error) => {
                    console.error('Error loading the archive:', error);
                });
        } catch (error) {
            console.error("An error in the preparation of the project:", error);
        }
        handleClose();
    };

    const handleRefreshMetaData = () => {
        try {
            fetch(`${window.location.protocol}//${window.location.hostname}/api/refreshMetaData`, {
                method: 'POST',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json'
                },
                credentials: "include",
                body: JSON.stringify({projectName: selectedProject.name}),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('HTTP Error: ' + response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    handleClose();
                    fetchProjects();
                })
                .catch((error) => {
                    console.error('Error when sending data:', error);
                });
        } catch (error) {
            console.error("An error occurred during the preparation of the project:", error);
        }
        handleClose();
    };

    const fetchProjectData = (projectName) => {
        fetch(`${window.location.protocol}//${window.location.hostname}/api/projectMetaData/` + projectName, {
            method: 'GET',
            headers: {
                'Authorization': authHeader
            },
            credentials: "include"
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('HTTP Error: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                const {pathToSourceArchive, counterOfUntranslatedWords, pathsToHTML} = data;
                setProjectMetaData({
                    pathToSourceArchive: pathToSourceArchive,
                    counterOfUntranslatedWords: counterOfUntranslatedWords,
                    pathsToHTML: pathsToHTML
                });
            })
            .catch((error) => {
                console.error('Error loading projects:', error);
            });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', cursor: 'pointer' }}>
            {projects.map((project, index) => (
                <Accordion key={index} expanded={expanded === project} onChange={handleChange(project)} style={{width: '100%', marginBottom: '20px'}}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon/>} aria-controls={`panel${index}-content`}
                                      id={`panel${index}-header`}>
                        <div style={{display: 'flex', flexDirection: 'column'}}>
                            <Typography variant="h5" component="div">
                                {project.name}
                            </Typography>
                            <Typography variant="h7" component="div" style={{marginTop: '5px'}}>
                                {project.sourceLocale} => {project.targetLocale}
                            </Typography>
                        </div>
                    </AccordionSummary>
                    <AccordionDetails>


                        {userRole === 'ROLE_ADMIN' && (
                            <>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Translator login: {selectedProject ? selectedProject.login : ''}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Translator password: {selectedProject ? selectedProject.password : ''}
                                </Typography>
                            </>
                        )}
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Number of words in the source: {projectMetaData.counterOfUntranslatedWords}
                            <Button color="primary" size="small" onClick={() => {handleGetFileWithSourceText()}}>Download source text</Button>
                        </Typography>
                        <div style={{marginTop: "30px", display: "flex"}}>
                            <div style={{flex: '0 0 20%', paddingLeft: '10px'}}>
                                Untranslated / Total nodes
                            </div>
                            <div style={{flex: "0 0 70%"}}>
                                Link to page for translate
                            </div>

                        </div>
                        <div style={{maxHeight: '300px', overflow: 'auto', marginTop: "10px"}}>
                            {projectMetaData.pathsToHTML.map((pathToHTML, index) => (
                                <div style={{
                                    display: 'flex',
                                    height: "50px",
                                    alignItems: "center",
                                    backgroundColor: index % 2 === 0 ? '#f0f0f0' : 'transparent'
                                }}>
                                    <div style={{flex: "0 0 20%", paddingLeft: "10px"}}>
                                        {`${pathToHTML.counterOfUntranslatedTextNodes} / ${pathToHTML.counterOfTextNodes}`}
                                    </div>
                                    <div style={{flex: "0 0 70%"}}>
                                        <Typography key={index} variant="body2" color="textSecondary" gutterBottom>
                                            {(() => {
                                                    if (pathToHTML.path.startsWith(`/home/resources/projects/${project.name}/work/site/`)) {
                                                        return (
                                                            <a href={`${window.location.protocol}//${window.location.hostname}/api/files/` + pathToHTML.path.replace('/home/resources/projects/', '')}
                                                               target="_blank">{pathToHTML.path.replace(`/home/resources/projects/${project.name}/work/site/`, '')}</a>
                                                        )
                                                    } else {
                                                        return (
                                                            <a href={`${window.location.protocol}//${window.location.hostname}/api/files/` + pathToHTML.path.replace('/home/resources/projects/', '')}
                                                               target="_blank">{pathToHTML.path.replace(`/home/resources/projects/${project.name}/work/`, '')}</a>
                                                        )
                                                    }
                                            })()}
                                        </Typography>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {userRole === 'ROLE_ADMIN' && (
                            <>
                                <Button onClick={() => handleClickOpenDeleteDialog(project)} color="error"
                                        style={{marginTop: '20px'}}>
                                    Delete
                                </Button>
                                <Button onClick={() => handleClickOpenEditBtn(project)} color="primary"
                                        style={{marginTop: '20px'}}>
                                    Edit
                                </Button>
                                <Button color="primary" onClick={() => {handlePrepareProject()}}
                                        style={{marginTop: '20px'}}>
                                    Prepare
                                </Button>
                                <Button color="primary" onClick={() => {handleGetResult()}}
                                        style={{marginTop: '20px'}}>
                                    Get result
                                </Button>
                            </>
                        )}
                        <Button color="primary" onClick={() => {handleRefreshMetaData()}}
                                style={{marginTop: '20px'}}>
                            Refresh
                        </Button>
                    </AccordionDetails>
                </Accordion>
            ))}

            <Dialog open={openDeleteModal} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the project "{selectedProject?.name}"?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openEditDialog} onClose={handleCloseEditDialog} style={{
                width: '100%',
                margin: 'auto'
            }}>
                <DialogTitle>Edit project data</DialogTitle>
                <DialogContent style={{
                    width: '500px'
                }}>
                    <DialogContentText>
                        Only available translator login & password to edit
                    </DialogContentText>
                    <InputLabel style={{marginTop: '20px'}}>Name</InputLabel>
                    <TextField
                        autoFocus
                        name="name"
                        variant="filled"
                        fullWidth
                        value={selectedProject ? selectedProject.name : ''}
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                    <InputLabel style={{marginTop: '20px'}}>Translator login</InputLabel>
                    <TextField
                        name="login"
                        variant="filled"
                        fullWidth
                        defaultValue={selectedProject ? selectedProject.login : ''}
                        onChange={handleChangeCredentials}
                    />
                    <InputLabel style={{marginTop: '20px'}}>Translator password</InputLabel>
                    <TextField
                        name="password"
                        variant="filled"
                        fullWidth
                        defaultValue={selectedProject ? selectedProject.password : ''}
                        onChange={handleChangeCredentials}
                    />
                    <InputLabel style={{marginTop: '20px'}}>Source locale</InputLabel>
                    <TextField
                        name="password"
                        variant="filled"
                        fullWidth
                        value={selectedProject ? selectedProject.sourceLocale : ''}
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                    <InputLabel style={{marginTop: '20px'}}>Target locale</InputLabel>
                    <TextField
                        name="password"
                        variant="filled"
                        fullWidth
                        value={selectedProject ? selectedProject.targetLocale : ''}
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSaveChangesEditDialog} color="primary" disabled={isSaveChangesButtonDisabled}>
                        Save changes
                    </Button>
                    <Button onClick={handleCloseEditDialog} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ProjectList;
