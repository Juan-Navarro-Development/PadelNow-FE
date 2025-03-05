/* eslint-disable no-unused-vars */

// material-ui
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoDark from 'assets/images/logo-dark.svg';
 * import logo from 'assets/images/logo.svg';
 *
 */

// ==============================|| LOGO SVG ||============================== //

const Logo = () => {
    return (
        <>
            <img src={require('./../assets/images/padel_icon.png')} alt='logo' height={45} />
          
        </>
    );
};

export default Logo;
