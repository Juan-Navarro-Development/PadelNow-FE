import React from 'react'
import MainCard from 'ui-component/cards/MainCard'
import ImageCatalog from './ImageCatalog'


const index = () => {



  return (
    <MainCard title="Imprimibles" contentSX={{display:'flex', justifyContent:'center'}}>
      
    <ImageCatalog />

    </MainCard>
  )
}

export default index