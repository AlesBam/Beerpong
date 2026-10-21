import React, { useState, useEffect } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme, Box, Typography } from '@mui/material';
import MatchSetup from './components/MatchSetup';
import MatchPlay from './components/MatchPlay';
import { Match, MatchType, LeagueType, MatchTimer } from './types';
import { startBaseTimer } from './timer';
import { Analytics } from "@vercel/analytics/react"

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

const STORAGE_KEY = 'beerPongMatch';

function loadSavedMatch(): Match | null {
  try {
    const savedMatch = localStorage.getItem(STORAGE_KEY);
    if (!savedMatch) return null;
    const match: Match = JSON.parse(savedMatch);
    // Zápas uložený starší verzí appky nemá časovač – spustíme mu nový.
    if (match.useTimer && !match.timer) {
      match.timer = startBaseTimer(match.type, Date.now());
    }
    return match;
  } catch {
    return null;
  }
}

function App() {
  const [currentMatch, setCurrentMatch] = useState<Match | null>(loadSavedMatch);

  // Save to localStorage whenever match changes
  useEffect(() => {
    if (currentMatch) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentMatch));
    }
  }, [currentMatch]);

  const handleMatchSetup = (type: MatchType, team1Names: string[], team2Names: string[], team1Name: string, team2Name: string, useTimer: boolean, premierLeague: boolean, selectedLeague?: LeagueType) => {
    const newMatch: Match = {
      id: Date.now().toString(),
      type,
      players: [...team1Names, ...team2Names].map(name => ({
        name,
        hits: 0,
        misses: 0,
      })),
      history: [],
      team1Name,
      team2Name,
      useTimer,
      timer: useTimer ? startBaseTimer(type, Date.now()) : undefined,
      premierLeague,
      selectedLeague
    };
    setCurrentMatch(newMatch);
  };

  const handleBack = () => {
    // Clear localStorage when going back to setup
    localStorage.removeItem(STORAGE_KEY);
    setCurrentMatch(null);
  };

  const handleReset = () => {
    // Clear localStorage and current match
    localStorage.removeItem(STORAGE_KEY);
    setCurrentMatch(null);
  };

  // Všechny změny zápasu jdou přes funkční updater (prev => next), protože hod
  // a reset časovače přijdou ve stejném kliknutí a druhý update nesmí přepsat první.
  // Updater musí být čistý (nic nemutovat): React.StrictMode ho v dev režimu volá dvakrát.
  const changePlayerCount = (players: Match['players'], playerIndex: number, result: 'hit' | 'miss', delta: number) =>
    players.map((player, index) =>
      index !== playerIndex
        ? player
        : result === 'hit'
          ? { ...player, hits: player.hits + delta }
          : { ...player, misses: player.misses + delta }
    );

  const handleShot = (playerIndex: number, result: 'hit' | 'miss') => {
    const timestamp = new Date().toISOString();
    setCurrentMatch(prev => prev && {
      ...prev,
      history: [...prev.history, { playerIndex, result, timestamp }],
      players: changePlayerCount(prev.players, playerIndex, result, 1),
    });
  };

  const handleUndo = () => {
    setCurrentMatch(prev => {
      if (!prev || prev.history.length === 0) return prev;
      const lastShot = prev.history[prev.history.length - 1];
      return {
        ...prev,
        history: prev.history.slice(0, -1),
        players: changePlayerCount(prev.players, lastShot.playerIndex, lastShot.result, -1),
      };
    });
  };

  const handleTimerChange = (timer: MatchTimer) => {
    setCurrentMatch(prev => prev && { ...prev, timer });
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
              onTimerChange={handleTimerChange}
              onReset={handleReset}
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
      <Analytics />
    </ThemeProvider>
  );
}

export default App;
