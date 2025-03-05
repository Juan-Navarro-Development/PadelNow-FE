import axios from "axios";

const LoadGameList = async (parameters = {}) => {
    const { TournamentID, CategoryID, GameType, SearchStr } = parameters;
    if (!TournamentID) {
        throw new Error("TournamentID is required");
    }   

    let myUrl = `/v1/tournament/listgames?TournamentID=${TournamentID}`
    if (CategoryID) myUrl += `&CategoryID=${CategoryID}`
    if (GameType) myUrl += `&GameType=${GameType}`
    if (SearchStr) myUrl += `&SearchStr=${SearchStr}`

    let response = await axios.get(myUrl);
    if (response.data && response.data.data && response.data.data.length > 0) {
        return response.data.data;
    } else {
        return [];
    }
};

export default LoadGameList;