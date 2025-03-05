/* eslint-disable array-callback-return, no-loop-func, react-hooks/exhaustive-deps, no-unused-vars */
import { Button, Dialog, Grid, LinearProgress, Typography } from '@mui/material';
import { Box } from '@mui/system'
import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { useAlert } from 'react-alert';
import './styles.css';
import SelectTournaments from 'components/SelectTournament';
import SelectCategories from 'components/SelectCategories';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router';
import dayjs from 'dayjs';
import SelectPrintableColors from './SelectPrintableColors';
import MainCard from 'ui-component/cards/MainCard';
import { ShortDayOfTheWeek } from 'utils/DateUtils';
import CupLogo from '../../assets/images/sponsors/CupLogo.png';
import PadelNowLogo from '../../assets/images/sponsors/PadelNowLogo.png';
import html2canvas from 'html2canvas';
//import AllSeasons from '../../assets/images/sponsors/AllSeasons.png';
import Patrocinadores from '../../assets/images/sponsors/patrocinadores.png';
import ClubLogo from '../../assets/images/sponsors/ClubLogo.png';


const GamesRol = (props) => {
    const alert = useAlert();
    const navigate = useNavigate();


    const [refreshScreen, setRefreshScreen] = useState(false);
    const [buttonClicked, setButtonClicked] = useState(false);
    const [values, setValues] = useState({
        TournamentID: '',
        CategoryID: ''
    });

    const [tournament, setTournament] = useState({});
    const [isColorDialogOpen, setIsColorDialogOpen] = useState(false);
    var groupsRef = useRef([]);
    var gamesRef = useRef([]);
    var categoryDescriptionRef = useRef('');

    const pageWidth = 900;

    const handleUpdate = (e) => {
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
        if (name === 'TournamentID') {
            loadTournament(value);
        }
    };

    const handleClose = () => {
        setIsColorDialogOpen(false);
    }


    const loadTournament = (TournamentID) => {
        axios.get(`/v1/catalogs/tournament?TournamentID=${TournamentID}`)
            .then((response) => {
                setTournament(response.data.data)
            })
            .catch((err) => {
                alert.error('Error cargando torneos: ' + err.message)
                if (err.response.status === 401) {
                    navigate('/pages/login/login3')
                }
            })
    }


    const LoadData = () => {

        if ((!values.TournamentID && values.TournamentID === '') || (!values.CategoryID && values.CategoryID === '')) {
            return
        }

        let myPromises = [];
        myPromises.push(axios.get(`/v1/tournament/getteamsbygroup?TournamentID=${values.TournamentID}&CategoryID=${values.CategoryID}`));
        myPromises.push(axios.get(`/v1/tournament/listgames?TournamentID=${values.TournamentID}&CategoryID=${values.CategoryID}`));
        Promise.all(myPromises)
            .then((responses) => {
                let groups = [];
                let teams = [];
                let lastGroupNumber = ''
                if (!responses[0].data.data || responses[0].data.data.length === 0) {
                    alert.error('No hay equipos registrados para este torneo/categoria')
                    return
                }
                responses[0].data.data.map(team => {
                    if (team.GroupID === lastGroupNumber || lastGroupNumber === '') {
                        teams.push(team)
                    } else {
                        groups.push(teams);
                        teams = [];
                        teams.push(team);
                    }
                    lastGroupNumber = team.GroupID
                });

                if (teams.length > 0) {
                    groups.push(teams)
                }
                groupsRef.current = groups;
                //  groupResultsRef = calculateGroupResults()

                gamesRef.current = responses[1].data.data;
                categoryDescriptionRef.current = gamesRef.current[0].CategoryDescription;
                setRefreshScreen(!refreshScreen);

            })
            .catch((err) => {
                alert.error('Error Cargando Rounrobin winner: ' + err.message)
                if (err.response.status === 401) {
                    navigate('/pages/login/login3')
                }
            })
    }


    useEffect(() => {
        LoadData();
    }, [values.CategoryID, values.TournamentID])


    useEffect(() => {
        if (props.tournamentid && props.tournamentid !== '' && props.categoryid && props.categoryid !== '') {
            setValues({ ...values, 'TournamentID': props.tournamentid, 'CategoryID': props.categoryid });
        }
    }, [props.tournamentid, props.categoryid])

    const displayGroup = (group) => {
        let myGames = gamesRef.current.filter((item) => group[0].GroupID === item.TournamentGroupID);

        const renderDateBox = (date) => {
            let myDate = dayjs(date);
            return (
                <Box display={'flex'} justifyContent={'center'} alignItems={'center'} flexDirection={'column'} width={'100%'} height={'100%'} >
                    <Typography variant={'h6'} fontSize={15} fontWeight={700} style={{ textTransform: 'capitalize' }} >
                        {date === '0001-01-01T00:00:00Z' ? 'N/D' : myDate.format('hh:mm A')}
                    </Typography>
                    <Typography variant={'h6'} fontSize={12} fontWeight={400} style={{ textTransform: 'capitalize' }} >
                        {date === '0001-01-01T00:00:00Z' ? '' : ShortDayOfTheWeek(myDate)}        
                    </Typography>
                </Box>
            )

        }

        return (
            <Box id={group[0].GroupName} paddingY={3} paddingX={5} display={'flex'} alignContent={'center'} flexDirection={'column'} width={'751px'}>

                <Grid container >
                    <Grid item xs={12} sx={{ background: 'rgba(66,113,116,1)', borderRadius: '12px 12px 0px 0px', height: '44px' }} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                        <Typography fontWeight={700} fontSize={17} color={'#FFFFFF'}>{group[0].GroupName}</Typography>
                    </Grid>
                    <>
                        <Grid item xs={1} borderBottom={'1px solid #E3E3E3'} borderLeft={'1px solid #E3E3E3'} display={'flex'} alignItems={'center'} paddingLeft={1} height={'31px'} sx={{ background: '#F2F2F2' }}>
                            <Typography variant={'h6'} fontSize={10} fontWeight={700} style={{ textTransform: 'capitalize' }} paddingLeft={1}>
                                Equipo
                            </Typography>
                        </Grid>
                        <Grid item xs={5.5} borderBottom={'1px solid #E3E3E3'} paddingLeft={1} display={'flex'} alignItems={'center'} justifyContent={'left'} sx={{ background: '#F2F2F2' }}>
                            <Typography variant={'h6'} fontSize={10} fontWeight={700} style={{ textTransform: 'capitalize' }} >
                                Jugador 1
                            </Typography>
                        </Grid>
                        <Grid item xs={5.5} borderBottom={'1px solid #E3E3E3'} borderRight={'1px solid #E3E3E3'} paddingLeft={1} display={'flex'} alignItems={'center'} justifyContent={'left'} sx={{ background: '#F2F2F2' }}>
                            <Typography variant={'h6'} fontSize={10} fontWeight={700} style={{ textTransform: 'capitalize' }} >
                                Jugador 2
                            </Typography>
                        </Grid>
                    </>
                    {group.map((team, index) => (
                        <>
                            <Grid item xs={1} borderBottom={'1px solid #E3E3E3'} borderLeft={'1px solid #E3E3E3'} display={'flex'} alignItems={'center'} paddingLeft={1} height={'56px'} sx={{ borderRadius: index + 1 === group.length ? '0px 0px 0px 12px' : '' }}>
                                <Typography variant={'h6'} fontSize={15} fontWeight={700} style={{ textTransform: 'capitalize' }} paddingLeft={1}>
                                    {index + 1}
                                </Typography>
                            </Grid>
                            <Grid item xs={5.5} borderBottom={'1px solid #E3E3E3'} paddingLeft={1} display={'flex'} alignItems={'center'} justifyContent={'left'}>
                                <Typography variant={'h6'} fontSize={15} fontWeight={400} style={{ textTransform: 'capitalize' }} >
                                    {team.Name1.toLowerCase()}
                                </Typography>
                            </Grid>
                            <Grid item xs={5.5} borderBottom={'1px solid #E3E3E3'} borderRight={'1px solid #E3E3E3'} paddingLeft={1} display={'flex'} alignItems={'center'} justifyContent={'left'} sx={{ borderRadius: index + 1 === group.length ? '0px 0px 12px 0px' : '' }}>
                                <Typography variant={'h6'} fontSize={15} fontWeight={400} style={{ textTransform: 'capitalize' }} >
                                    {team.Name2.toLowerCase()}
                                </Typography>
                            </Grid>
                        </>
                    ))}
                </Grid>
                <Grid container paddingTop={5}>
                    <Grid item xs={12} sx={{ background: '#F2F2F2', borderRadius: '12px 12px 0px 0px', height: '44px' }} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                        <Typography fontWeight={700} fontSize={17} color={'#000000'}>Partidos</Typography>
                    </Grid>
                    {myGames.map((game, index) => (
                        <>
                            <Grid item xs={4} borderBottom={'1px solid #E3E3E3'} borderLeft={'1px solid #E3E3E3'} display={'flex'} alignItems={'center'} paddingLeft={1} height={'56px'} sx={{ borderRadius: index + 1 === group.length ? '0px 0px 0px 12px' : '' }}>
                                <Typography variant={'h6'} fontSize={15} fontWeight={400} style={{ textTransform: 'capitalize' }} paddingLeft={1}>
                                    {`${game.Team1FirstLastName1.toLowerCase()} · ${game.Team1FirstLastName2.toLowerCase()}`}
                                </Typography>
                            </Grid>
                            <Grid item xs={4} borderBottom={'1px solid #E3E3E3'} paddingLeft={1} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                                {renderDateBox(game.StartTime)}
                            </Grid>

                            <Grid item xs={4} borderBottom={'1px solid #E3E3E3'} borderRight={'1px solid #E3E3E3'} paddingLeft={1} display={'flex'} alignItems={'center'} justifyContent={'left'} sx={{ borderRadius: index + 1 === myGames.length ? '0px 0px 12px 0px' : '' }}>
                                <Typography variant={'h6'} fontSize={15} fontWeight={400} style={{ textTransform: 'capitalize' }} >
                                    {`${game.Team2FirstLastName1.toLowerCase()} · ${game.Team2FirstLastName2.toLowerCase()}`}
                                </Typography>
                            </Grid>

                        </>
                    ))}
                </Grid>
            </Box>
        )
    }

    const downloadPDFAll = async () => {
        setButtonClicked(true);
        const HeaderArea = document.getElementById('PageHeader');
        const FooterArea = document.getElementById('PageFooter');
        let doc = new jsPDF('portrait', 'px', [891, 1260], true);
        const margin = 40;
        const headerSize = 250;
        const scaleSize = 4;

        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;

        const headerCanvas = await html2canvas(HeaderArea, { scale: scaleSize });
        const headerImageData = headerCanvas.toDataURL('image/png');
        const headerImgWidth = HeaderArea.offsetWidth;
        const headerImgHeight = HeaderArea.offsetHeight;


        const footerCanvas = await html2canvas(FooterArea, { scale: scaleSize });
        const footerImageData = footerCanvas.toDataURL('image/png');
        const footerImgWidth = FooterArea.offsetWidth;
        const footerImgHeight = FooterArea.offsetHeight;

        groupsRef.current.forEach(async (group, index) => {
            try {
                const groupArea = document.getElementById(group[0].GroupName);
                const groupCanvas = await html2canvas(groupArea, { scale: scaleSize });
                const groupImageData = groupCanvas.toDataURL('image/png');
                const groupImgWidth = groupArea.offsetWidth;
                const groupImgHeight = groupArea.offsetHeight;

                if (index > 0) {
                    doc.addPage();
                }
                doc.addImage(headerImageData, 'PNG', (pageWidth / 2) - (headerImgWidth / 2), margin, headerImgWidth, headerImgHeight);
                doc.addImage(groupImageData, 'PNG', (pageWidth / 2) - (groupImgWidth / 2), headerSize + margin, groupImgWidth, groupImgHeight);
                doc.addImage(footerImageData, 'PNG', (pageWidth / 2) - (footerImgWidth / 2), pageHeight - (footerImgHeight + margin), footerImgWidth, footerImgHeight);

                if (index === groupsRef.current.length - 1) {
                    doc.save(`Rol de juegos ${tournament.ClubName}-${categoryDescriptionRef.current}.pdf`);
                    setButtonClicked(false);
                }

            } catch (error) {
                setButtonClicked(false);
                console.log('Error convirtiendo a PDF')
            }

        })
    }



    const downloadPDFOnePage = async () => {
        setButtonClicked(true);
        const HeaderArea = document.getElementById('PageHeader');
        const FooterArea = document.getElementById('PageFooter');

        const AreaToExport = document.getElementById('AreaToExport');

        const margin = 40;
        const headerSize = 250;
        const scaleSize = 4;

        const pageHeight = AreaToExport.offsetHeight + (headerSize * 2);
        let doc = new jsPDF('portrait', 'px', [980, pageHeight], true);


        const pageWidth = doc.internal.pageSize.width;
        const groupImgWidth = 751;

        const headerCanvas = await html2canvas(HeaderArea, { scale: scaleSize });
        const headerImageData = headerCanvas.toDataURL('image/png');
        const headerImgWidth = HeaderArea.offsetWidth;
        const headerImgHeight = HeaderArea.offsetHeight;


        const footerCanvas = await html2canvas(FooterArea, { scale: scaleSize });
        const footerImageData = footerCanvas.toDataURL('image/png');
        const footerImgWidth = FooterArea.offsetWidth;
        const footerImgHeight = FooterArea.offsetHeight;

        doc.addImage(headerImageData, 'PNG', (pageWidth / 2) - (headerImgWidth / 2), margin, headerImgWidth, headerImgHeight);
        doc.addImage(footerImageData, 'PNG', (pageWidth / 2) - (footerImgWidth / 2), pageHeight - (footerImgHeight + margin), footerImgWidth, footerImgHeight);
        doc.html(AreaToExport, {
            callback: function (doc) {
                doc.save(`Rol de juegos ${tournament.ClubName}-${categoryDescriptionRef.current}.pdf`);
            setButtonClicked(false);

            }, x: (pageWidth / 2) - (groupImgWidth / 2), y: headerSize + margin, width: pageWidth, windowWidth: pageWidth, margin: 0
        });
    }


    const renderHeader = () => {
        return (

            <Box id='PageHeader' hidden display={'flex'} justifyContent={'center'} flexDirection={'column'} justifyItems={'center'} width={`751px`} paddingX={6}>
                <Grid container >
                    <Grid item xs={4} display={'flex'} justifyContent={'flex-start'} alignItems={'center'}>
                        <img src={ClubLogo} alt="AllSeasons" height={'45px'} />
                    </Grid>
                    <Grid item xs={4} display={'flex'} justifyContent={'center'}>
                        <img src={CupLogo} alt="CupLogo" height={'79px'} />

                    </Grid>
                    <Grid item xs={4} display={'flex'} justifyContent={'flex-end'} alignItems={'center'}>
                        <img src={PadelNowLogo} alt="PadelNowLogo" height={'31px'} />
                    </Grid>
                    <Grid item xs={12} display={'flex'} justifyContent={'center'} alignItems={'center'} flexDirection={'column'}>
                        <Typography variant={'h6'} fontSize={11} fontWeight={700}  >
                            CIRCUITO PREMIER CUP
                        </Typography>
                        <Typography variant={'h6'} component={'div'} fontSize={30} fontWeight={700}  >
                            CUP G1 1000
                        </Typography>
                        <Typography variant={'h6'} component={'div'} fontSize={14} fontWeight={400} color={'#676767'} >
                            {tournament.ClubName} &#183; Draws &#183; {categoryDescriptionRef.current}
                        </Typography>
                    </Grid>
                </Grid>

            </Box>

        )
    }

    const renderFooter = () => {
        return (
            <Box id='PageFooter' hidden display={'flex'} justifyContent={'center'} flexDirection={'column'} justifyItems={'center'} width={`751px`} paddingX={6}>
                <Grid container >
                    <Grid item xs={12} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                        <img src={Patrocinadores} alt="Patrocinadores" height={'120px'} />
                    </Grid>

                </Grid>
            </Box>
        )
    }


    return (
        <MainCard title='Rol de juegos por grupo'>

            {!props.inDialog && (

                <Box >
                    <Grid container spacing={1} padding={1}>
                        <Grid item xs={4}>
                            <SelectTournaments
                                name='TournamentID'
                                label='Torneo'
                                handleupdate={handleUpdate}
                                value={values.TournamentID}
                            />

                        </Grid>
                        <Grid item xs={4}>
                            <SelectCategories
                                name='CategoryID'
                                value={values.CategoryID}
                                label="Category"
                                handleupdate={handleUpdate} />

                        </Grid>
                        <Grid item xs={4}>
                            <Box display={'flex'} justifyContent={'space-around'} >
                                <Button onClick={downloadPDFAll} variant={'contained'} disabled={buttonClicked}> PDF </Button>
                                <Button onClick={downloadPDFOnePage} variant={'contained'} disabled={buttonClicked}> PDF 1P </Button>

                            </Box>
                        </Grid>
                    </Grid>
                    <Box hidden={!buttonClicked} width={'100%'}>
                        <LinearProgress />
                    </Box>
                </Box>
            )}



            <Box className='AreaToExport' display={'flex'} justifyContent={'center'} flexDirection={'column'} justifyItems={'center'} width={`${pageWidth}px`}>
                {renderHeader()}
                <Box className='AreaToExport' id='AreaToExport' display={'flex'} justifyContent={'center'} flexDirection={'column'} justifyItems={'center'} width={`${pageWidth}px`}>
                    {groupsRef.current.map((group) => displayGroup(group))}
                </Box>
                {renderFooter()}
                </Box>
            <Dialog open={isColorDialogOpen} onClose={handleClose}>
                <SelectPrintableColors handleclose={handleClose} print={downloadPDFAll} />
            </Dialog>


        </MainCard>
    )
}

export default GamesRol