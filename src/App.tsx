import { useState, useEffect } from 'react';
import { loadQuestionsFromFiles } from './services/questionService';
import { Box, Container, Typography, Button, Radio, RadioGroup, FormControlLabel, LinearProgress, Checkbox, FormGroup } from '@mui/material';
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

  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
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
    const value = Number(event.target.value);
    if (Array.isArray(state.questions[state.currentQuestionIndex].correctAnswer)) {
      // Handle checkbox selection for multiple answers
      if (event.target.checked) {
        setSelectedAnswers(prev => [...prev, value]);
      } else {
        setSelectedAnswers(prev => prev.filter(answer => answer !== value));
      }
    } else {
      // Handle radio button selection for single answer
      setSelectedAnswers([value]);
      setShowResult(true); // Show result immediately for single-answer questions
    }
    // For multiple-answer questions, show result when all correct answers are selected
    if (Array.isArray(state.questions[state.currentQuestionIndex].correctAnswer)) {
      const correctAnswers = state.questions[state.currentQuestionIndex].correctAnswer as number[];
      if (event.target.checked && selectedAnswers.length + 1 >= correctAnswers.length) {
        setShowResult(true);
      } else {
        setShowResult(false);
      }
    }
  };

  const handleNextQuestion = () => {
    if (selectedAnswers.length === 0) return;

    const newAnswers = [...state.answers];
    newAnswers[state.currentQuestionIndex] = selectedAnswers[0]; // Store first answer for backward compatibility

    const correctAnswer = state.questions[state.currentQuestionIndex].correctAnswer;
    const isCorrect = Array.isArray(correctAnswer)
      ? (correctAnswer as number[]).every(answer => selectedAnswers.includes(answer)) && 
        selectedAnswers.every(answer => (correctAnswer as number[]).includes(answer))
      : selectedAnswers[0] === correctAnswer;
    const newScore = isCorrect ? state.score + 1 : state.score;

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
      setSelectedAnswers([]);
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
    setSelectedAnswers([]);
    setShowResult(false);
  };

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const progress = ((state.currentQuestionIndex + 1) / state.totalQuestions) * 100;
  const isAnswerCorrect = selectedAnswers.length > 0 && currentQuestion && (
    Array.isArray(currentQuestion.correctAnswer)
      ? (currentQuestion.correctAnswer as number[]).every(answer => selectedAnswers.includes(answer)) && 
        selectedAnswers.every(answer => (currentQuestion.correctAnswer as number[]).includes(answer))
      : selectedAnswers[0] === currentQuestion.correctAnswer
  );

  if (isLoading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>
            Loading questions...
          </Typography>
          <LinearProgress sx={{ width: '100%', mt: 2 }} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" color="error" gutterBottom>
            Error: {error}
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  if (showResult) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Assessment Complete!
          </Typography>
          <Typography variant="h5" gutterBottom>
            Your Score: {state.score} out of {state.totalQuestions}
          </Typography>
          <Typography variant="h6" gutterBottom>
            Percentage: {((state.score / state.totalQuestions) * 100).toFixed(2)}%
          </Typography>
          <Button variant="contained" onClick={restartAssessment} sx={{ mt: 2 }}>
            Restart Assessment
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        {currentQuestion && (
          <>
            <LinearProgress variant="determinate" value={progress} sx={{ mb: 4 }} />
            <Typography variant="subtitle2" gutterBottom>
              Question {state.currentQuestionIndex + 1} of {state.totalQuestions}
            </Typography>
            <Typography variant="h6" gutterBottom>
              {currentQuestion.text}
            </Typography>
            {Array.isArray(currentQuestion.correctAnswer) ? (
              <FormGroup>
                {currentQuestion.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={index}
                    control={
                      <Checkbox 
                        checked={selectedAnswers.includes(index)}
                        onChange={handleAnswerSelect}
                        value={index}
                      />
                    }
                    label={option}
                    sx={{
                      backgroundColor: showResult
                        ? (Array.isArray(currentQuestion.correctAnswer) && currentQuestion.correctAnswer.includes(index))
                          ? '#4caf50'
                          : selectedAnswers.includes(index)
                            ? '#f44336'
                            : 'transparent'
                        : 'transparent',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: showResult ? undefined : '#f5f5f5',
                      },
                      p: 1,
                      my: 0.5
                    }}
                  />
                ))}
              </FormGroup>
            ) : (
              <RadioGroup value={selectedAnswers[0]} onChange={handleAnswerSelect}>
                {currentQuestion.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={index}
                    control={<Radio />}
                    label={option}
                    sx={{
                      backgroundColor: showResult
                        ? index === currentQuestion.correctAnswer
                          ? '#4caf50'
                          : selectedAnswers[0] === index
                            ? '#f44336'
                            : 'transparent'
                        : 'transparent',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: showResult ? undefined : '#f5f5f5',
                      },
                      p: 1,
                      my: 0.5
                    }}
                  />
                ))}
              </RadioGroup>
            )}
            {showResult && (
              <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: isAnswerCorrect ? '#e8f5e9' : '#ffebee', borderRadius: 1 }}>
                <Typography variant="body1" color={isAnswerCorrect ? 'success.main' : 'error.main'}>
                  {isAnswerCorrect ? '✓ Correct!' : '✗ Incorrect!'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  The correct answer{Array.isArray(currentQuestion.correctAnswer) && currentQuestion.correctAnswer.length > 1 ? 's are' : ' is'}: {Array.isArray(currentQuestion.correctAnswer) 
                    ? currentQuestion.correctAnswer.map(answer => currentQuestion.options[answer]).join(', ') 
                    : currentQuestion.options[currentQuestion.correctAnswer]}
                </Typography>
              </Box>
            )}
            <Button
              variant="contained"
              onClick={handleNextQuestion}
              disabled={!isAnswerCorrect}
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
