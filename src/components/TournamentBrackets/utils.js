import React from 'react'

const utils = () => {
  return (
    <div>utils</div>
  )
}


const createMatch = () => {
  let myMatch = {
    id: 0,
    date: new Date().toDateString(),
    teams: [
      {
        id: 1,
      },
      {
        id: 2,
      }
    ]
  }
  return myMatch
}

const createSeeds = (matchCount, roundName) => {
  const roundSeed = {
    id: 1,
    title: roundName,
  }
  let mySeed = [];
  for (let i = 0; i < matchCount; i++) {
    mySeed.push(createMatch())
  }
  roundSeed.seeds = mySeed
  return roundSeed;
}
// es recursivo !!!
const calculateRounds = (counter) => {
  switch (counter) {
    case 128:
      return 8;
    case 64:
      return 7;
    case 32:
      return 6;
    case 16:
      return 5;
    case 8:
      return 4;
    case 4:
      return 3;
    case 2:
      return 2;
    case 1:
      return 1;
    default:
      return -1
  }

}

const roundNames = [
  'Final',
  'Semifinales',
  'Cuartos de final',
  'Octavos',
  '16 avos',
  '32 avos',
  '64 avos',
]; 
const CreateEmptyBrackets = (teamCount) => {

  /*
    Round
      |_seeds
        |_match
          |_teams     
      */
  let myBrackets = [];

  let roundCount = calculateRounds(teamCount);
  let currentTeamCount = teamCount;
  for (let r = 0; r < roundCount; r++) {
    myBrackets.push(createSeeds(currentTeamCount,roundNames[roundCount-(r + 1)]));
    currentTeamCount = currentTeamCount / 2
  }
  return myBrackets
}


export {
  utils,
  CreateEmptyBrackets
}

