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
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { MatchType } from '../types';

interface MatchSetupProps {
  onMatchSetup: (type: MatchType, team1Names: string[], team2Names: string[], team1Name: string, team2Name: string, useTimer: boolean) => void;
}

const MatchSetup: React.FC<MatchSetupProps> = ({ onMatchSetup }) => {
  const [matchType, setMatchType] = useState<MatchType>('1v1');
  const [team1Names, setTeam1Names] = useState<string[]>(['']);
  const [team2Names, setTeam2Names] = useState<string[]>(['']);
  const [team1Name, setTeam1Name] = useState<string>('Team 1');
  const [team2Name, setTeam2Name] = useState<string>('Team 2');
  const [useTimer, setUseTimer] = useState<boolean>(false);

  const handleMatchTypeChange = (event: SelectChangeEvent<MatchType>) => {
    const newType = event.target.value as MatchType;
    setMatchType(newType);
    
    // Update number of player name fields based on match type
    const playerCount = parseInt(newType[0]);
    setTeam1Names(Array(playerCount).fill(''));
    setTeam2Names(Array(playerCount).fill(''));
  };

  const handleTeam1NameChange = (index: number, value: string) => {
    const newNames = [...team1Names];
    newNames[index] = value;
    setTeam1Names(newNames);
  };

  const handleTeam2NameChange = (index: number, value: string) => {
    const newNames = [...team2Names];
    newNames[index] = value;
    setTeam2Names(newNames);
  };

  const handleStartMatch = () => {
    if (team1Names.every(name => name.trim() !== '') && team2Names.every(name => name.trim() !== '')) {
      onMatchSetup(matchType, team1Names, team2Names, team1Name, team2Name, useTimer);
    }
  };

  const renderTeamInputs = (teamNumber: number, names: string[], onChange: (index: number, value: string) => void, teamName: string, onTeamNameChange: (value: string) => void) => (
    <Box>
      <TextField
        fullWidth
        label={`Team ${teamNumber} Name`}
        value={teamName}
        onChange={(e) => onTeamNameChange(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Typography variant="h6" gutterBottom align="center">
        {teamName}
      </Typography>
      {Array.from({ length: parseInt(matchType[0]) }).map((_, index) => (
        <TextField
          key={`team${teamNumber}-player-${index}`}
          fullWidth
          label={`Player ${index + 1}`}
          value={names[index]}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(index, e.target.value)}
          sx={{ mb: 2 }}
        />
      ))}
    </Box>
  );

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

        <FormControlLabel
          control={
            <Switch
              checked={useTimer}
              onChange={(e) => setUseTimer(e.target.checked)}
              color="primary"
            />
          }
          label="Enable Timer"
          sx={{ mb: 3 }}
        />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            {renderTeamInputs(1, team1Names, handleTeam1NameChange, team1Name, setTeam1Name)}
          </Box>
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
          <Box sx={{ flex: 1 }}>
            {renderTeamInputs(2, team2Names, handleTeam2NameChange, team2Name, setTeam2Name)}
          </Box>
        </Box>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={handleStartMatch}
          disabled={team1Names.some(name => name.trim() === '') || team2Names.some(name => name.trim() === '')}
          sx={{ mt: 4 }}
        >
          Start Counter
        </Button>
      </Box>
    </Paper>
  );
};

export default MatchSetup; 