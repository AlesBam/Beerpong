import React, { useState } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme, Box, Typography } from '@mui/material';
import MatchSetup from './components/MatchSetup';
import MatchPlay from './components/MatchPlay';
import { Match, MatchType } from './types';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

function App() {
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);

  const handleMatchSetup = (type: MatchType, playerNames: string[]) => {
    const newMatch: Match = {
      id: Date.now().toString(),
      type,
      players: playerNames.map(name => ({
        name,
        hits: 0,
        misses: 0,
      })),
      history: [],
    };
    setCurrentMatch(newMatch);
  };

  const handleBack = () => {
    setCurrentMatch(null);
  };

  const handleShot = (playerIndex: number, result: 'hit' | 'miss') => {
    if (!currentMatch) return;

    const newHistory = [...currentMatch.history];
    newHistory.push({
      playerIndex,
      result,
      timestamp: new Date().toISOString(),
    });

    const updatedPlayers = [...currentMatch.players];
    if (result === 'hit') {
      updatedPlayers[playerIndex].hits += 1;
    } else {
      updatedPlayers[playerIndex].misses += 1;
    }

    setCurrentMatch({
      ...currentMatch,
      history: newHistory,
      players: updatedPlayers,
    });
  };

  const handleUndo = () => {
    if (!currentMatch || currentMatch.history.length === 0) return;

    const newHistory = [...currentMatch.history];
    const lastShot = newHistory.pop();
    
    if (!lastShot) return;

    const updatedPlayers = [...currentMatch.players];
    if (lastShot.result === 'hit') {
      updatedPlayers[lastShot.playerIndex].hits -= 1;
    } else {
      updatedPlayers[lastShot.playerIndex].misses -= 1;
    }

    setCurrentMatch({
      ...currentMatch,
      history: newHistory,
      players: updatedPlayers,
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
          {currentMatch ? (
            <MatchPlay
              match={currentMatch}
              onBack={handleBack}
              onShot={handleShot}
              onUndo={handleUndo}
            />
          ) : (
            <MatchSetup onMatchSetup={handleMatchSetup} />
          )}
        </Container>
        <Box sx={{ py: 2, textAlign: 'center', borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            By Alda #69ers
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
