import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Match, Player } from '../types';

interface MatchPlayProps {
  match: Match;
  onBack: () => void;
  onShot: (playerIndex: number, result: 'hit' | 'miss') => void;
  onUndo: () => void;
  onReset: () => void;
}

const MatchPlay: React.FC<MatchPlayProps> = ({ match, onBack, onShot, onUndo, onReset }) => {
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);

  const handleFinishClick = () => {
    setFinishDialogOpen(true);
  };

  const handleFinishConfirm = () => {
    setFinishDialogOpen(false);
    onBack();
  };

  const handleFinishCancel = () => {
    setFinishDialogOpen(false);
  };

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

  const renderTeam = (players: Player[], startIndex: number, teamNumber: number, teamStats: { hits: number; total: number; accuracy: number }, teamName: string) => (
    <Box sx={{ flex: 1 }}>
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          {teamName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Team Stats: {teamStats.hits} hits | {teamStats.total} shots | {teamStats.accuracy.toFixed(1)}%
        </Typography>
      </Box>
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        {players.map((player, index) => {
          const playerIndex = startIndex + index;
          const stats = getPlayerStats(playerIndex);
          return (
            <Box 
              key={playerIndex} 
              sx={{ 
                p: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {player.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hits: {stats.hits} | Total: {stats.total} | {stats.accuracy.toFixed(1)}%
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleHit(playerIndex)}
                  size="small"
                >
                  Hit
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleMiss(playerIndex)}
                  size="small"
                >
                  Miss
                </Button>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );

  const renderResultsSummary = () => {
    const allPlayers = [...team1Players, ...team2Players];
    const allPlayerStats = allPlayers.map((_, index) => getPlayerStats(index));

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>Match Summary</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          {/* Team 1 Section */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ textAlign: 'center', mb: 1, fontWeight: 'bold' }}>
              {match.team1Name}
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: '0.75rem' }}>Player</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.75rem' }}>Hits</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.75rem' }}>Shots</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.75rem' }}>Acc%</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {team1Players.map((player, index) => {
                    const stats = allPlayerStats[index];
                    return (
                      <TableRow key={index}>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{player.name}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.75rem' }}>{stats.hits}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.75rem' }}>{stats.total}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.75rem' }}>{stats.accuracy.toFixed(1)}</TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow>
                    <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Team Total</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{team1Stats.hits}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{team1Stats.total}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{team1Stats.accuracy.toFixed(1)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Team 2 Section */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ textAlign: 'center', mb: 1, fontWeight: 'bold' }}>
              {match.team2Name}
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: '0.75rem' }}>Player</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.75rem' }}>Hits</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.75rem' }}>Shots</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.75rem' }}>Acc%</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {team2Players.map((player, index) => {
                    const stats = allPlayerStats[playersPerTeam + index];
                    return (
                      <TableRow key={index}>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{player.name}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.75rem' }}>{stats.hits}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.75rem' }}>{stats.total}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.75rem' }}>{stats.accuracy.toFixed(1)}</TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow>
                    <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Team Total</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{team2Stats.hits}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{team2Stats.total}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{team2Stats.accuracy.toFixed(1)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          Beer Pong Counter
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="warning"
            onClick={onUndo}
            disabled={match.history.length === 0}
            size="small"
          >
            Undo Last Shot
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleFinishClick}
            size="small"
          >
            Finish Match
          </Button>
        </Box>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: { 
          xs: playersPerTeam === 3 ? 'row' : 'column',
          md: 'row' 
        }, 
        gap: 2,
        mb: 2
      }}>
        {/* Team 1 */}
        {team1Players.length > 0 && renderTeam(team1Players, 0, 1, team1Stats, match.team1Name)}
        
        {/* VS Divider */}
        {playersPerTeam === 3 ? (
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'block', md: 'block' } }} />
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 1 }}>
            <Typography variant="h5" color="text.secondary">VS</Typography>
          </Box>
        )}

        {/* Team 2 */}
        {team2Players.length > 0 && renderTeam(team2Players, playersPerTeam, 2, team2Stats, match.team2Name)}
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={onBack}
          size="small"
        >
          Back to Setup
        </Button>
      </Box>

      {/* Finish Match Dialog */}
      <Dialog
        open={finishDialogOpen}
        onClose={handleFinishCancel}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Match Results</DialogTitle>
        <DialogContent>
          {renderResultsSummary()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFinishCancel} color="primary">
            Continue Playing
          </Button>
          <Button onClick={handleFinishConfirm} color="success" variant="contained">
            Finish Match
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default MatchPlay; 