import React, { useState, useEffect } from 'react';
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
  const getInitialTime = (matchType: string): number => {
    switch (matchType) {
      case '1v1':
        return 600; // 10 minutes
      case '2v2':
        return 900; // 15 minutes
      case '3v3':
        return 1200; // 20 minutes
      default:
        return 600; // Default to 10 minutes
    }
  };

  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(getInitialTime(match.type));
  const [isBaseTime, setIsBaseTime] = useState<boolean>(true);
  const [baseTimeEndDialogOpen, setBaseTimeEndDialogOpen] = useState(false);
  const [currentPlayerTimeLeft, setCurrentPlayerTimeLeft] = useState<number>(20);
  const [overtimeDialogOpen, setOvertimeDialogOpen] = useState(false);
  const [matchStartTime, setMatchStartTime] = useState<number | null>(null);
  const [matchEndTime, setMatchEndTime] = useState<number | null>(null);

  // Timer effect for base time
  useEffect(() => {
    if (!match.useTimer || !isBaseTime) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          setBaseTimeEndDialogOpen(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [match.useTimer, isBaseTime]);

  // Timer effect for shot time
  useEffect(() => {
    if (!match.useTimer || isBaseTime) return;

    const timer = setInterval(() => {
      setCurrentPlayerTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [match.useTimer, isBaseTime]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBaseTimeEndDialogClose = () => {
    setBaseTimeEndDialogOpen(false);
    setIsBaseTime(false);
    setCurrentPlayerTimeLeft(20);
  };

  const handleFinishClick = () => {
    setFinishDialogOpen(true);
    setMatchEndTime(Date.now());
  };

  const handleFinishConfirm = () => {
    setFinishDialogOpen(false);
    onBack();
  };

  const handleFinishCancel = () => {
    setFinishDialogOpen(false);
  };

  const handleHit = (playerIndex: number) => {
    if (matchStartTime === null) setMatchStartTime(Date.now());
    onShot(playerIndex, 'hit');
    if (!isBaseTime) {
      setCurrentPlayerTimeLeft(20);
    }
  };

  const handleMiss = (playerIndex: number) => {
    if (matchStartTime === null) setMatchStartTime(Date.now());
    onShot(playerIndex, 'miss');
    if (!isBaseTime) {
      setCurrentPlayerTimeLeft(20);
    }
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
    let matchDuration = null;
    if (matchStartTime && matchEndTime && matchEndTime > matchStartTime) {
      matchDuration = formatDuration(matchEndTime - matchStartTime);
    }

    return (
      <Box sx={{ mt: 2 }}>
        {matchDuration && (
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Match time: <b>{matchDuration}</b>
          </Typography>
        )}
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

  const handleOvertimeClick = () => {
    setOvertimeDialogOpen(true);
  };

  const handleOvertimeConfirm = () => {
    setTimeLeft(prev => prev + 300); // Add 5 minutes (300 seconds)
    setOvertimeDialogOpen(false);
  };

  const handleOvertimeCancel = () => {
    setOvertimeDialogOpen(false);
  };

  // Helper to format duration in MM:SS
  const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubtractMinute = () => {
    if (isBaseTime) {
      setTimeLeft(prev => Math.max(0, prev - 60));
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', mb: 2, gap: 1 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            color: (isBaseTime ? timeLeft : currentPlayerTimeLeft) <= 10 ? 'error.main' : 'text.primary',
            fontWeight: 'bold',
            mr: 2,
            minWidth: 70,
            textAlign: 'center'
          }}
        >
          {isBaseTime ? formatTime(timeLeft) : formatTime(currentPlayerTimeLeft)}
        </Typography>
        {isBaseTime && match.useTimer && (
          <Button
            variant="contained"
            color="secondary"
            onClick={handleOvertimeClick}
            size="large"
            sx={{ minWidth: 80, minHeight: 80, maxWidth: 80, maxHeight: 80, p: 0, fontSize: '1.05rem', lineHeight: 1.1, letterSpacing: 0, fontWeight: 600, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
          >
            Overtime<br/>+5min
          </Button>
        )}
        <Button
          variant="contained"
          color="warning"
          onClick={onUndo}
          disabled={match.history.length === 0}
          size="large"
          sx={{ minWidth: 80, minHeight: 80, maxWidth: 80, maxHeight: 80, p: 0, fontSize: '1.05rem', lineHeight: 1.1, letterSpacing: 0, fontWeight: 600, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
        >
          Undo<br/>Last Shot
        </Button>
        {isBaseTime && match.useTimer && (
          <Button
            variant="outlined"
            color="error"
            onClick={handleSubtractMinute}
            size="small"
            sx={{ minWidth: 36, minHeight: 36, maxWidth: 36, maxHeight: 36, ml: 1, p: 0, fontSize: '0.75rem', lineHeight: 1, fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            -1<br/>min
          </Button>
        )}
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

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Button
          variant="contained"
          color="success"
          onClick={handleFinishClick}
          size="large"
        >
          Finish Match
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
          <Typography sx={{ mb: 2 }} color="warning.main">
            Pro uložení výsledků si tuto tabulku prosím vyfoťte (screenshot).
          </Typography>
          {renderResultsSummary()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFinishCancel} color="primary">
            Continue Playing
          </Button>
          <Button onClick={handleFinishConfirm} color="success" variant="contained">
            Close Match
          </Button>
        </DialogActions>
      </Dialog>

      {/* Base Time End Dialog */}
      <Dialog
        open={baseTimeEndDialogOpen}
        onClose={handleBaseTimeEndDialogClose}
      >
        <DialogTitle>Base Time Ended</DialogTitle>
        <DialogContent>
          <Typography>
            The base time has ended. From now on, each player has 20 seconds to make their shot.
            The timer will reset after each shot.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBaseTimeEndDialogClose} color="primary" variant="contained">
            Got it!
          </Button>
        </DialogActions>
      </Dialog>

      {/* Overtime Confirmation Dialog */}
      <Dialog
        open={overtimeDialogOpen}
        onClose={handleOvertimeCancel}
      >
        <DialogTitle>Confirm Overtime</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to add 5 minutes to the base time? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleOvertimeCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleOvertimeConfirm} color="secondary" variant="contained">
            Add 5 Minutes
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default MatchPlay; 