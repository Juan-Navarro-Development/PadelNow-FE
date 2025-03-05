import axios from "axios";
import { useAlert } from "react-alert";



const GetBracketsFromGroups = (parameters) => {
    const alert = useAlert();

    const { TournamentID, CategoryID } = parameters;

    const GetTournamentInfo = async (TournamentID, CategoryID) => {
        try {
            const response = await axios.get(`/v1/catalogs/tournaments/info?TournamentID=${values.TournamentID}&CategoryID=${values.CategoryID}`);
            return response.data
        }
        catch (error) {
            alert.error('Error grabando team placement ... ' + error.message)
        }
    }

    const gameWinner = (gameP) => {
        let game = gameP
        let Team1 = {
            SetsGanados: 0,
            PuntosPorSetsGanados: 0,
            Winner: false
        };
        let Team2 = {
            SetsGanados: 0,
            PuntosPorSetsGanados: 0,
            Winner: false
        }
        Team1.SetsGanados += game.Team1Set1 > game.Team2Set1 ? 1 : 0;
        Team2.SetsGanados += game.Team1Set1 < game.Team2Set1 ? 1 : 0;

        Team1.SetsGanados += game.Team1Set2 > game.Team2Set2 ? 1 : 0;
        Team2.SetsGanados += game.Team1Set2 < game.Team2Set2 ? 1 : 0;

        Team1.SetsGanados += game.Team1Set3 > game.Team2Set3 ? 1 : 0;
        Team2.SetsGanados += game.Team1Set3 < game.Team2Set3 ? 1 : 0;

        // Gana Team 1
        if (Team1.SetsGanados > Team2.SetsGanados) {
            Team1.Winner = true;
            if (Team2.SetsGanados === 1) {
                Team1.PuntosPorSetsGanados = 1;
                Team2.PuntosPorSetsGanados = -1;
            } else {
                Team1.PuntosPorSetsGanados = 2;
                Team2.PuntosPorSetsGanados = -2;
            }
        }
        // Gana Team 2
        if (Team1.SetsGanados < Team2.SetsGanados) {
            Team2.Winner = true;
            if (Team1.SetsGanados === 1) {
                Team2.PuntosPorSetsGanados = 1;
                Team1.PuntosPorSetsGanados = -1;
            } else {
                Team2.PuntosPorSetsGanados = 2;
                Team1.PuntosPorSetsGanados = -2;
            }
        }
        game.Team1 = Team1;
        game.Team2 = Team2;

        if (game.Team1.Winner || game.Team2.Winner) {
            game.Winner = Team1.Winner ? 1 : 2;
        } else {
            game.Winner = 0
        }

        return game
    }


    const CalculateWinners = (games) => {
        let results = [];
        games.map(game => {
            if (!results.find((item) => item.TeamID === game.Team1ID)) {
                let myGame = {};
                myGame.TeamID = game.Team1ID;
                myGame.Member1 = game.Team1Member1;
                myGame.Member2 = game.Team1Member2;
                myGame.GroupID = game.GroupID;
                myGame.GroupName = game.GroupName;
                results.push(myGame)
            }
            if (!results.find((item) => item.TeamID === game.Team2ID)) {
                let myGame = {};
                myGame.TeamID = game.Team2ID
                myGame.Member1 = game.Team2Member1;
                myGame.Member2 = game.Team2Member2;
                myGame.GroupID = game.GroupID;
                myGame.GroupName = game.GroupName;
                results.push(myGame)
            }

        });

        for (let i = 0; i < results.length; i++) {
            let JuegosPlaneados = groupsRef.current.filter((game) => game.Team1ID === results[i].TeamID || game.Team2ID === results[i].TeamID)
            let JuegosGanados = JuegosPlaneados.filter((game) => (game.Team1ID === results[i].TeamID && game.Winner === 1) || (game.Team2ID === results[i].TeamID && game.Winner === 2))
            results[i].PuntosPorSetsGanados = 0;
            results[i].PuntosGanados = 0;
            JuegosPlaneados.map((game) => {
                if (results[i].TeamID === game.Team1ID) {
                    results[i].PuntosPorSetsGanados = results[i].PuntosPorSetsGanados + game.Team1.PuntosPorSetsGanados
                    results[i].PuntosGanados = results[i].PuntosGanados + (game.Team1Set1 - game.Team2Set1) + (game.Team1Set2 - game.Team2Set2) + (game.Team1Set3 - game.Team2Set3)
                }
                if (results[i].TeamID === game.Team2ID) {
                    results[i].PuntosPorSetsGanados = results[i].PuntosPorSetsGanados + game.Team2.PuntosPorSetsGanados
                    results[i].PuntosGanados = results[i].PuntosGanados + (game.Team2Set1 - game.Team1Set1) + (game.Team2Set2 - game.Team1Set2) + (game.Team2Set3 - game.Team1Set3)

                }

            })

            //console.log('Ganados :', JuegosPlaneados.filter((game) => results[i].TeamID === game.Team1ID || results[i].TeamID === game.Team2ID))            
            results[i].JuegosJugados = JuegosPlaneados.filter((game) => (game.Team1ID === results[i].TeamID || game.Team2ID === results[i].TeamID) && (game.Team1Set1 + game.Team1Set2 + game.Team1Set3 + game.Team2Set1 + game.Team2Set2 + game.Team2Set3) > 0).length;

            results[i].JuegosGanados = JuegosGanados.length;
        }

        //sort results by Juegos Ganados y Puntos Por Set Ganados
        const leadingZeros = (num) => ("0" + num).slice(-2);
        let results2 = results.sort((a, b) => {
            if (a.JuegosGanados === b.JuegosGanados) {
                if (a.PuntosPorSetsGanados === b.PuntosPorSetsGanados) {
                    return a.PuntosGanados > b.PuntosGanados ? -1 : 1
                } else {
                    return a.PuntosPorSetsGanados > b.PuntosPorSetsGanados ? -1 : 1
                }
            } else {
                return a.JuegosGanados > b.JuegosGanados ? -1 : 1
            }
        })
        groupsRef.current = results2;
    }

    const GetGroupsResults = async () => {

        try {
            const response = await axios.get(`/v1/tournament/getroundrobinwinner?TournamentID=${values.TournamentID}&CategoryID=${values.CategoryID}`);
            if (response.data.data) {
                games = response.data.data.map((item) =>
                    gameWinner(item)
                )
                CalculateWinners();


            } else {
                alert.info('No existen resultados de grupos...')
            }
            CalculateWinners();
            return response.data.data;
        }
        catch (error) {
            alert.error('Error grabando team placement ... ' + error.message)
        }

    }

    // Load Game Results
    // assign gameResults to emptybrackets

}