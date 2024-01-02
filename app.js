const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Successfully running at https://localhost:3000");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();


app.get('/players/', async (request, response) =>{
    const getPlayersQuery = `
    SELECT
    *
    FROM 
    cricket_team
    ORDER BY
    playerId;
    `;
    const playerNames = await db.all(getPlayersQuery);
    response.send(playerNames);
});

app.post('/players/', async (request, response) => {
    const playerDetails = request.body;
    const {player_name,
            jersey_number,
            role} = playerDetails;
    const addPlayerQuery = `INSERT INTO 
                            cricket_team ({player_name,jersey_number,role)
                                VALUES (
                                    `${player_name}`,
                                    `${jersey_number}`,
                                    `${role}`,
                                );`;
    const dbResponse = await db.run(addPlayerQuery);
    const player_id = dbResponse.lastID;
    response.send({player_id: player_id});
});

app.get('/players/:playerId/', async(request, response) => {
    const {player_id}= request.params;
    const getPlayerQuery = `
    SELECT 
    *
    FROM
    cricket_team
    WHERE
    player_id = `${player_id}`;`;
    const player = await db.get(getPlayerQuery);
    response.send(player);
});

app.put('/players/:playerId/', async (request, response) => {
    const{ player_id } = request.params;
    const PlayerDetails = request.body;
    const {player_name,
            jersey_number,
            role} = PlayerDetails;
    const updatePlayerQuery = `
    UPDATE cricket_team
    SET
    player_name = `${player_name}`,
    jersey_number = `${jersey_number}`,
    role = `${role}`
    WHERE
    player_id = `${player_id}`;`;
    await db.run(updatePlayerQuery);
    response.send("Player Details Updated");
});

app.delete('/players/:playerId/', async (request, response) => {
    const {player_id} = request.params;
    const deleteQuery = `DELETE
    FROM
    cricket_team
    WHERE
    player_id = `${player_id}`;`;
    await db.run(deleteQuery);
    response.send("Player Removed");
});

module.exports = app;