import React from 'react'
import { useSelector } from 'react-redux';

import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, StyledEngineProvider } from '@mui/material';
import { esES } from '@mui/material/locale';

// routing
import Routes from 'routes';

// defaultTheme
import themes from 'themes';

// project imports
import NavigationScroll from 'layout/NavigationScroll';
import axios from 'axios';

// ==============================|| APP ||============================== //

const App = () => {
    let customization = useSelector((state) => state.customization);
    customization = {...customization,esES}
    // console.log('Ambiente = ', process.env)
    if (process.env.NODE_ENV === "production"){
        axios.defaults.baseURL=process.env.REACT_APP_API_BASE_URL || 'http://localhost:3500';
        console.log('Base URL :', axios.defaults.baseURL)
    } else {
        axios.defaults.baseURL='http://localhost:3500';
    }
    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={themes(customization)}>
                <CssBaseline />
                <NavigationScroll>
                    <Routes />
                </NavigationScroll>
            </ThemeProvider>
        </StyledEngineProvider>
    );
};

export default App;
