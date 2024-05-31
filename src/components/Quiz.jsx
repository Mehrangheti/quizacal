import React, { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { decode } from "html-entities";
import Question from "./Question";
import styled from "styled-components";
import { BounceLoader } from "react-spinners";

function Quiz(props) {
  const [quiz, setQuiz] = useState([]);
  const [warning, setWarning] = useState(false);
  const [correctAnswerCount, setCorrectAnswerCount] = useState(0);
  const [displayResults, setDisplayResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuizData = async (retryCount = 0) => {
    setLoading(true);
    setQuiz([]);
    setError(null);

    const maxRetries = 5;
    const baseDelay = 1000; 

    try {
      const response = await fetch("https://opentdb.com/api.php?amount=5");
      if (!response.ok) {
        if (response.status === 429 && retryCount < maxRetries) {
          const delay = baseDelay * Math.pow(2, retryCount); 
          setTimeout(() => fetchQuizData(retryCount + 1), delay);
          return;
        } else {
          throw new Error(`Error: ${response.status}`);
        }
      }

      const data = await response.json();
      const results = data.results;
      const quizArray = results.map((result) => {
        const { question, incorrect_answers, correct_answer } = result;
        const allAnswersTemp = [...incorrect_answers, correct_answer];
        const sortedAnswers = allAnswersTemp.sort(() => Math.random() - 0.5);
        return {
          id: nanoid(),
          question: decode(question),
          incorrectAnswers: incorrect_answers,
          correctAnswer: correct_answer,
          allAnswers: sortedAnswers,
          selected: "",
        };
      });

      setQuiz(quizArray);
      setCorrectAnswerCount(0);
      setDisplayResults(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizData();
  }, []);

  const handleSelected = (id, selectedAnswer) => {
    setQuiz((prevQuiz) => {
      return prevQuiz.map((quiz) => {
        return quiz.id === id
          ? {
              ...quiz,
              selected: selectedAnswer,
            }
          : quiz;
      });
    });
  };

  const calculateScore = () => {
    quiz.forEach((quiz) => {
      if (quiz.selected === quiz.correctAnswer) {
        setCorrectAnswerCount((prevCount) => prevCount + 1);
      }
    });
  };

  const checkAnswers = () => {
    const allSelected = quiz.every((q) => q.selected !== "");
    if (allSelected) {
      setWarning(false);
      setDisplayResults(true);
      calculateScore();
    } else {
      setWarning(true);
      setDisplayResults(false);
    }
  };

  const quizElements = quiz.map((question) => (
    <Question
      question={question}
      key={question.id}
      handleSelected={handleSelected}
      displayResults={displayResults}
    />
  ));

  return (
    <div className="quiz-container">
      {loading && (
        <Div>
          <BounceLoader color="#293264" />
        </Div>
      )}
      {error && <p className="error">{error}</p>}
      {!loading && quizElements}
      {quiz.length > 0 && !displayResults && (
        <div className="align-center">
          <button className="check-answers-btn btns" onClick={checkAnswers}>
            Check answers
          </button>
        </div>
      )}
      {warning && (
        <H3 className="warning">Please select an answer for each question</H3>
      )}
      {displayResults && (
        <Div>
          <h5>You scored {correctAnswerCount}/5 correct answers</h5>
          <button
            onClick={() => {
              setLoading(true);
              setDisplayResults(false);
              fetchQuizData();
            }}
            className="play-again-btn btns"
          >
            Play again
          </button>
        </Div>
      )}
    </div>
  );
}

const H3 = styled.h3`
  color: red;
  font-family: "Karla", sans-serif;
`;

const Div = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
`;

export default Quiz;
