import { useState, useEffect } from 'react';
import { loadQuestionsFromFiles } from './services/questionService';
import { Box, Container, Typography, Button, Radio, RadioGroup, FormControlLabel, Paper, LinearProgress } from '@mui/material';
import type { Question, AssessmentState } from './types/types';
import './App.css';

const initialQuestions: Question[] = [];

function App() {
  const [state, setState] = useState<AssessmentState>({
    currentQuestionIndex: 0,
    score: 0,
    totalQuestions: 0,
    answers: [],
    questions: initialQuestions,
  });

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const questions = await loadQuestionsFromFiles();
        if (questions.length === 0) {
          throw new Error('No questions found');
        }
        setState(prev => ({
          ...prev,
          questions,
          totalQuestions: questions.length
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load questions');
      } finally {
        setIsLoading(false);
      }
    };
    loadQuestions();
  }, []);

  const handleAnswerSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAnswer(Number(event.target.value));
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...state.answers];
    newAnswers[state.currentQuestionIndex] = selectedAnswer;

    const newScore = selectedAnswer === state.questions[state.currentQuestionIndex].correctAnswer 
      ? state.score + 1 
      : state.score;

    if (state.currentQuestionIndex === state.totalQuestions - 1) {
      setState({
        ...state,
        score: newScore,
        answers: newAnswers,
      });
      setShowResult(true);
    } else {
      setState({
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1,
        score: newScore,
        answers: newAnswers,
      });
      setSelectedAnswer(null);
    }
  };

  const restartAssessment = () => {
    // Randomize questions order
    const shuffledQuestions = [...state.questions].sort(() => Math.random() - 0.5);
    setState({
      currentQuestionIndex: 0,
      score: 0,
      totalQuestions: state.totalQuestions,
      answers: [],
      questions: shuffledQuestions,
    });
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const progress = ((state.currentQuestionIndex + 1) / state.totalQuestions) * 100;
  const isAnswerCorrect = selectedAnswer !== null && currentQuestion && 
    selectedAnswer === currentQuestion.correctAnswer;

  if (isLoading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <Typography variant="h5" gutterBottom>
            Loading Questions...
          </Typography>
          <LinearProgress sx={{ width: '100%', mt: 2 }} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4, p: 3 }} component={Paper}>
          <Typography variant="h5" color="error" gutterBottom>
            Error: {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  if (showResult) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4, p: 3 }} component={Paper}>
          <Typography variant="h4" gutterBottom>
            Assessment Complete!
          </Typography>
          <Typography variant="h5" gutterBottom>
            Your Score: {state.score} / {state.totalQuestions}
          </Typography>
          <Typography variant="h6" gutterBottom>
            Percentage: {((state.score / state.totalQuestions) * 100).toFixed(1)}%
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={restartAssessment}
            sx={{ mt: 2 }}
          >
            Restart Assessment
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ width: '100%', mb: 2 }}>
        <LinearProgress variant="determinate" value={progress} />
      </Box>
      <Box sx={{ p: 3 }} component={Paper}>
        <Typography variant="subtitle1" gutterBottom>
          Question {state.currentQuestionIndex + 1} of {state.totalQuestions}
        </Typography>
        {currentQuestion && (
          <>
            <Typography variant="h6" gutterBottom>
              {currentQuestion.text}
            </Typography>
            <RadioGroup value={selectedAnswer} onChange={handleAnswerSelect}>
              {currentQuestion.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={index}
                  control={<Radio />}
                  label={option}
                  sx={{
                    color: selectedAnswer !== null ? (
                      index === currentQuestion.correctAnswer ? 'green' :
                      index === selectedAnswer ? 'red' : 'inherit'
                    ) : 'inherit'
                  }}
                />
              ))}
            </RadioGroup>
            {selectedAnswer !== null && (
              <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: isAnswerCorrect ? '#e8f5e9' : '#ffebee', borderRadius: 1 }}>
                <Typography variant="body1" color={isAnswerCorrect ? 'success.main' : 'error.main'}>
                  {isAnswerCorrect ? '✓ Correct!' : '✗ Incorrect!'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  The correct answer is: {currentQuestion.options[currentQuestion.correctAnswer]}
                </Typography>
              </Box>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handleNextQuestion}
              disabled={selectedAnswer === null}
              sx={{ mt: 2 }}
            >
              {state.currentQuestionIndex === state.totalQuestions - 1 ? 'Finish' : 'Next'}
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
}

export default App;
