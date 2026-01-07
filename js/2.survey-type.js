// 설문 진행 로직
let currentQuestionIndex = 0;
let answers = []; // 각 문항의 답변 저장 (예: "13", "25" 형식)
let essayAnswers = ['', '', '']; // 주관식 답변 3개

// 주관식 질문 정의
const essayQuestions = [
    {
        id: 26,
        question: '현재 병원 운영에서 가장 고민되거나 해결하고 싶은 문제는 무엇인가요?',
        placeholder: '예: 환자 유치, 직원 관리, 수익 개선, 진료 시스템 등 자유롭게 작성해 주세요.'
    },
    {
        id: 27,
        question: '3년 후 우리 병원이 어떤 모습이 되기를 원하시나요?',
        placeholder: '구체적인 목표나 바라는 변화가 있다면 자유롭게 적어주세요.'
    },
    {
        id: 28,
        question: '시간과 예산이 충분하다면, 병원의 어떤 부분에 가장 투자하고 싶으신가요?',
        placeholder: '예: 장비, 인력, 마케팅, 교육, 인테리어 등 우선순위를 적어주세요.'
    }
];

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

    // 주관식 질문 (26, 27, 28번)
    if (index >= 25) {
        displayEssayQuestion(index - 25);
        return;
    }

    // 객관식 질문 (1-25번)
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

// 주관식 질문 표시 함수
function displayEssayQuestion(essayIndex) {
    const essayQ = essayQuestions[essayIndex];

    const questionHTML = `
        <div class="question-card">
            <div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); border-left: 5px solid #10b981; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="color: #065f46; font-weight: 600; margin: 0;">📝 주관식 질문 ${essayIndex + 1}/3</p>
            </div>
            <div class="question-number">Q${essayQ.id}</div>
            <div class="question-text">${essayQ.question}</div>
            <textarea
                id="essayAnswer"
                style="width: 100%; min-height: 150px; padding: 15px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; font-family: inherit; line-height: 1.6; resize: vertical; margin-top: 20px;"
                placeholder="${essayQ.placeholder}"
                oninput="updateEssayAnswer(${essayIndex})"
            >${essayAnswers[essayIndex]}</textarea>
            <p style="color: #6b7280; font-size: 0.9rem; margin-top: 10px;">💡 이 내용은 매니저 대시보드에서 확인할 수 있으며, 맞춤 컨설팅 제안에 활용됩니다.</p>
        </div>
    `;

    document.getElementById('questionContainer').innerHTML = questionHTML;

    // 진행률 업데이트
    updateProgress();

    // 버튼 상태 업데이트
    updateButtons();
}

// 주관식 답변 업데이트 함수
function updateEssayAnswer(essayIndex) {
    const textarea = document.getElementById('essayAnswer');
    essayAnswers[essayIndex] = textarea.value;
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
    const essayAnsweredCount = essayAnswers.filter(a => a && a.trim().length > 0).length;
    const totalAnswered = answeredCount + essayAnsweredCount;
    const progress = (totalAnswered / 28) * 100;
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
    let isAnswerComplete = false;

    if (currentQuestionIndex < 25) {
        // 객관식 질문 (1-25번)
        const currentAnswer = answers[currentQuestionIndex];
        isAnswerComplete = currentAnswer && currentAnswer.length === 2;
    } else {
        // 주관식 질문 (26-28번)
        const essayIndex = currentQuestionIndex - 25;
        isAnswerComplete = essayAnswers[essayIndex] && essayAnswers[essayIndex].trim().length > 0;
    }

    // 마지막 질문인 경우 (28번 - 주관식 3번째)
    if (currentQuestionIndex === 27) {
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
    if (currentQuestionIndex < 27) {
        displayQuestion(currentQuestionIndex + 1);
    }
}

// 진단 완료
function submitSurvey() {
    // 모든 객관식 답변이 완료되었는지 확인
    const incompleteCount = answers.filter(a => !a || a.length !== 2).length;

    if (incompleteCount > 0) {
        alert(`아직 ${incompleteCount}개의 객관식 질문에 답변하지 않았습니다. 모든 질문에 답변해 주세요.`);
        return;
    }

    // 주관식 답변 확인 (선택사항이지만 권장)
    const essayIncompleteCount = essayAnswers.filter(a => !a || a.trim().length === 0).length;
    if (essayIncompleteCount > 0) {
        const confirm = window.confirm(
            `주관식 질문 ${essayIncompleteCount}개에 답변하지 않으셨습니다.\n` +
            `주관식 답변은 맞춤 컨설팅 제안에 큰 도움이 됩니다.\n\n` +
            `답변하지 않고 진단을 완료하시겠습니까?`
        );
        if (!confirm) {
            return;
        }
    }

    // 답변 데이터 저장
    sessionStorage.setItem('answers', JSON.stringify(answers));
    sessionStorage.setItem('essayAnswers', JSON.stringify(essayAnswers));

    // 결과 페이지로 이동
    window.location.href = '2.result-type.html';
}
