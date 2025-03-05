/* eslint-disable no-unused-vars */

import React, { useEffect,useState } from "react";
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import { useNavigate } from "react-router-dom";
import { gapi } from 'gapi-script';
import axios from "axios";
import { useAlert } from 'react-alert';


const clientId = '922396994640-0g6k9ks443ps0hfqs60c4lnheqsrchpp.apps.googleusercontent.com';




function GoogleAuth() {
  const [profile, setProfile] = useState([]);
  const navigate = useNavigate();
  const alert = useAlert();
  
   useEffect(() => {
    const initClient = () => {
      gapi.client.init({
        clientId: clientId,
        scope: ''
      });
    };
    gapi.load('client:auth2', initClient);
  });
 

  const onSuccess = (res) => {
  
    let payload = {"Email": res.profileObj.email, "GoogleID": res.profileObj.googleId}
    axios.post("/v1/security/login",payload)
    .then ((response) => {
      console.log('Respuesta', response)
      navigate("/");
    })
    .catch((err) => {
      alert.error(err.response.data.error)
      console.log('Error ', err )
    })

  };

  const onFailure = (err) => {
    console.log('failed:', err);
  };

  const logOut = () => {
    setProfile(null);
  };

  return (
    <div >
    
        <GoogleLogin
          clientId={clientId}
          buttonText="Firmate con Google"
          onSuccess={onSuccess}
          onFailure={onFailure}
          cookiePolicy={'single_host_origin'}
          isSignedIn={true}
        />
    </div>
  )
}

export default GoogleAuth;
