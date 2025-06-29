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
  const [showQuestionResult, setShowQuestionResult] = useState(false);
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
    const correctAnswer = state.questions[state.currentQuestionIndex].correctAnswer;
    let newSelectedAnswers: number[];

    if (Array.isArray(correctAnswer) && correctAnswer.length > 1) {
      // Handle checkbox selection for multiple answers
      if (event.target.checked) {
        newSelectedAnswers = [...selectedAnswers, value];
      } else {
        newSelectedAnswers = selectedAnswers.filter(answer => answer !== value);
      }
    } else {
      // Handle radio button selection for single answer
      newSelectedAnswers = [value];
    }
    
    setSelectedAnswers(newSelectedAnswers);
    
    // Enable next button if we have the required number of answers
    if (Array.isArray(correctAnswer) && correctAnswer.length > 1) {
      // For multiple choice, enable when number of selections matches number of correct answers
      setShowQuestionResult(newSelectedAnswers.length === correctAnswer.length);
    } else {
      // For single choice, enable as soon as an answer is selected
      setShowQuestionResult(true);
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
      setShowQuestionResult(false);
      setShowResult(false); // Reset showResult for the next question
      

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
    setShowQuestionResult(false);
    setShowResult(false);
    
    // Reset form elements
    const radioInputs = document.querySelectorAll('input[type="radio"]');
    const checkboxInputs = document.querySelectorAll('input[type="checkbox"]');
    
    radioInputs.forEach((input: Element) => {
      if (input instanceof HTMLInputElement) {
        input.checked = false;
      }
    });
    
    checkboxInputs.forEach((input: Element) => {
      if (input instanceof HTMLInputElement) {
        input.checked = false;
      }
    });
  };

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const progress = ((state.currentQuestionIndex + 1) / state.totalQuestions) * 100;
  const isAnswerCorrect = selectedAnswers.length > 0 && currentQuestion && (
    Array.isArray(currentQuestion.correctAnswer)
      ? currentQuestion.correctAnswer.length > 1
        ? (currentQuestion.correctAnswer as number[]).every(answer => selectedAnswers.includes(answer)) && 
          selectedAnswers.every(answer => (currentQuestion.correctAnswer as number[]).includes(answer))
        : selectedAnswers[0] === currentQuestion.correctAnswer[0]
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
            {Array.isArray(currentQuestion.correctAnswer) && currentQuestion.correctAnswer.length > 1 ? (
              <FormGroup>
                {currentQuestion.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={index}
                    control={
                      <Checkbox 
                        checked={selectedAnswers.includes(index)}
                        onChange={handleAnswerSelect}
                        value={index.toString()}
                      />
                    }
                    label={option}
                    sx={{
                      backgroundColor: showQuestionResult
                        ? (Array.isArray(currentQuestion.correctAnswer) && currentQuestion.correctAnswer.includes(index))
                          ? '#e8f5e9'
                          : selectedAnswers.includes(index)
                            ? '#ffebee'
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
              <RadioGroup value={selectedAnswers[0]?.toString() || ''} onChange={handleAnswerSelect}>
                {currentQuestion.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={index}
                    control={<Radio />}
                    label={option}
                    sx={{
                      backgroundColor: showQuestionResult
                        ? (Array.isArray(currentQuestion.correctAnswer) && currentQuestion.correctAnswer[0] === index)
                          ? '#e8f5e9'
                          : selectedAnswers[0] === index
                            ? '#ffebee'
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
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                onClick={() => setShowQuestionResult(true)}
                disabled={selectedAnswers.length === 0}
                color="primary"
                sx={{
                  display: 'none' // Hide the Check Answer button
                }}
              >
                Check Answer
              </Button>
              <Button
                variant="contained"
                onClick={handleNextQuestion}
                disabled={!showQuestionResult}
                color="secondary"
                sx={{
                  bgcolor: '#9c27b0',
                  '&:hover': {
                    bgcolor: '#7b1fa2'
                  }
                }}
              >
                {state.currentQuestionIndex === state.totalQuestions - 1 ? 'Finish' : 'Next'}
              </Button>
            </Box>
            {showQuestionResult && (
              <Box sx={{ mt: 3, p: 2, bgcolor: isAnswerCorrect ? '#e8f5e9' : '#ffebee', borderRadius: 1, border: 1, borderColor: isAnswerCorrect ? '#4caf50' : '#f44336' }}>
                <Typography variant="body1" color={isAnswerCorrect ? 'success.main' : 'error.main'} sx={{ fontWeight: 'bold' }}>
                  {isAnswerCorrect ? '✓ Correct!' : '✗ Incorrect!'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  The correct answer{Array.isArray(currentQuestion.correctAnswer) && currentQuestion.correctAnswer.length > 1 ? 's are' : ' is'}: {Array.isArray(currentQuestion.correctAnswer) 
                    ? currentQuestion.correctAnswer.map(answer => currentQuestion.options[answer]).join(', ') 
                    : currentQuestion.options[currentQuestion.correctAnswer]}
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
}

export default App;
