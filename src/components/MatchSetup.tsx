import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  SelectChangeEvent,
} from '@mui/material';
import { MatchType } from '../types';

interface MatchSetupProps {
  onMatchSetup: (type: MatchType, playerNames: string[]) => void;
}

const MatchSetup: React.FC<MatchSetupProps> = ({ onMatchSetup }) => {
  const [matchType, setMatchType] = useState<MatchType>('1v1');
  const [playerNames, setPlayerNames] = useState<string[]>(['']);

  const handleMatchTypeChange = (event: SelectChangeEvent<MatchType>) => {
    const newType = event.target.value as MatchType;
    setMatchType(newType);
    
    // Update number of player name fields based on match type
    const playerCount = parseInt(newType[0]);
    setPlayerNames(Array(playerCount).fill(''));
  };

  const handlePlayerNameChange = (index: number, value: string) => {
    const newNames = [...playerNames];
    newNames[index] = value;
    setPlayerNames(newNames);
  };

  const handleStartMatch = () => {
    if (playerNames.every(name => name.trim() !== '')) {
      onMatchSetup(matchType, playerNames);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Beer Pong Counter Setup
      </Typography>
      
      <Box sx={{ mt: 4 }}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Match Type</InputLabel>
          <Select
            value={matchType}
            label="Match Type"
            onChange={handleMatchTypeChange}
          >
            <MenuItem value="1v1">1v1</MenuItem>
            <MenuItem value="2v2">2v2</MenuItem>
            <MenuItem value="3v3">3v3</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Player Names
          </Typography>
          {Array.from({ length: parseInt(matchType[0]) }).map((_, index) => (
            <TextField
              key={`player-${index}`}
              fullWidth
              label={`Player ${index + 1}`}
              value={playerNames[index]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePlayerNameChange(index, e.target.value)}
              sx={{ mb: 2 }}
            />
          ))}
        </Box>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={handleStartMatch}
          disabled={playerNames.some(name => name.trim() === '')}
        >
          Start Counter
        </Button>
      </Box>
    </Paper>
  );
};

export default MatchSetup; 