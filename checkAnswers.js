import {questions} from './loadQuestions.js';

function checkAnswers() {
  const q = document.querySelectorAll('[data-question-index]');
  let correctAnswers = 0;
  const totalAnswerCount = q.length;
  q.forEach((question, qindex) => {
    const answers = question.querySelectorAll('input');

    answers.forEach((answer) => {
      answer.disabled = true;
      if (answer.checked) {
        const correct = questions[qindex].answers[parseInt(answer.dataset.index)].correct;
        if (correct) {
          correctAnswers++;
          answer.parentElement.classList.add('correct');
        } else {
          answer.parentElement.classList.add('incorrect');
        }
      }
    });

  });

  const score = (correctAnswers / totalAnswerCount) * 100;
  alert(`Twój wynik to: ${score.toFixed(2)}%`);
}

export { checkAnswers };