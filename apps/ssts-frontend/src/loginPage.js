import React, { useState } from 'react';
import Button from '@mui/material/Button'
import { useAuth } from './authContext';
import TextField from '@mui/material/TextField'

const LoginPage = () => {

    const formStyles = {
        textAlign: 'center',
        margin: '20vh'
    }

    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            await login(username, password);
        } catch (err) {
            console.error('Authentication failed', err);
        }
    };

    return (
        <form style={formStyles} method="post" onSubmit={handleLogin}>
            <div>
                <TextField id="useranme" label="Username" size="small" variant="filled"
                           onChange={(e) => setUsername(e.target.value)}/>
            </div>
            <div>
                <TextField id="password" label="Password" type="password" size="small" variant="filled"
                           margin="dense" onChange={(e) => setPassword(e.target.value)}/>
            </div>
            <Button variant="contained" size="small" type="submit">Log In</Button>
        </form>
    );
};

export default LoginPage;
