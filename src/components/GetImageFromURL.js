import React from 'react'
import notFound from './../images/notfound.png'


const GetImageFromURL = (props) => {
    const { folder, name } = props

    const handelOnImageError = (currentTarget) => {
        currentTarget.onerror = null;
        currentTarget.src = notFound;
      }
    
    if (folder && folder !== "" && name && name !== "") {
        let myURL = `/v1/utility/image?folder=${folder}&name=${name}`
        return (
            <img
                {...props}
                src={myURL}
                alt={`${folder}-$${name}`}
                onError={({ currentTarget }) => {
                    handelOnImageError(currentTarget)
                }}
            />
        )
    } else {
        <img src={notFound} alt="Not found"/>
    }

}

export default GetImageFromURL