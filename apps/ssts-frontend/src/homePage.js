import React, {useState} from 'react';
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import { useAuth } from './authContext';
import ProjectsList from "./projectsList";

const HomePage = () => {

    const { isAuthenticated, logout, authHeader, userRole } = useAuth();

    const [open, setOpen] = useState(false);
    const [sourceLocale, setSourceLocale] = useState('');
    const [targetLocale, setTargetLocale] = useState('');
    const [projectData, setProjectData] = useState({
        name: '',
        login: '',
        password: '',
        sourceLocale: '',
        targetLocale: ''
    });
    const [projectFile, setProjectFile] = useState(null);

    const [projects, setProjects] = useState([]);

    const handleLogout = () => {
        console.log('Log out');
        logout()
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;

        if (type === 'file') {
            setProjectFile(e.target.files[0]);
        } else {
            setProjectData({
                ...projectData,
                [name]: value
            });
        }
    };


    const handleSourceLocaleChange = (e) => {
        setSourceLocale(e.target.value);
    };

    const handleTargetLocaleChange = (e) => {
        setTargetLocale(e.target.value);
    };


    const handleSubmit = () => {
        const formData = new FormData();

        const fileExtension = projectFile.name.split('.').pop().toLowerCase();
        const validMimeTypes = ['application/zip', 'application/x-zip-compressed', 'application/x-zip'];
        if (!projectFile || !validMimeTypes.includes(projectFile.type) || fileExtension !== 'zip') {
            console.error('ZIP file is not selected or the type is incorrect');
            return;
        }

        formData.append('zipFile', projectFile);
        projectData['sourceLocale'] = sourceLocale;
        projectData['targetLocale'] = targetLocale;
        formData.append('projectData', JSON.stringify(projectData));

        fetch(`${window.location.protocol}//${window.location.hostname}/api/saveProject`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader
            },
                    body: formData,
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('HTTP Error: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                // console.log('Data has been sent successfully:', data);
                handleClose();
                fetchProjects();
            })
            .catch((error) => {
                console.error('Error sending data:', error);
            });
    };

    const fetchProjects = () => {
        fetch(`${window.location.protocol}//${window.location.hostname}/api/getProjects`, {
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
                const projectsArray = Object.keys(data).map(key => data[key]);
                setProjects(projectsArray);
            })
            .catch((error) => {
                console.error('Error loading projects:', error);
            });
    };


    if (!isAuthenticated) {
        window.location.href = '/login';
    }

    return (
        <>


            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: '30px'}}>
                {userRole === 'ROLE_ADMIN' && (
                    <div style={{marginRight: 'auto', marginLeft: "30px"}}>
                        <Button variant="contained" size="small" onClick={handleClickOpen}>Create new project</Button>
                    </div>
                )}

                <div style={{marginRight: '30px'}}>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <Button variant="contained" size="small" onClick={handleLogout}>Log Out</Button>
                    </form>
                </div>
            </div>

            <div style={{marginTop: '50px'}}>
                <ProjectsList projects={projects} fetchProjects={fetchProjects}/>
            </div>

            <Dialog open={open} onClose={handleClose} style={{
                width: '100%',
                margin: 'auto'
            }}>
                <DialogTitle>Create a project</DialogTitle>
                <DialogContent style={{
                    width: '500px'
                }}>
                    <DialogContentText>
                        Enter project information
                    </DialogContentText>
                    <InputLabel style={{marginTop: '20px'}}>Name</InputLabel>
                    <TextField
                        autoFocus
                        name="name"
                        variant="filled"
                        fullWidth
                        onChange={handleChange}
                    />
                    <InputLabel style={{marginTop: '20px'}}>Translator login</InputLabel>
                    <TextField
                        name="login"
                        variant="filled"
                        fullWidth
                        onChange={handleChange}
                    />
                    <InputLabel style={{marginTop: '20px'}}>Translator password</InputLabel>
                    <TextField
                        name="password"
                        variant="filled"
                        fullWidth
                        onChange={handleChange}
                    />
                    <InputLabel style={{marginTop: '20px'}}>Source locale</InputLabel>
                    <Select
                        name="sourceLocale"
                        value={sourceLocale}
                        onChange={handleSourceLocaleChange}
                        variant="filled"
                        fullWidth
                    >
                        {/*<MenuItem value="en-US">ar_AE</MenuItem>*/}
                        {/*<MenuItem value="en-US">ar_BH</MenuItem>*/}
                        {/*<MenuItem value="en-US">ar_DJ</MenuItem>*/}
                        {/*<MenuItem value="en-US">ar_DZ</MenuItem>*/}
                        {/*<MenuItem value="en-US">ar_EG</MenuItem>*/}
                        {/*<MenuItem value="en-US">ar_EH</MenuItem>*/}
                        {/*<MenuItem value="en-US">ar_ER</MenuItem>*/}
                        {/*<MenuItem value="en-US">ar_IL</MenuItem>*/}
                        {/*<MenuItem value="en-US">ar_IQ</MenuItem>*/}
                        {/*<MenuItem value="en-US">ar_IQ</MenuItem>*/}
                        {/*<MenuItem value="en-US">ar_JO</MenuItem>*/}
                        {/*<MenuItem value="en-US">ar_JO</MenuItem>*/}
                        {/*<MenuItem value="en-US">ar_KM</MenuItem>*/}
                        {/*<MenuItem value="en-US">ar_KW</MenuItem>*/}
                        {/*<MenuItem value="en-US">ar_LB</MenuItem>*/}
                        {/*<MenuItem value="en-US">ar_MA</MenuItem>*/}
                        {/*<MenuItem value="en-US">ar_MR</MenuItem>*/}
                        {/*<MenuItem value="en-US">ar_OM</MenuItem>*/}
                        {/*<MenuItem value="en-US">ar_PS</MenuItem>*/}
                        {/*<MenuItem value="en-US">ar_QA</MenuItem>*/}
                        {/*<MenuItem value="en-US">ar_SA</MenuItem>*/}
                        {/*<MenuItem value="en-US">ar_SD</MenuItem>*/}
                        {/*<MenuItem value="en-US">ar_SO</MenuItem>*/}
                        {/*<MenuItem value="en-US">ar_SS</MenuItem>*/}
                        {/*<MenuItem value="en-US">ar_SY</MenuItem>*/}
                        {/*<MenuItem value="en-US">ar_TD</MenuItem>*/}
                        {/*<MenuItem value="en-US">ar_TN</MenuItem>*/}
                        {/*<MenuItem value="en-US">ar_YE</MenuItem>*/}
                        {/*<MenuItem value="en-US">as_IN</MenuItem>*/}
                        {/*<MenuItem value="en-US">asa_TZ</MenuItem>*/}
                        {/*<MenuItem value="en-US">az_Cyrl</MenuItem>*/}
                        {/*<MenuItem value="en-US">az_Cyrl_AZ</MenuItem>*/}
                        {/*<MenuItem value="en-US">az_Latn</MenuItem>*/}
                        {/*<MenuItem value="en-US">az_Latn_AZ</MenuItem>*/}
                        {/*<MenuItem value="en-US">bas_CM</MenuItem>*/}
                        {/*<MenuItem value="en-US">be_BY</MenuItem>*/}
                        {/*<MenuItem value="en-US">bem_ZM</MenuItem>*/}
                        {/*<MenuItem value="en-US">bez_TZ</MenuItem>*/}
                        {/*<MenuItem value="en-US">bg_BG</MenuItem>*/}
                        {/*<MenuItem value="en-US">bm_ML</MenuItem>*/}
                        {/*<MenuItem value="en-US">bn_BD</MenuItem>*/}
                        {/*<MenuItem value="en-US">bn_BD</MenuItem>*/}
                        {/*<MenuItem value="en-US">bn_IN</MenuItem>*/}
                        {/*<MenuItem value="en-US">bn_IN</MenuItem>*/}
                        {/*<MenuItem value="en-US">bo_CN</MenuItem>*/}
                        {/*<MenuItem value="en-US">bo_IN</MenuItem>*/}
                        {/*<MenuItem value="en-US">br_FR</MenuItem>*/}
                        {/*<MenuItem value="en-US">brx_IN</MenuItem>*/}
                        {/*<MenuItem value="en-US">bs_Cyrl</MenuItem>*/}
                        {/*<MenuItem value="en-US">bs_Cyrl_BA</MenuItem>*/}
                        {/*<MenuItem value="en-US">bs_Latn</MenuItem>*/}
                        {/*<MenuItem value="en-US">bs_Latn_BA</MenuItem>*/}
                        {/*<MenuItem value="en-US">ca_AD</MenuItem>*/}
                        {/*<MenuItem value="en-US">ca_ES</MenuItem>*/}
                        {/*<MenuItem value="en-US">ca_FR</MenuItem>*/}
                        {/*<MenuItem value="en-US">ca_IT</MenuItem>*/}
                        {/*<MenuItem value="en-US">ce_RU</MenuItem>*/}
                        {/*<MenuItem value="en-US">cgg_UG</MenuItem>*/}
                        {/*<MenuItem value="en-US">chr_US</MenuItem>*/}
                        {/*<MenuItem value="en-US">cs_CZ</MenuItem>*/}
                        {/*<MenuItem value="en-US">cy_GB</MenuItem>*/}
                        {/*<MenuItem value="en-US">da_DK</MenuItem>*/}
                        {/*<MenuItem value="en-US">dav_KE</MenuItem>*/}
                        {/*<MenuItem value="en-US">de_AT</MenuItem>*/}
                        {/*<MenuItem value="en-US">de_BE</MenuItem>*/}
                        {/*<MenuItem value="en-US">de_CH</MenuItem>*/}
                        {/*<MenuItem value="en-US">de_DE</MenuItem>*/}
                        {/*<MenuItem value="en-US">de_IT</MenuItem>*/}
                        {/*<MenuItem value="en-US">de_LI</MenuItem>*/}
                        {/*<MenuItem value="en-US">de_LU</MenuItem>*/}
                        {/*<MenuItem value="en-US">dje_NE</MenuItem>*/}
                        {/*<MenuItem value="en-US">dsb_DE</MenuItem>*/}
                        {/*<MenuItem value="en-US">dua_CM</MenuItem>*/}
                        {/*<MenuItem value="en-US">dyo_SN</MenuItem>*/}
                        {/*<MenuItem value="en-US">dz_BT</MenuItem>*/}
                        {/*<MenuItem value="en-US">ebu_KE</MenuItem>*/}
                        {/*<MenuItem value="en-US">ee_GH</MenuItem>*/}
                        {/*<MenuItem value="en-US">ee_TG</MenuItem>*/}
                        {/*<MenuItem value="en-US">el_CY</MenuItem>*/}
                        {/*<MenuItem value="en-US">el_GR</MenuItem>*/}
                        {/*<MenuItem value="en-US">en_AG</MenuItem>*/}
                        {/*<MenuItem value="en-US">en_AI</MenuItem>*/}
                        {/*<MenuItem value="en-US">en_AS</MenuItem>*/}
                        {/*<MenuItem value="en-US">en_AT</MenuItem>*/}
                        {/*<MenuItem value="en-US">en_AU</MenuItem>*/}
                        {/*<MenuItem value="en-US">en_BB</MenuItem>*/}
                        {/*<MenuItem value="en-US">en_BE</MenuItem>*/}
                        {/*<MenuItem value="en-US">en_BI</MenuItem>*/}
                        {/*<MenuItem value="en-US">en_BM</MenuItem>*/}
                        {/*<MenuItem value="en-US">en_BS</MenuItem>*/}
                        {/*<MenuItem value="en-US">en_BW</MenuItem>*/}
                        {/*<MenuItem value="en-US">en_BZ</MenuItem>*/}
                        {/*<MenuItem value="en-US">en_CA</MenuItem>*/}
                        {/*<MenuItem value="en-US">en_CC</MenuItem>*/}
                        {/*<MenuItem value="en-US">en_CH</MenuItem>*/}
                        {/*<MenuItem value="en-US">en_CK</MenuItem>*/}
                        {/*<MenuItem value="en-US">en_CM</MenuItem>*/}
                        {/*<MenuItem value="en-US">en_CX</MenuItem>*/}
                        {/*<MenuItem value="en-US">en_CY</MenuItem>*/}
                        {/*<MenuItem value="en-US">en_DE</MenuItem>*/}
                        {/*<MenuItem value="en-US">en_DG</MenuItem>*/}
                        {/*<MenuItem value="en-US">en_DK</MenuItem>*/}
                        {/*<MenuItem value="en-US">en_DM</MenuItem>*/}
                        {/*<MenuItem value="en-US">en_ER</MenuItem>*/}
                        {/*<MenuItem value="en-US">en_ER</MenuItem>*/}
                        {/*<MenuItem value="en-US"></MenuItem>*/}
                        {/*<MenuItem value="en-US"></MenuItem>*/}
                        {/*<MenuItem value="en-US"></MenuItem>*/}
                        {/*<MenuItem value="en-US"></MenuItem>*/}
                        {/*<MenuItem value="en-US"></MenuItem>*/}
                        {/*<MenuItem value="en-US"></MenuItem>*/}
                        {/*<MenuItem value="en-US"></MenuItem>*/}
                        {/*<MenuItem value="en-US"></MenuItem>*/}
                        {/*<MenuItem value="en-US"></MenuItem>*/}
                        {/*<MenuItem value="en-US"></MenuItem>*/}
                        {/*<MenuItem value="en-US"></MenuItem>*/}
                        {/*<MenuItem value="en-US"></MenuItem>*/}
                        {/*<MenuItem value="en-US"></MenuItem>*/}


                        <MenuItem value="en-US">en-US</MenuItem>
                        <MenuItem value="ru-RU">ru-RU</MenuItem>
                        <MenuItem value="fr-FR">fr-FR</MenuItem>
                        <MenuItem value="en-CA">en-CA</MenuItem>
                        <MenuItem value="en-GB">en-GB</MenuItem>
                        <MenuItem value="es-ES">es-ES</MenuItem>
                        <MenuItem value="es-AR">es-AR</MenuItem>
                        <MenuItem value="es-CO">es-CO</MenuItem>
                        <MenuItem value="pt-PT">pt-PT</MenuItem>
                        <MenuItem value="pt-BR">pt-BR</MenuItem>
                        <MenuItem value="zh-CN">zh-CN</MenuItem>
                        <MenuItem value="zh-HK">zh-HK</MenuItem>
                        <MenuItem value="zh-TW">zh-TW</MenuItem>
                    </Select>
                    <InputLabel style={{marginTop: '20px'}}>Target locale</InputLabel>
                    <Select
                        name="targetLocale"
                        value={targetLocale}
                        onChange={handleTargetLocaleChange}
                        fullWidth
                        variant="filled"
                    >
                        <MenuItem value="en-US">en-US</MenuItem>
                        <MenuItem value="ru-RU">ru-RU</MenuItem>
                        <MenuItem value="fr-FR">fr-FR</MenuItem>
                        <MenuItem value="en-CA">en-CA</MenuItem>
                        <MenuItem value="en-GB">en-GB</MenuItem>
                        <MenuItem value="es-ES">es-ES</MenuItem>
                        <MenuItem value="es-AR">es-AR</MenuItem>
                        <MenuItem value="es-CO">es-CO</MenuItem>
                        <MenuItem value="pt-PT">pt-PT</MenuItem>
                        <MenuItem value="pt-BR">pt-BR</MenuItem>
                        <MenuItem value="zh-CN">zh-CN</MenuItem>
                        <MenuItem value="zh-HK">zh-HK</MenuItem>
                        <MenuItem value="zh-TW">zh-TW</MenuItem>
                    </Select>
                    <InputLabel style={{marginTop: '20px'}}>Site archive file</InputLabel>
                    <TextField
                        name="projectFile"
                        type="file"
                        fullWidth
                        onChange={handleChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </>

    );
};

export default HomePage;
