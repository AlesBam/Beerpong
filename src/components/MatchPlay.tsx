import React from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Divider,
} from '@mui/material';
import { Match, Player } from '../types';

interface MatchPlayProps {
  match: Match;
  onBack: () => void;
  onShot: (playerIndex: number, result: 'hit' | 'miss') => void;
  onUndo: () => void;
}

const MatchPlay: React.FC<MatchPlayProps> = ({ match, onBack, onShot, onUndo }) => {
  const handleHit = (playerIndex: number) => {
    onShot(playerIndex, 'hit');
  };

  const handleMiss = (playerIndex: number) => {
    onShot(playerIndex, 'miss');
  };

  const getPlayerStats = (playerIndex: number) => {
    const playerHistory = match.history.filter(h => h.playerIndex === playerIndex);
    const hits = playerHistory.filter(h => h.result === 'hit').length;
    const total = playerHistory.length;
    const accuracy = total > 0 ? (hits / total) * 100 : 0;
    return { hits, total, accuracy };
  };

  const getTeamStats = (startIndex: number, endIndex: number) => {
    const teamHistory = match.history.filter(h => h.playerIndex >= startIndex && h.playerIndex < endIndex);
    const hits = teamHistory.filter(h => h.result === 'hit').length;
    const total = teamHistory.length;
    const accuracy = total > 0 ? (hits / total) * 100 : 0;
    return { hits, total, accuracy };
  };

  // Get the number of players per team based on match type
  const getPlayersPerTeam = (matchType: string) => {
    switch (matchType) {
      case '1v1':
        return 1;
      case '2v2':
        return 2;
      case '3v3':
        return 3;
      default:
        return 1;
    }
  };

  const playersPerTeam = getPlayersPerTeam(match.type);
  console.log('Match type:', match.type);
  console.log('Players per team:', playersPerTeam);
  console.log('All players:', match.players);

  // Ensure we have the correct number of players
  if (match.players.length !== playersPerTeam * 2) {
    console.error('Incorrect number of players:', match.players.length, 'expected:', playersPerTeam * 2);
  }

  const team1Players = match.players.slice(0, playersPerTeam);
  const team2Players = match.players.slice(playersPerTeam, playersPerTeam * 2);
  const team1Stats = getTeamStats(0, playersPerTeam);
  const team2Stats = getTeamStats(playersPerTeam, playersPerTeam * 2);

  console.log('Team 1 Players:', team1Players);
  console.log('Team 2 Players:', team2Players);

  const renderTeam = (players: Player[], startIndex: number, teamNumber: number, teamStats: { hits: number; total: number; accuracy: number }) => {
    console.log(`Rendering Team ${teamNumber}:`, players);
    return (
    <Box sx={{ flex: 1 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Team {teamNumber}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Team Stats: {teamStats.hits} hits | {teamStats.total} shots | {teamStats.accuracy.toFixed(1)}% accuracy
        </Typography>
      </Box>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          sm: playersPerTeam === 1 ? '1fr' : 'repeat(2, 1fr)',
          md: playersPerTeam === 1 ? '1fr' : playersPerTeam === 2 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'
        },
        gap: 2 
      }}>
        {players.map((player, index) => {
          const playerIndex = startIndex + index;
          const stats = getPlayerStats(playerIndex);
          console.log(`Rendering player ${playerIndex}:`, player);
          return (
            <Box key={playerIndex} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                {player.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Hits: {stats.hits} | Total: {stats.total} | Accuracy: {stats.accuracy.toFixed(1)}%
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 1 }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleHit(playerIndex)}
                >
                  Hit
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleMiss(playerIndex)}
                >
                  Miss
                </Button>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  )};

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          Beer Pong Counter
        </Typography>
        <Button
          variant="contained"
          color="warning"
          onClick={onUndo}
          disabled={match.history.length === 0}
        >
          Undo Last Shot
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
        {/* Team 1 */}
        {team1Players.length > 0 && renderTeam(team1Players, 0, 1, team1Stats)}
        
        {/* VS Divider */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          minWidth: { md: '50px' }
        }}>
          <Divider orientation="vertical" sx={{ 
            height: '100%', 
            display: { xs: 'none', md: 'block' } 
          }} />
          <Typography variant="h4" sx={{ 
            display: { xs: 'block', md: 'none' }, 
            textAlign: 'center', 
            my: 2 
          }}>
            VS
          </Typography>
        </Box>

        {/* Team 2 */}
        {team2Players.length > 0 && renderTeam(team2Players, playersPerTeam, 2, team2Stats)}
      </Box>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={onBack}
        >
          Back to Setup
        </Button>
      </Box>
    </Paper>
  );
};

export default MatchPlay; 