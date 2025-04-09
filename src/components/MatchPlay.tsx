import React from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
} from '@mui/material';
import { Match } from '../types';

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

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {match.players.map((player, index) => {
          const stats = getPlayerStats(index);
          return (
            <Box key={index} sx={{ flex: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.33% - 16px)' } }}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {player.name}
                </Typography>
                <Typography variant="body1">
                  Hits: {stats.hits} | Total: {stats.total}
                </Typography>
                <Typography variant="body1">
                  Accuracy: {stats.accuracy.toFixed(1)}%
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleHit(index)}
                >
                  Hit
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleMiss(index)}
                >
                  Miss
                </Button>
              </Box>
            </Box>
          );
        })}
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