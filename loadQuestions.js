import { checkAnswers } from "./checkAnswers.js";

let questions = [];

// 🔹 Teraz ładujemy lokalny plik JSON wygenerowany parserem
fetch('https://raw.githubusercontent.com/Kiszkah/zawodowyinfopgf08/refs/heads/master/output.json')
  .then(response => response.json())
  .then(data => {
    // Możesz ograniczyć np. do 40 pytań
    questions = getRandomItemsFromArray(data, 40);

    console.log("[INFO] Załadowano pytania:", questions.length);
    const quizContainer = document.getElementById('quiz-container');

    questions.forEach((question, index) => {
      const questionElement = document.createElement('div');
      questionElement.classList.add('question');
      questionElement.dataset.questionIndex = index;

      // Numer pytania
      const questionNumber = document.createElement('h3');
      questionNumber.innerText = `Pytanie ${index + 1}:`;
      questionElement.appendChild(questionNumber);

      // Tekst pytania
      const questionText = document.createElement('p');
      questionText.innerText = `${question.question}`;
      questionText.classList.add('question-text');
      questionElement.appendChild(questionText);

      // Dodaj tabelę (jeśli istnieje)
      if (question.table) {
        const table = document.createElement('div');
        table.innerHTML = question.table;
        questionElement.appendChild(table);
      }

      // Dodaj odpowiedzi
      const answers = document.createElement('div');
      const punctuation = ['A', 'B', 'C', 'D', 'E'];

      // Losowe przetasowanie odpowiedzi
      const shuffledAnswers = getRandomItemsFromArray(question.answers, question.answers.length);

      shuffledAnswers.forEach((answer, ansIndex) => {
        const item = document.createElement('li');
        const text = document.createElement('p');
        text.innerText = `${punctuation[ansIndex]}. ${answer.text}`;

        const checkBox = document.createElement('input');
        checkBox.dataset.index = ansIndex;
        checkBox.dataset.qIndex = questionElement.dataset.questionIndex;
        checkBox.type = 'checkbox';

        // Można zaznaczyć tylko jedną odpowiedź w pytaniu
        checkBox.addEventListener('click', cbox => {
          const box = cbox.target;
          const questionIndex = box.dataset.qIndex;
          const answerIndex = box.dataset.index;

          const questions = document.querySelectorAll(`[data-question-index]`);
          questions.forEach(question => {
            if (question.dataset.questionIndex === questionIndex) {
              const answers = question.querySelectorAll('input');
              answers.forEach(answer => {
                if (answer.dataset.index !== answerIndex) {
                  answer.checked = false;
                }
              });
            }
          });
        });

        item.appendChild(checkBox);
        item.appendChild(text);
        answers.appendChild(item);
      });

      questionElement.appendChild(answers);

      quizContainer.appendChild(questionElement);
    });

    // Dodaj przycisk "Sprawdź wynik"
    const checkAnswersButton = document.createElement('button');
    checkAnswersButton.innerText = 'Sprawdź wynik';
    checkAnswersButton.onclick = checkAnswers;
    checkAnswersButton.classList.add('check-answers');

    quizContainer.appendChild(checkAnswersButton);
  });

function getRandomItemsFromArray(arr, numItems) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.slice(0, numItems);
}

export { questions };
