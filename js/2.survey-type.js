// 설문 진행 로직
let currentQuestionIndex = 0;
let answers = []; // 각 문항의 답변 저장 (예: "13", "25" 형식)

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 세션 스토리지에서 병원 정보 가져오기
    const clinicName = sessionStorage.getItem('clinicName');
    const directorName = sessionStorage.getItem('directorName');
    const region = sessionStorage.getItem('region');
    const doctorCount = sessionStorage.getItem('doctorCount');
    const nurseCount = sessionStorage.getItem('nurseCount');
    const counselorCount = sessionStorage.getItem('counselorCount');

    if (!clinicName || !directorName) {
        alert('병원 정보가 없습니다. 처음부터 다시 시작해 주세요.');
        window.location.href = '2.index-type.html';
        return;
    }

    // 헤더에 병원 정보 표시
    let hospitalInfoText = `${clinicName} | ${directorName} 원장님`;
    if (region) {
        hospitalInfoText += ` | ${region}`;
    }
    document.getElementById('hospitalInfo').textContent = hospitalInfoText;

    // 답변 배열 초기화 (25문항)
    answers = new Array(25).fill(null);

    // 첫 번째 질문 표시
    displayQuestion(0);

    // 버튼 이벤트 리스너
    document.getElementById('prevBtn').addEventListener('click', previousQuestion);
    document.getElementById('nextBtn').addEventListener('click', nextQuestion);
    document.getElementById('submitBtn').addEventListener('click', submitSurvey);
});

// 질문 표시 함수
function displayQuestion(index) {
    currentQuestionIndex = index;
    const question = questions[index];

    // 질문 카드 HTML 생성
    const questionHTML = `
        <div class="question-card">
            <div class="question-number">Q${question.id}</div>
            <div class="question-text">${question.question}</div>
            <div class="options">
                ${question.options.map((option, i) => `
                    <div class="option" data-option="${i + 1}" onclick="selectOption(${i + 1})">
                        <div class="option-badge">${i + 1}</div>
                        <span>${option}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.getElementById('questionContainer').innerHTML = questionHTML;

    // 이전에 선택한 답변이 있으면 복원
    if (answers[index]) {
        const [primary, secondary] = answers[index].split('');
        const options = document.querySelectorAll('.option');

        options[parseInt(primary) - 1].classList.add('selected-primary');
        options[parseInt(primary) - 1].querySelector('.option-badge').textContent = '○';

        if (secondary) {
            options[parseInt(secondary) - 1].classList.add('selected-secondary');
            options[parseInt(secondary) - 1].querySelector('.option-badge').textContent = '△';
        }
    }

    // 진행률 업데이트
    updateProgress();

    // 버튼 상태 업데이트
    updateButtons();
}

// 옵션 선택 함수
function selectOption(optionNumber) {
    const currentAnswer = answers[currentQuestionIndex];
    const options = document.querySelectorAll('.option');
    const clickedOption = document.querySelector(`[data-option="${optionNumber}"]`);

    // 이미 1순위로 선택된 경우 - 선택 해제
    if (currentAnswer && currentAnswer[0] === optionNumber.toString()) {
        answers[currentQuestionIndex] = currentAnswer[1] ? currentAnswer[1] : null;
        clickedOption.classList.remove('selected-primary');
        clickedOption.querySelector('.option-badge').textContent = optionNumber;

        // 2순위가 있었다면 1순위로 승격
        if (currentAnswer[1]) {
            const secondOption = document.querySelector(`[data-option="${currentAnswer[1]}"]`);
            secondOption.classList.remove('selected-secondary');
            secondOption.classList.add('selected-primary');
            secondOption.querySelector('.option-badge').textContent = '○';
            answers[currentQuestionIndex] = currentAnswer[1];
        }
    }
    // 이미 2순위로 선택된 경우 - 선택 해제
    else if (currentAnswer && currentAnswer.length === 2 && currentAnswer[1] === optionNumber.toString()) {
        answers[currentQuestionIndex] = currentAnswer[0];
        clickedOption.classList.remove('selected-secondary');
        clickedOption.querySelector('.option-badge').textContent = optionNumber;
    }
    // 새로운 선택
    else {
        if (!currentAnswer) {
            // 첫 번째 선택 (1순위)
            answers[currentQuestionIndex] = optionNumber.toString();
            clickedOption.classList.add('selected-primary');
            clickedOption.querySelector('.option-badge').textContent = '○';
        } else if (currentAnswer.length === 1) {
            // 두 번째 선택 (2순위)
            answers[currentQuestionIndex] = currentAnswer + optionNumber.toString();
            clickedOption.classList.add('selected-secondary');
            clickedOption.querySelector('.option-badge').textContent = '△';
        } else {
            // 이미 2개가 선택된 경우 - 기존 2순위를 새로운 2순위로 교체
            const oldSecondary = document.querySelector(`[data-option="${currentAnswer[1]}"]`);
            oldSecondary.classList.remove('selected-secondary');
            oldSecondary.querySelector('.option-badge').textContent = currentAnswer[1];

            answers[currentQuestionIndex] = currentAnswer[0] + optionNumber.toString();
            clickedOption.classList.add('selected-secondary');
            clickedOption.querySelector('.option-badge').textContent = '△';
        }
    }

    updateButtons();
}

// 진행률 업데이트
function updateProgress() {
    const answeredCount = answers.filter(a => a && a.length === 2).length;
    const progress = (answeredCount / 25) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
}

// 버튼 상태 업데이트
function updateButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    // 이전 버튼
    if (currentQuestionIndex === 0) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'block';
    }

    // 현재 질문의 답변이 완료되었는지 확인
    const currentAnswer = answers[currentQuestionIndex];
    const isAnswerComplete = currentAnswer && currentAnswer.length === 2;

    // 마지막 질문인 경우
    if (currentQuestionIndex === 24) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
        submitBtn.disabled = !isAnswerComplete;
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
        nextBtn.disabled = !isAnswerComplete;
    }
}

// 이전 질문으로
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        displayQuestion(currentQuestionIndex - 1);
    }
}

// 다음 질문으로
function nextQuestion() {
    if (currentQuestionIndex < 24) {
        displayQuestion(currentQuestionIndex + 1);
    }
}

// 진단 완료
function submitSurvey() {
    // 모든 답변이 완료되었는지 확인
    const incompleteCount = answers.filter(a => !a || a.length !== 2).length;

    if (incompleteCount > 0) {
        alert(`아직 ${incompleteCount}개의 질문에 답변하지 않았습니다. 모든 질문에 답변해 주세요.`);
        return;
    }

    // 답변 데이터 저장
    sessionStorage.setItem('answers', JSON.stringify(answers));

    // 결과 페이지로 이동
    window.location.href = '2.result-type.html';
}
