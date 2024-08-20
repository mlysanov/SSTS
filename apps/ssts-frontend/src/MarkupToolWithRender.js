import { Button, Toolbar, Typography } from '@mui/material'
import { Title as TitleIcon } from '@mui/icons-material'
import LinkIcon from '@mui/icons-material/Link';
import TranslateIcon from '@mui/icons-material/Translate';
import React, {useState, useEffect} from 'react'
import ReactDOM from 'react-dom';
import Draggable from 'react-draggable'

const projectName = "{{projectName}}";

let container = document.createElement('div');
container.id = 'markup-tool-container';
document.body.appendChild(container);

ReactDOM.render(
    React.createElement(MarkupTool),
    container
);

function MarkupTool() {

    const [activeButton, setActiveButton] = useState('');

    useEffect(() => {
        const fetchInitialState = async () => {
            try {
                const response = await fetch(`${window.location.protocol}//${window.location.hostname}/api/projectMetaData/${projectName}/getStatusOfTranslatedPage`);
                const data = await response.json();
                if (data.status) {
                    setActiveButton(data.status);
                }
            } catch (error) {
                console.error('Something went wrong when getting the page translation status', error);
            }
        };
        fetchInitialState();
    }, []);

    const handleTranslateClick = (buttonName) => {
        setActiveButton(buttonName);
        try {
            const response = fetch(`${window.location.protocol}//${window.location.hostname}/api/projectMetaData/${projectName}/setStatusOfTranslatedPage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'translate'
                })
            });
            window.location.reload();
        } catch (error) {
            console.error('Something went wrong when trying to change the status of the translated page', error);
        }
    }

    const handleBrowseClick = (buttonName) => {
        setActiveButton(buttonName);
        try {
            const response = fetch(`${window.location.protocol}//${window.location.hostname}/api/projectMetaData/${projectName}/setStatusOfTranslatedPage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'browse'
                })
            });
            window.location.reload();
        } catch (error) {
            console.error('Something went wrong when trying to change the status of the translated page', error);
        }
    }


    const handleTranslateTitleClick = (buttonName) => {
        setActiveButton(buttonName);
        try {
            const response = fetch(`${window.location.protocol}//${window.location.hostname}/api/projectMetaData/${projectName}/setStatusOfTranslatedPage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'translateTitle'
                })
            });
            window.location.reload();
        } catch (error) {
            console.error('Something went wrong when trying to change the status of the translated page', error);
        }
    }

    const isActive = (buttonName) => activeButton === buttonName;

    return (
        <>
            <Draggable>
                <Typography style={{
                    padding: '10px',
                    display: 'block',
                    position: 'fixed',
                    top: '75px',
                    zIndex: 999,
                    right: '20px',
                    width: '290px',
                    overflowY: 'none',
                    border: 'solid 2px lightgrey',
                    backgroundColor: 'white',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(0,0,0,0.3)',
                    fontSize: '14px' }}>
                    <Toolbar style={{ display: 'flex', flexDirection: 'column' }}>
                        <Button
                            variant="outlined"
                            style={{width:'220px', marginTop:'20px'}}
                            size="small"
                            color={isActive('translate') ? "primary" : "inherit"}
                            startIcon={<TranslateIcon />}
                            onClick={() => handleTranslateClick('translate')}>
                            Translate
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            style={{width:'220px', marginTop: '10px'}}
                            color={isActive('browse') ? "primary" : "inherit"}
                            startIcon={<LinkIcon />}
                            onClick={() => handleBrowseClick('browse')}
                        >
                            Browse
                        </Button>
                        <Button
                            variant="outlined"
                            style={{width:'220px', marginTop: '10px', marginBottom: '20px'}}
                            size="small"
                            color={isActive('translateTitle') ? "primary" : "inherit"}
                            startIcon={<TitleIcon />}
                            onClick={() => handleTranslateTitleClick('translateTitle')}>
                            Translate title
                        </Button>
                    </Toolbar>
                </Typography>
            </Draggable>
        </>
    );
}