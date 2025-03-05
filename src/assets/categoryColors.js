/**
 * Retrieves the category color.
 *
 * @returns {any} The category color.
 */

const categoryColors = [
    { name: 'Open', bgColor: '#E56E2E', textColor: '#04156d', id: 1 },
    { name: 'Primera', bgColor: '#EB8D2F', textColor: '#04156d', id: 2 },
    { name: 'Segunda', bgColor: '#F1D130', textColor: '#04156d', id: 3 },
    { name: 'Tercera', bgColor: '#BFDC2C', textColor: '#000000', id: 4 },
    { name: 'Cuarta', bgColor: '#84DC2C', textColor: '#000000', id: 5 },
    { name: 'Quinta', bgColor: '#49DC2C', textColor: '#000000', id: 6 },
    { name: 'Sexta', bgColor: '#2CDC84', textColor: '#000000', id: 7 },
    { name: 'Femenil A', bgColor: '#2CDCBF', textColor: '#000000', id: 8 },
    { name: 'Femenil B', bgColor: '#2CBFDC', textColor: '#04156d', id: 9 },
    { name: 'Femenil C', bgColor: '#308FEE', textColor: '#04156d', id: 10 },
    { name: '+50 A (Avanzado)', bgColor: '#2741C2', textColor: '#04156d', id: 11 },
    { name: '+50 B (Intermedio)', bgColor: '#5231F3', textColor: '#000000', id: 12 },
    { name: 'No sé mi categoría', bgColor: '#842CDC', textColor: '#04156d', id: 13 },
    { name: '10 y menores', bgColor: '#BF2CDC', textColor: '#04156d', id: 14 },
    { name: '13 y menores', bgColor: '#DC2CBF', textColor: '#000000', id: 15 },
    { name: '16 y menores', bgColor: '#DC2C84', textColor: '#04156d', id: 16 },
    { name: 'Mixto 7+', bgColor: '#DC2C84', textColor: '#04156d', id: 20 },
    { name: 'Mixto 9+', bgColor: '#9ec1ff', textColor: '#04156d', id: 21 },
]

const getCategoryColor = (id) => {
    if (!id) return { name: 'No se ha definido categoría', bgColor: '#842CDC ', textColor: '#000000', id: 0 }
    const categoryColor = categoryColors.find(category => (category.id === id || category.id === parseInt(id)))
    return categoryColor
}

const roundName = [
    {ID:1,Description:'Final'},
    {ID:2,Description:'Semifinal'},
    {ID:4,Description:'Cuartos'},
    {ID:8,Description:'Octavos'},
    {ID:16,Description:'Dieciseisavos'},
 ];

 const getRoundName = (Round) => {
    let myResult = roundName.find((item) => item.ID === Round)
    return myResult ? myResult.Description : 'Not Found';
 }
export {getCategoryColor, getRoundName};