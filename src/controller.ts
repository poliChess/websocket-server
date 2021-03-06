import express from 'express';
import bodyParser from 'body-parser';

import { getUser } from './services/userService';

const delay = (milis: number) => new Promise(resolve => setTimeout(resolve, milis));

const newMatchInfo = (matchID: string, player1ID: string, player2ID: string) => ({
  matchID,
  player1ID,
  player2ID,
  toMove: false,
  state: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
});

function ControllerEndpoint(sockets: any, matches: any) {
  const app = express();
  app.use(bodyParser.json());

  app.get('/running', (_, res) => {
    res.send('yes');
  });

  app.post('/startGame', async (req, res) => {
    const matchID = req.body.matchID;
    const player1ID = req.body.player1ID;
    const player2ID = req.body.player2ID;

    const player1 = await getUser(player1ID);
    const player2 = await getUser(player2ID);

    if (!matchID || !player1ID || !player2ID || !player1 || !player2)
      return res.status(400).send('bad request');

    while (!sockets[player1ID])
      await delay(300);

    if (player2ID != 'computer') {
      while (!sockets[player2ID])
        await delay(300);
    }

    const match = newMatchInfo(matchID, player1ID, player2ID);

    matches[player1ID] = match;
    sockets[player1ID].send(`start first vs ${player2.username}`);
    if (player2ID != 'computer') {
      matches[player2ID] = match;
      sockets[player2ID].send(`start second vs ${player1.username}`);
    }

    return res.send('ok');
  });

  app.listen(3000);
}

export default ControllerEndpoint;
