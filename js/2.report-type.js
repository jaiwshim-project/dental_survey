// 결과 리포트 생성 및 표시 로직

document.addEventListener('DOMContentLoaded', function() {
    // 세션 스토리지에서 데이터 가져오기
    const clinicName = sessionStorage.getItem('clinicName');
    const directorName = sessionStorage.getItem('directorName');
    const region = sessionStorage.getItem('region');
    const doctorCount = sessionStorage.getItem('doctorCount');
    const nurseCount = sessionStorage.getItem('nurseCount');
    const counselorCount = sessionStorage.getItem('counselorCount');
    const diagnosisDate = sessionStorage.getItem('diagnosisDate');
    const answersJSON = sessionStorage.getItem('answers');

    if (!clinicName || !directorName || !answersJSON) {
        alert('진단 데이터가 없습니다. 처음부터 다시 시작해 주세요.');
        window.location.href = 'index-type.html';
        return;
    }

    const answers = JSON.parse(answersJSON);

    // 병원 정보 표시 (2줄로 나누기)
    // 첫 번째 줄: 병원명 + 원장명 (병원명 내 공백 제거)
    let clinicNameNoSpace = clinicName.replace(/\s+/g, '');
    let hospitalInfoText = `${clinicNameNoSpace} ${directorName} 원장`;
    document.getElementById('hospitalInfo').textContent = hospitalInfoText;

    // 두 번째 줄: 지역 + 직원 정보
    let hospitalDetailParts = [];
    if (region) {
        hospitalDetailParts.push(region);
    }
    if (doctorCount && nurseCount) {
        let staffInfo = `의사 ${doctorCount}명, 간호사 ${nurseCount}명`;
        if (counselorCount) {
            staffInfo += `, 상담사 ${counselorCount}명`;
        }
        hospitalDetailParts.push(staffInfo);
    }
    if (hospitalDetailParts.length > 0) {
        document.getElementById('hospitalDetail').textContent = hospitalDetailParts.join(' | ');
    }

    // 진단 일자 표시
    if (diagnosisDate) {
        document.getElementById('diagnosisDate').textContent = '진단 일자: ' + diagnosisDate;
    }

    // 답변 분석
    const result = analyzeAnswers(answers);

    // 결과 표시
    displaySummary(result.analysis, directorName);
    displayRadarChart(result);
    displayScoreSummary(result);
    displayPrimaryType(result.analysis.primary);
    displaySecondaryType(result.analysis.secondary);
    displayProposal(result.analysis);
    displayRoadmap(result.analysis);

    // 주관식 답변 표시
    displayEssayAnswers();

    // AI 맞춤형 피드백 생성 및 표시
    displayCustomFeedback(result.analysis);

    // 콘솔에 디버깅 정보 출력
    console.log('진단 결과:', result);
    console.log('답변 데이터:', answers);

    // 주관식 답변 가져오기
    const essayAnswersJSON = sessionStorage.getItem('essayAnswers');
    const essayAnswers = essayAnswersJSON ? JSON.parse(essayAnswersJSON) : null;

    // 진단 결과를 localStorage에 저장 (매니저 대시보드용)
    saveDiagnosisToHistory({
        clinicName: clinicName,
        directorName: directorName,
        region: region,
        date: diagnosisDate,
        diagnosis2: {
            answers: answers,
            essayAnswers: essayAnswers,
            scores: result.scores,
            primaryType: {
                type: result.analysis.primary.type,
                name: result.analysis.primary.name,
                fullName: result.analysis.primary.fullName,
                score: result.analysis.primary.score
            },
            secondaryType: {
                type: result.analysis.secondary.type,
                name: result.analysis.secondary.name,
                fullName: result.analysis.secondary.fullName,
                score: result.analysis.secondary.score
            }
        }
    });
});

// 진단 기록 저장 함수
function saveDiagnosisToHistory(diagnosisData) {
    try {
        // localStorage에서 기존 기록 가져오기
        let history = JSON.parse(localStorage.getItem('diagnosisHistory') || '[]');

        // 병원명과 원장명으로 기존 기록 찾기
        const existingIndex = history.findIndex(h =>
            h.clinicName === diagnosisData.clinicName &&
            h.directorName === diagnosisData.directorName
        );

        const doctorCount = sessionStorage.getItem('doctorCount');
        const nurseCount = sessionStorage.getItem('nurseCount');
        const counselorCount = sessionStorage.getItem('counselorCount');

        if (existingIndex >= 0) {
            // 기존 기록이 있으면 diagnosis2 업데이트
            history[existingIndex].diagnosis2 = diagnosisData.diagnosis2;
            history[existingIndex].date = diagnosisData.date;
            history[existingIndex].region = diagnosisData.region;
            history[existingIndex].doctorCount = doctorCount;
            history[existingIndex].nurseCount = nurseCount;
            history[existingIndex].counselorCount = counselorCount;
            history[existingIndex].timestamp = Date.now();
        } else {
            // 새로운 기록 추가 (1번 진단 없이 2번만 한 경우)
            const newRecord = {
                id: 'diag_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                timestamp: Date.now(),
                clinicName: diagnosisData.clinicName,
                directorName: diagnosisData.directorName,
                region: diagnosisData.region,
                doctorCount: doctorCount,
                nurseCount: nurseCount,
                counselorCount: counselorCount,
                date: diagnosisData.date,
                diagnosis1: null,
                diagnosis2: diagnosisData.diagnosis2
            };
            history.push(newRecord);
        }

        // localStorage에 저장
        localStorage.setItem('diagnosisHistory', JSON.stringify(history));
        console.log('진단 기록 저장 완료:', history);
    } catch (error) {
        console.error('진단 기록 저장 실패:', error);
    }
}

// 분석 결과 개요 표시
function displaySummary(analysis, directorName) {
    const primary = analysis.primary;
    const secondary = analysis.secondary;

    let summary = `<strong>${directorName} 원장님</strong>은 `;
    summary += `<strong style="color: #2563eb;">${primary.fullName}(${primary.type}형, ${primary.score}점)</strong>을 주 유형으로, `;
    summary += `<strong style="color: #10b981;">${secondary.fullName}(${secondary.type}형, ${secondary.score}점)</strong>을 보조 유형으로 가지고 계십니다. `;

    // 주 유형과 보조 유형의 조합에 따른 설명
    summary += generateCombinationDescription(primary, secondary);

    // 추천사항과 기대효과 추가
    const recommendation = generateRecommendation(primary, secondary);
    summary += `<br><br><strong style="color: #2563eb;">💡 추천 전략:</strong> ${recommendation.strategy}`;

    // 실행안 추가
    const actionPlan = generateActionPlan(primary, secondary);
    summary += `<br><br><strong style="color: #f59e0b;">📋 실행안:</strong> ${actionPlan}`;

    summary += `<br><br><strong style="color: #10b981;">🎯 기대 효과:</strong> ${recommendation.effect}`;

    document.getElementById('diagnosisSummary').innerHTML = summary;
}

// 유형 조합에 따른 설명 생성
function generateCombinationDescription(primary, secondary) {
    const combKey = `${primary.type}-${secondary.type}`;

    // 주요 조합에 대한 설명
    const descriptions = {
        '4-5': `${primary.keyword}를 우선시하면서도 ${secondary.keyword}를 함께 고려하는 균형잡힌 운영 스타일로, 경영 효율성과 환자 만족도를 동시에 추구하는 특징을 보입니다.`,
        '4-2': `${primary.keyword}를 중심으로 ${secondary.keyword}를 갖춘 운영 스타일로, 체계적이고 수익 지향적인 병원 경영을 추구합니다.`,
        '5-4': `${primary.keyword}를 최우선으로 하면서 ${secondary.keyword}도 중요하게 생각하는 유형으로, 환자 중심 경영을 지향합니다.`,
        '2-4': `${primary.keyword}를 기반으로 ${secondary.keyword}를 추구하는 유형으로, 체계적이고 안정적인 수익 구조를 선호합니다.`,
        '1-4': `${primary.keyword}를 중시하면서 ${secondary.keyword}를 고려하는 유형으로, 신속한 의사결정과 경영 효율을 추구합니다.`,
        '3-5': `${primary.keyword}를 우선시하고 ${secondary.keyword}를 함께 고려하는 유형으로, 직원과 환자 모두를 중시하는 인간 중심 경영을 지향합니다.`
    };

    // 조합별 설명이 있으면 사용, 없으면 기본 설명
    if (descriptions[combKey]) {
        return descriptions[combKey];
    } else {
        return `${primary.keyword}를 중심으로 ${secondary.keyword}를 보완적으로 활용하는 운영 스타일을 보이고 계십니다.`;
    }
}

// 유형 조합에 따른 실행안 생성
function generateActionPlan(primary, secondary) {
    const combKey = `${primary.type}-${secondary.type}`;

    const actionPlans = {
        '4-5': '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스(공감→이해→결정권 제공→가치 전달→신뢰 관계 형성) 집중 코칭 및 내재화 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 동일 프로세스 교육 + 원장 브랜딩 활동 시작(철학·가치관 신문기사/영상 제작) → <strong>3단계 (차별화 브랜딩):</strong> AI 갤러리 & AI 아트 시네마 설치로 환자 심리 안정 공간 구축 + 지역 사회 공개로 예술 문화 기여 브랜딩 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담 체계로 고정 환자 전환 + 데이터 기반 지속 최적화',
        '4-2': '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스(공감→이해→결정권 제공→가치 전달→신뢰 관계 형성) 코칭 + 체계적 상담 기준 및 측정 지표 수립 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 동일 프로세스 교육 + 표준 프로세스 문서화 + 원장 브랜딩 활동(철학·가치관 신문기사/영상) → <strong>3단계 (시스템 구축):</strong> 데이터 기반 상담 관리 시스템 도입 + 체계적 환자 경험 추적 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 지속적 KPI 모니터링 및 최적화',
        '5-4': '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스(공감→이해→결정권 제공→가치 전달→신뢰 관계 형성) 집중 코칭으로 환자 신뢰 구축 역량 극대화 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 동일 프로세스 교육 + 원장 브랜딩 활동(철학·가치관 신문기사/영상) + 환자 피드백 시스템 구축 → <strong>3단계 (차별화 브랜딩):</strong> AI 갤러리 & AI 아트 시네마로 환자 심리 안정 공간 조성 + 예술 문화 기여 브랜딩 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 환자 만족도와 수익성 균형 최적화',
        '2-4': '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스(공감→이해→결정권 제공→가치 전달→신뢰 관계 형성) 코칭 + 상담 기준 및 치료 가이드라인 명문화 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 동일 프로세스 교육 + 표준 프로세스 문서화 및 시스템화 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (시스템 구축):</strong> 데이터 기반 상담 관리 시스템 구축 + 체계적 환자 경험 데이터 축적 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 안정적 수익 구조 확립',
        '1-4': '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스(공감→이해→결정권 제공→가치 전달→신뢰 관계 형성) 집중 코칭으로 신속한 내재화 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 빠른 프로세스 교육 + 원장 브랜딩 활동(철학·가치관 신문기사/영상) + 즉각적 ROI 확인 → <strong>3단계 (차별화 브랜딩):</strong> 성과 검증 후 차별화 요소 선택 도입(AI 갤러리/아트 시네마 등) + 브랜드 홍보 강화 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 신속한 피드백 반영 체계',
        '3-5': '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스(공감→이해→결정권 제공→가치 전달→신뢰 관계 형성) 코칭 + 환자 중심 리더십 강화 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 동일 프로세스 심화 교육 + 환자 응대 표준 수립 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (차별화 브랜딩):</strong> 팀 전체 환자 경험 개선 활동 + AI 갤러리 & AI 아트 시네마로 환자 심리 안정 공간 조성 + 문화 기여 브랜딩 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 직원-환자 만족도 통합 관리',
        '5-2': '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스(공감→이해→결정권 제공→가치 전달→신뢰 관계 형성) 코칭으로 환자 신뢰 구축 역량 극대화 + 상담 표준 수립 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 동일 프로세스 교육 + 프로세스 문서화 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (차별화 브랜딩):</strong> 투명하고 체계적인 상담 시스템 + 환자 후기 관리 + 지역 사회 문화 기여 활동 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 지역 신뢰 브랜드 포지셔닝 완성',
        '1-5': '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스(공감→이해→결정권 제공→가치 전달→신뢰 관계 형성) 신속 코칭 및 즉시 적용 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 빠른 프로세스 교육 + 환자 피드백 시스템 구축 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (차별화 브랜딩):</strong> 환자 경험 개선 성과 브랜드 홍보 + 차별화 요소 도입(AI 갤러리 등) → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 지속적 혁신 체계',
        '2-5': '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스(공감→이해→결정권 제공→가치 전달→신뢰 관계 형성) 코칭으로 환자 신뢰 구축 + 표준 프로세스 수립 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 동일 프로세스 교육 + 프로세스 문서화 + 원장 브랜딩(철학·가치관 신문기사/영상) + 환자 데이터 수집 체계 → <strong>3단계 (차별화 브랜딩):</strong> 일관된 고품질 서비스 제공 + 환자 신뢰 증거 축적 + 지역 문화 기여 활동 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 체계적 환자 중심 브랜드 완성',
        '1-3': '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스(공감→이해→결정권 제공→가치 전달→신뢰 관계 형성) 신속 코칭 + 직원 교육 방법론 전수 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 빠른 프로세스 교육 + 환자 응대 실습 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (차별화 브랜딩):</strong> 팀 전체 환자 경험 개선 문화 정착 + 성공 사례 공유 + 브랜드 홍보 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 지속적 학습 조직 구축',
        '3-4': '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스(공감→이해→결정권 제공→가치 전달→신뢰 관계 형성) 코칭 + 성과 지표 설정 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 동일 프로세스 교육 + 개인별/팀별 역량 개발 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (시스템 구축):</strong> 데이터 기반 성과 관리 시스템 + 팀 역량과 환자 만족도 연계 분석 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 팀 역량과 수익성 통합 관리',
        '2-3': '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스(공감→이해→결정권 제공→가치 전달→신뢰 관계 형성) 코칭 + 교육 프로그램 설계 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 동일 프로세스 표준화 교육 + 운영 매뉴얼 작성 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (시스템 구축):</strong> 일관된 서비스 품질 모니터링 체계 + 환자 응대 표준 정착 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 안정적 팀 운영 체계 완성',
        '1-2': '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스(공감→이해→결정권 제공→가치 전달→신뢰 관계 형성) 신속 코칭 + 표준 프로세스 초안 작성 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 빠른 프로세스 교육 + 파일럿 운영 및 피드백 반영 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (시스템 구축):</strong> 프로세스 시스템화 및 표준 체계 확립 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 효율성과 안정성 균형 달성'
    };

    if (actionPlans[combKey]) {
        return actionPlans[combKey];
    } else {
        // 주 유형 기반 기본 실행안
        const defaultPlans = {
            1: '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스(공감→이해→결정권 제공→가치 전달→신뢰 관계 형성) 신속 코칭 및 즉시 적용 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 빠른 프로세스 교육 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (차별화 브랜딩):</strong> 검증된 솔루션 확대 적용 + 브랜드 홍보 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 지속적 혁신 체계',
            2: '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스(공감→이해→결정권 제공→가치 전달→신뢰 관계 형성) 코칭 + 기준 및 프로세스 문서화 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 동일 프로세스 교육 + 표준 체계 구축 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (시스템 구축):</strong> 데이터 기반 관리 체계 도입 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 안정적 운영 체계 완성',
            3: '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스(공감→이해→결정권 제공→가치 전달→신뢰 관계 형성) 코칭 + 직원 교육 프로그램 설계 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 동일 프로세스 교육 + 역량 개발 실행 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (차별화 브랜딩):</strong> 팀 전체 확산 및 환자 경험 개선 문화 정착 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 학습 조직 체계 완성',
            4: '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스(공감→이해→결정권 제공→가치 전달→신뢰 관계 형성) 코칭 + KPI 설정 및 측정 체계 구축 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 동일 프로세스 교육 + 데이터 기반 의사결정 시스템 도입 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (시스템 구축):</strong> 성과 관리 최적화 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 지속적 수익 개선 체계 완성',
            5: '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스(공감→이해→결정권 제공→가치 전달→신뢰 관계 형성) 집중 코칭으로 환자 신뢰 구축 역량 극대화 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 동일 프로세스 교육 + 환자 중심 프로세스 구축 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (차별화 브랜딩):</strong> 신뢰 기반 브랜드 구축 + 환자 경험 개선 활동 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 환자 충성도 극대화 체계 완성'
        };

        return defaultPlans[primary.type] || '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스(공감→이해→결정권 제공→가치 전달→신뢰 관계 형성) 코칭 및 현황 진단 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 동일 프로세스 교육 + 핵심 솔루션 도입 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (차별화 브랜딩):</strong> 효과 측정 및 최적화 + 브랜드 구축 활동 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 지속 가능한 성장 체계 구축';
    }
}

// 유형 조합에 따른 추천사항 생성
function generateRecommendation(primary, secondary) {
    const combKey = `${primary.type}-${secondary.type}`;

    const recommendations = {
        '4-5': {
            strategy: 'AI 기반 상담 분석 시스템을 도입하여 환자 만족도를 유지하면서 상담 효율성을 높이고, 데이터 기반 의사결정으로 결정률을 개선하는 것을 우선 추진하시는 것이 좋습니다. 환자 경험 개선을 위해 상담 과정에서 환자의 고민과 니즈를 체계적으로 파악하고, 맞춤형 솔루션을 제안하는 시스템을 구축하십시오. 또한 환자 후기 관리와 사후 케어 프로세스를 강화하여 신뢰 기반의 브랜드 이미지를 만들고, 환자가 자발적으로 병원을 추천하고 싶게 만드는 경험을 설계하는 것이 중요합니다.',
            effect: '상담 시간은 30% 단축하면서도 환자 만족도는 유지하고, 치료 결정률은 20-30% 향상되어 월 평균 수익 증대 및 환자 신뢰도 상승 효과를 기대할 수 있습니다. 환자 재방문율 증가와 긍정적 입소문 확산으로 자연스러운 신규 환자 유입이 가능하며, 지역 내 신뢰받는 치과로 브랜드 포지셔닝을 강화할 수 있습니다.'
        },
        '4-2': {
            strategy: '표준화된 상담 프로세스와 KPI 관리 시스템을 구축하고, 데이터 기반 의사결정 체계를 정립하여 안정적이고 예측 가능한 수익 구조를 만드는 것을 추천합니다. 환자 신뢰 구축을 위해 상담 기준과 치료 가이드라인을 명확히 하여 환자에게 투명하게 공개하고, 일관된 고품질 서비스 제공으로 신뢰도를 높이십시오. 체계적인 환자 관리 시스템과 사후 관리 프로세스를 통해 "믿을 수 있는 치과"라는 브랜드 이미지를 구축하는 것이 중요합니다.',
            effect: '상담 품질의 일관성 확보로 결정률 15-25% 향상, 체계적인 수익 관리를 통한 안정적 성장 달성이 가능하며, 직원 업무 효율도 개선됩니다. 환자 신뢰도 상승으로 재방문율과 추천율이 증가하며, "체계적이고 신뢰할 수 있는 치과"로 브랜드 포지셔닝이 가능합니다.'
        },
        '5-4': {
            strategy: '환자 경험을 해치지 않으면서 운영 효율을 높이는 AI 솔루션 도입과, 환자 피드백 시스템을 통한 지속적인 서비스 개선을 병행하시길 권장합니다. 환자 여정(Patient Journey)의 모든 접점에서 신뢰와 만족을 제공하는 경험 설계가 핵심이며, 환자 후기와 사례를 체계적으로 관리하여 브랜드 스토리텔링에 활용하십시오. 환자 중심 문화를 유지하면서도 데이터로 입증 가능한 성과를 만들어 "환자도 만족하고 경영도 우수한 치과"라는 이미지를 구축하는 것이 중요합니다.',
            effect: '환자 만족도 및 재방문율 증가와 함께 수익성도 개선되어, 브랜드 가치 상승과 안정적 매출 증대를 동시에 달성할 수 있습니다. 환자 추천율이 높아져 마케팅 비용 절감 효과도 기대되며, 지역 내 "가장 환자 중심적인 치과"로 차별화된 브랜드 포지셔닝이 가능합니다.'
        },
        '2-4': {
            strategy: '시스템화된 상담 기준과 프로세스를 확립한 후, 단계별로 디지털화하여 효율성을 높이고 데이터를 축적하는 접근이 효과적입니다. 환자 신뢰 구축을 위해 투명하고 체계적인 상담 프로세스를 환자에게 명확히 제시하고, 일관된 서비스 품질로 "체계적이고 수익성도 우수한 치과"라는 브랜드를 만드십시오.',
            effect: '명확한 기준으로 일관된 상담 품질 확보, 체계적인 데이터 관리를 통한 예측 가능한 경영, 결정률 20% 이상 향상을 기대할 수 있습니다. 환자 신뢰도 상승으로 재방문율 증가 및 브랜드 가치 향상 효과도 얻을 수 있습니다.'
        },
        '1-4': {
            strategy: '빠르게 적용 가능한 AI 상담 솔루션을 우선 도입하고, 즉각적인 ROI 확인 후 단계적으로 확대하는 애자일 방식을 추천합니다. 환자 경험을 해치지 않으면서 효율을 높이는 것에 집중하고, 신속한 개선 결과를 환자에게도 공유하여 "혁신적이고 효율적인 치과"라는 이미지를 구축하십시오.',
            effect: '도입 후 1-2개월 내 가시적 성과 확인 가능, 신속한 의사결정으로 시장 경쟁력 확보, 결정률 및 수익 조기 개선 효과를 볼 수 있습니다. 빠른 개선 속도로 환자 만족도도 조기에 향상되며 브랜드 차별화가 가능합니다.'
        },
        '3-5': {
            strategy: '직원 교육 프로그램과 환자 경험 개선을 동시에 추진하고, 팀 전체가 환자 중심 문화를 내재화할 수 있도록 지원하는 것이 중요합니다. 직원들이 환자 신뢰 구축의 핵심 주체임을 인식하고, 환자와의 모든 접점에서 일관된 따뜻함과 전문성을 제공하도록 교육하십시오. 환자 경험 개선 사례를 팀원들과 공유하고, 환자 피드백을 바탕으로 지속적으로 서비스를 개선하는 문화를 만들어 "직원도 환자도 만족하는 치과"라는 브랜드를 구축하는 것이 핵심입니다.',
            effect: '직원 역량 향상으로 상담 품질 일관성 확보, 환자 만족도 및 충성도 증가, 팀 안정성 강화로 장기적 성장 기반 마련이 가능합니다. 직원 만족도 향상으로 이직률 감소, 환자 추천율 증가로 "사람이 좋은 치과"라는 입소문 확산 효과를 기대할 수 있습니다.'
        },
        '5-2': {
            strategy: '환자 중심의 표준 프로세스를 수립하고, 신뢰를 기반으로 한 체계적 상담 시스템을 구축하여 일관된 고품질 서비스를 제공하십시오. 환자와의 모든 소통 과정에서 투명성과 진정성을 유지하고, 환자 개개인의 상황과 니즈에 맞춘 맞춤형 치료 계획을 제안하는 것이 중요합니다. 환자 후기와 사례 관리를 체계화하여 신뢰의 증거를 축적하고, 지역 사회와의 연계를 통해 "지역에서 가장 신뢰받는 치과"라는 브랜드 이미지를 구축하십시오.',
            effect: '환자 신뢰도 및 재방문율 증가, 안정적이고 예측 가능한 운영으로 브랜드 가치 상승 및 지속 가능한 성장을 이룰 수 있습니다. 환자 추천을 통한 자연스러운 신규 환자 유입이 증가하며, "가장 믿을 수 있는 치과"라는 브랜드 포지셔닝으로 경쟁 우위를 확보할 수 있습니다.'
        },
        '1-5': {
            strategy: '환자 경험을 해치지 않는 범위에서 신속하게 적용 가능한 개선안을 우선 실행하고, 즉각적인 피드백을 반영하는 방식을 권장합니다. 환자 만족도를 실시간으로 모니터링하고, 개선 사항을 빠르게 적용하여 "빠르게 변화하고 환자 중심적인 치과"라는 이미지를 구축하십시오. 환자 후기를 적극 활용하여 신뢰를 빠르게 쌓고, 브랜드 인지도를 확산시키는 전략이 효과적입니다.',
            effect: '빠른 실행으로 조기 성과 달성, 환자 만족도 유지하면서 운영 효율 개선, 시장 변화에 신속한 대응이 가능합니다. 환자 경험 개선 속도가 빠르고 피드백 반영이 신속하여 환자 신뢰가 빠르게 구축되고, "혁신적이고 환자 중심적인 치과"로 브랜드 차별화가 가능합니다.'
        },
        '2-5': {
            strategy: '환자 경험 데이터를 체계적으로 수집·분석하고, 신뢰 기반의 표준화된 상담 프로세스를 구축하여 일관성과 품질을 동시에 확보하십시오. 환자와의 모든 접점에서 일관된 고품질 경험을 제공하고, 투명한 프로세스와 명확한 기준으로 환자 신뢰를 구축하여 "체계적이면서도 환자 중심적인 치과"라는 브랜드를 만드십시오.',
            effect: '체계적인 환자 관리로 재방문율 증가, 일관된 고품질 서비스로 브랜드 신뢰도 상승, 안정적 성장 기반 마련이 가능합니다. 환자 경험의 일관성과 예측 가능성이 높아 환자 신뢰가 강화되며, "가장 체계적이고 믿을 수 있는 치과"로 브랜드 포지셔닝이 가능합니다.'
        },
        '1-3': {
            strategy: '직원들이 빠르게 습득하고 적용할 수 있는 실용적인 교육 프로그램을 도입하고, 즉각적인 성과 확인으로 동기부여하는 것이 효과적입니다. 직원들의 환자 응대 역량을 신속히 향상시켜 환자 경험을 개선하고, "직원이 친절하고 전문적인 치과"라는 브랜드 이미지를 만드십시오.',
            effect: '직원 역량 신속 향상, 팀 생산성 조기 개선, 빠른 변화 적응력으로 경쟁 우위 확보가 가능합니다. 환자 만족도가 빠르게 향상되고 "친절한 치과"라는 입소문 효과를 기대할 수 있습니다.'
        },
        '3-4': {
            strategy: '직원 교육과 성과 관리를 연계하여 팀 역량을 높이고, 데이터 기반으로 개인별·팀별 성과를 추적하는 시스템을 구축하십시오. 직원 역량이 환자 경험과 수익에 직접 연결됨을 인식하고, 팀 성장이 곧 브랜드 가치 향상으로 이어지도록 시스템을 설계하십시오.',
            effect: '직원 역량 강화로 상담 품질 및 결정률 향상, 체계적인 성과 관리로 수익 증대, 팀 안정성 확보가 가능합니다. 환자 만족도와 팀 역량이 동시에 향상되어 지속 가능한 성장 기반을 마련할 수 있습니다.'
        },
        '2-3': {
            strategy: '체계적인 교육 프로그램과 표준 운영 매뉴얼을 만들어 직원들이 일관된 기준으로 업무를 수행할 수 있도록 지원하십시오. 환자 응대 가이드라인을 명확히 하여 모든 직원이 일관된 품질의 환자 경험을 제공하도록 하고, "체계적이고 안정적인 치과"라는 브랜드를 구축하십시오.',
            effect: '직원 역량의 균질화로 서비스 품질 일관성 확보, 안정적인 팀 운영으로 이직률 감소, 장기적 성장 기반 마련이 가능합니다. 환자 경험의 일관성이 높아져 신뢰도가 상승하고 재방문율이 증가합니다.'
        },
        '1-2': {
            strategy: '빠르게 적용 가능한 표준 프로세스를 먼저 구축하고, 단계적으로 시스템화하여 효율성과 안정성을 동시에 확보하는 접근이 좋습니다. 환자 경험의 일관성을 빠르게 확보하고, 체계적인 프로세스로 신뢰를 구축하여 "빠르고 체계적인 치과"라는 이미지를 만드십시오.',
            effect: '신속한 개선 효과 확인 후 체계적 안착, 운영 효율성 향상과 안정성 확보를 동시에 달성할 수 있습니다. 환자 만족도가 빠르게 향상되면서도 일관된 품질을 유지하여 브랜드 신뢰도를 강화할 수 있습니다.'
        }
    };

    // 조합별 추천사항이 있으면 사용, 없으면 기본 추천사항
    if (recommendations[combKey]) {
        return recommendations[combKey];
    } else {
        // 주 유형 기반 기본 추천
        const defaultRecommendations = {
            1: {
                strategy: '빠르게 적용 가능하고 즉각적인 효과를 확인할 수 있는 솔루션을 우선 도입하여, 단계적으로 확장하는 방식을 추천합니다. 환자 경험 개선을 위해 즉시 적용 가능한 개선안(예: 대기시간 단축, 상담 프로세스 개선)을 우선 실행하고, 환자 피드백을 빠르게 반영하여 신뢰를 구축하십시오.',
                effect: '도입 초기부터 가시적 성과 확인 가능, 신속한 의사결정으로 경쟁 우위 확보, 지속적인 개선을 통한 장기적 성장이 가능합니다. 환자 만족도 조기 개선으로 입소문 효과를 빠르게 경험할 수 있습니다.'
            },
            2: {
                strategy: '명확한 기준과 체계적인 프로세스를 먼저 수립한 후, 단계적으로 시스템화하여 안정적인 운영 체계를 구축하십시오. 환자 신뢰 구축을 위해 투명한 상담 기준과 치료 프로세스를 명문화하고, 일관된 고품질 서비스 제공을 통해 "체계적이고 믿을 수 있는 치과"라는 브랜드 이미지를 만드십시오.',
                effect: '일관된 운영 품질 확보, 예측 가능한 성과 관리, 안정적이고 지속 가능한 성장 기반을 마련할 수 있습니다. 환자 신뢰도 상승으로 재방문율과 추천율이 증가하며, 지역 내 신뢰받는 치과로 자리매김할 수 있습니다.'
            },
            3: {
                strategy: '직원 교육과 역량 개발을 우선 투자하고, 팀 전체의 성장을 통해 병원 경쟁력을 높이는 전략을 추천합니다. 직원들이 환자 경험의 핵심 제공자임을 인식하고, 환자와의 소통과 신뢰 구축 역량을 강화하도록 교육하여 "직원이 좋은 치과"라는 브랜드를 만드십시오.',
                effect: '직원 역량 강화로 서비스 품질 향상, 팀 안정성 확보로 이직률 감소, 조직 문화 개선을 통한 장기 성장이 가능합니다. 환자 만족도 증가와 "사람이 좋은 치과"라는 입소문으로 자연스러운 환자 유입 효과를 기대할 수 있습니다.'
            },
            4: {
                strategy: 'ROI가 명확한 데이터 기반 솔루션을 도입하고, KPI 중심의 성과 관리 체계를 구축하여 수익성을 최적화하십시오. 동시에 환자 만족도와 신뢰도를 측정 가능한 지표로 관리하고, 수익성과 환자 경험을 균형있게 추구하여 "경영도 우수하고 환자도 만족하는 치과"라는 브랜드를 구축하십시오.',
                effect: '결정률 및 수익 향상, 데이터 기반 의사결정으로 예측 가능한 경영, 체계적인 성과 관리를 통한 지속적 개선이 가능합니다. 환자 신뢰도도 함께 관리하여 재방문율과 추천율이 증가하며, 지속 가능한 성장 기반을 마련할 수 있습니다.'
            },
            5: {
                strategy: '환자 경험을 최우선으로 하는 시스템을 구축하고, 신뢰 기반의 장기적 관계를 강화하는 전략을 추진하십시오. 환자 여정의 모든 접점에서 탁월한 경험을 제공하고, 환자 후기와 사례를 체계적으로 관리하여 신뢰의 증거를 축적하며, 지역 사회와의 연계를 통해 "가장 환자 중심적이고 신뢰받는 치과"라는 브랜드 이미지를 구축하십시오.',
                effect: '환자 만족도 및 재방문율 증가, 브랜드 신뢰도 상승, 입소문을 통한 자연스러운 환자 증가 효과를 기대할 수 있습니다. 환자 추천율이 높아져 마케팅 비용 절감 효과도 있으며, 지역 내 최고의 환자 경험을 제공하는 치과로 차별화된 브랜드 포지셔닝이 가능합니다.'
            }
        };

        return defaultRecommendations[primary.type] || {
            strategy: '원장님의 운영 스타일에 맞는 맞춤형 솔루션을 단계적으로 도입하여 병원의 경쟁력을 강화하시길 권장합니다. 환자 경험 개선과 신뢰 구축을 핵심 전략으로 삼아, 환자 중심의 시스템을 구축하고 일관된 고품질 서비스를 제공하여 차별화된 브랜드 이미지를 만드십시오.',
            effect: '체계적인 개선을 통해 운영 효율성 향상, 환자 만족도 증대, 안정적인 수익 성장을 달성할 수 있습니다. 환자 신뢰도 상승으로 재방문율과 추천율이 증가하며, 지역 내 신뢰받는 치과로 브랜드 포지셔닝을 강화할 수 있습니다.'
        };
    }
}

// 레이더 차트 생성
function displayRadarChart(result) {
    const ctx = document.getElementById('radarChart').getContext('2d');

    // 유형 이름과 점수 데이터 준비
    const labels = [
        '1형\n결단·속도형',
        '2형\n구조·안정형',
        '3형\n팀·교육형',
        '4형\n수익·경영형',
        '5형\n환자·신뢰형'
    ];

    const scores = [
        result.scores[1],
        result.scores[2],
        result.scores[3],
        result.scores[4],
        result.scores[5]
    ];

    // 주 유형과 보조 유형의 인덱스
    const primaryIndex = result.primaryType.type - 1;
    const secondaryIndex = result.secondaryType.type - 1;

    // 각 포인트의 색상 설정 (주 유형: 파란색, 보조 유형: 초록색, 나머지: 회색)
    const pointBackgroundColors = scores.map((score, index) => {
        if (index === primaryIndex) return '#2563eb';
        if (index === secondaryIndex) return '#10b981';
        return '#9ca3af';
    });

    const pointBorderColors = pointBackgroundColors;
    const pointRadius = scores.map((score, index) => {
        if (index === primaryIndex || index === secondaryIndex) return 6;
        return 4;
    });

    // 레이블 색상 설정 (주 유형: 파란색, 보조 유형: 초록색, 나머지: 회색)
    const labelColors = scores.map((score, index) => {
        if (index === primaryIndex) return '#2563eb';
        if (index === secondaryIndex) return '#10b981';
        return '#4b5563';
    });

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: '원장 스타일 점수',
                data: scores,
                fill: true,
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                borderColor: '#2563eb',
                borderWidth: 2,
                pointBackgroundColor: pointBackgroundColors,
                pointBorderColor: pointBorderColors,
                pointBorderWidth: 2,
                pointRadius: pointRadius,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: '원장 스타일 5유형 분석',
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    padding: {
                        bottom: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `점수: ${context.parsed.r}점`;
                        }
                    }
                }
            },
            scales: {
                r: {
                    min: 0,
                    max: Math.max(...scores) + 5,
                    ticks: {
                        stepSize: 5,
                        font: {
                            size: 11
                        }
                    },
                    pointLabels: {
                        font: function(context) {
                            const index = context.index;
                            if (index === primaryIndex || index === secondaryIndex) {
                                return {
                                    size: 13,
                                    weight: 'bold'
                                };
                            }
                            return {
                                size: 11,
                                weight: 'normal'
                            };
                        },
                        color: function(context) {
                            return labelColors[context.index];
                        }
                    },
                    grid: {
                        color: '#e5e7eb'
                    },
                    angleLines: {
                        color: '#e5e7eb'
                    }
                }
            }
        }
    });
}

// 점수 요약 표시
function displayScoreSummary(result) {
    const container = document.getElementById('scoreSummary');

    let html = '';
    result.analysis.allScores.forEach((item, index) => {
        const isPrimary = index === 0;
        const isSecondary = index === 1;
        const className = isPrimary ? 'primary' : (isSecondary ? 'secondary' : '');

        html += `
            <div class="score-item ${className}">
                <div class="score-label">${item.type}형 - ${item.name}</div>
                <div class="score-value">${item.score}점</div>
                ${isPrimary ? '<div style="margin-top: 3px; color: #2563eb; font-weight: bold; font-size: 0.7rem;">주 유형</div>' : ''}
                ${isSecondary ? '<div style="margin-top: 3px; color: #10b981; font-weight: bold; font-size: 0.7rem;">보조 유형</div>' : ''}
            </div>
        `;
    });

    container.innerHTML = html;
}

// 주 유형 표시
function displayPrimaryType(primary) {
    document.getElementById('primaryTypeName').textContent =
        `${primary.type}형 - ${primary.fullName} (${primary.score}점)`;

    document.getElementById('primaryTypeDescription').textContent = primary.description;

    // 특징 목록
    const charList = document.getElementById('primaryCharacteristics');
    charList.innerHTML = primary.characteristics
        .map(char => `<li>${char}</li>`)
        .join('');

    // 키워드 배지
    const keywords = document.getElementById('primaryKeywords');
    keywords.innerHTML = primary.proposalKeywords
        .map(keyword => `
            <span style="background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 10px 18px; border-radius: 20px; font-size: 0.95rem; font-weight: 500; box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3); display: inline-block;">
                ${keyword}
            </span>
        `)
        .join('');
}

// 보조 유형 표시
function displaySecondaryType(secondary) {
    document.getElementById('secondaryTypeName').textContent =
        `${secondary.type}형 - ${secondary.fullName} (${secondary.score}점)`;

    document.getElementById('secondaryTypeDescription').textContent = secondary.description;

    // 특징 목록
    const charList = document.getElementById('secondaryCharacteristics');
    charList.innerHTML = secondary.characteristics
        .map(char => `<li>${char}</li>`)
        .join('');
}

// 맞춤 제안 표시
function displayProposal(analysis) {
    const message = generateProposalMessage(analysis);
    document.getElementById('proposalMessage').innerHTML = message;
}

// 로드맵 표시
function displayRoadmap(analysis) {
    const roadmap = generateRoadmap(analysis);
    const container = document.getElementById('roadmapContainer');

    let html = '';
    roadmap.forEach(step => {
        html += `
            <div style="margin-bottom: 20px; padding: 20px 25px; background: linear-gradient(135deg, #f9fafb, #ffffff); border-left: 5px solid #2563eb; border-radius: 10px; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.15);">
                <h3 style="color: #2563eb; margin-bottom: 12px; font-weight: bold; font-size: 1.1rem;">
                    <span style="background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 6px 14px; border-radius: 50%; margin-right: 12px; font-size: 0.95rem; box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);">
                        ${step.step}
                    </span>
                    ${step.title}
                </h3>
                <p style="margin-left: 50px; line-height: 1.8; color: #4b5563; font-size: 1.05rem;">
                    ${step.content}
                </p>
            </div>
        `;
    });

    container.innerHTML = html;
}

// AI 맞춤형 피드백 표시
function displayCustomFeedback(analysis) {
    const essayAnswersJSON = sessionStorage.getItem('essayAnswers');

    if (!essayAnswersJSON) {
        document.getElementById('customFeedbackSection').style.display = 'none';
        return;
    }

    const essayAnswers = JSON.parse(essayAnswersJSON);

    // essay-feedback.js의 함수 사용
    const feedback = generateCustomFeedback(
        essayAnswers,
        analysis.primary,
        analysis.secondary
    );

    if (!feedback || !feedback.hasFeedback) {
        document.getElementById('customFeedbackSection').style.display = 'none';
        return;
    }

    let html = '';

    // 종합 메시지
    html += `
        <div style="background: linear-gradient(135deg, #dbeafe, #bfdbfe); border-left: 5px solid #2563eb; padding: 25px 30px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);">
            <h3 style="color: #1e40af; margin-bottom: 15px; font-size: 1.2rem; font-weight: bold;">💡 종합 분석</h3>
            <p style="font-size: 1.05rem; line-height: 1.9; color: #1f2937;">${feedback.overallMessage}</p>
        </div>
    `;

    // Q26 피드백 (현재 고민)
    if (feedback.concerns.length > 0) {
        html += `<div style="margin-bottom: 30px;">`;
        html += `<h3 style="color: #f59e0b; margin-bottom: 20px; font-size: 1.2rem; font-weight: bold;">📋 현재 고민에 대한 맞춤 피드백</h3>`;

        feedback.concerns.forEach((concern, index) => {
            html += `
                <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-left: 5px solid #f59e0b; padding: 20px 25px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);">
                    <p style="color: #92400e; font-weight: 600; margin-bottom: 10px; font-size: 1.05rem;">▸ ${concern.problem}</p>
                    <p style="color: #1f2937; line-height: 1.8; margin-bottom: 15px;">${concern.solution}</p>
                    <div style="background: rgba(255, 255, 255, 0.6); padding: 15px; border-radius: 8px; border-left: 3px solid #f59e0b;">
                        <p style="color: #92400e; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">실행 방안:</p>
                        <p style="color: #1f2937; line-height: 1.7; white-space: pre-line; font-size: 0.95rem;">${concern.action}</p>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
    }

    // Q27 피드백 (비전)
    if (feedback.vision.length > 0) {
        html += `<div style="margin-bottom: 30px;">`;
        html += `<h3 style="color: #8b5cf6; margin-bottom: 20px; font-size: 1.2rem; font-weight: bold;">🎯 비전 달성 전략</h3>`;

        feedback.vision.forEach((vision, index) => {
            html += `
                <div style="background: linear-gradient(135deg, #ede9fe, #ddd6fe); border-left: 5px solid #8b5cf6; padding: 20px 25px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(139, 92, 246, 0.2);">
                    <p style="color: #6b21a8; font-weight: 600; margin-bottom: 10px; font-size: 1.05rem;">▸ ${vision.vision}</p>
                    <p style="color: #1f2937; line-height: 1.8; margin-bottom: 15px;">${vision.strategy}</p>
                    <div style="background: rgba(255, 255, 255, 0.6); padding: 15px; border-radius: 8px; border-left: 3px solid #8b5cf6;">
                        <p style="color: #6b21a8; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">추진 우선순위:</p>
                        <p style="color: #1f2937; line-height: 1.7; font-size: 0.95rem;">${vision.priority}</p>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
    }

    // Q28 피드백 (투자 우선순위)
    if (feedback.investment.length > 0) {
        html += `<div style="margin-bottom: 30px;">`;
        html += `<h3 style="color: #10b981; margin-bottom: 20px; font-size: 1.2rem; font-weight: bold;">💰 투자 우선순위 가이드</h3>`;

        feedback.investment.forEach((investment, index) => {
            html += `
                <div style="background: linear-gradient(135deg, #d1fae5, #a7f3d0); border-left: 5px solid #10b981; padding: 20px 25px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);">
                    <p style="color: #065f46; font-weight: 600; margin-bottom: 10px; font-size: 1.05rem;">▸ ${investment.priority}</p>
                    <p style="color: #1f2937; line-height: 1.8; margin-bottom: 15px;">${investment.advice}</p>
                    <div style="background: rgba(255, 255, 255, 0.6); padding: 15px; border-radius: 8px; border-left: 3px solid #10b981;">
                        <p style="color: #065f46; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">권장 순서:</p>
                        <p style="color: #1f2937; line-height: 1.7; font-size: 0.95rem;">${investment.sequence}</p>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
    }

    // 통합 액션 플랜
    if (feedback.actionPlan && feedback.actionPlan.length > 0) {
        html += `<div style="margin-top: 40px; background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 3px solid #10b981; border-radius: 12px; padding: 30px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">`;
        html += `<h3 style="color: #065f46; margin-bottom: 25px; font-size: 1.3rem; font-weight: bold; text-align: center;">🚀 통합 액션 플랜</h3>`;
        html += `<p style="color: #047857; text-align: center; margin-bottom: 30px; font-size: 1.05rem;">원장님의 고민, 비전, 투자 우선순위를 종합한 실행 로드맵입니다.</p>`;

        feedback.actionPlan.forEach(plan => {
            html += `
                <div style="background: white; border-left: 5px solid #10b981; padding: 20px 25px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);">
                    <div style="display: flex; align-items: center; margin-bottom: 12px;">
                        <span style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 6px 14px; border-radius: 50%; margin-right: 15px; font-weight: bold; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);">
                            ${plan.phase}
                        </span>
                        <h4 style="color: #065f46; font-size: 1.15rem; font-weight: bold; margin: 0;">${plan.title}</h4>
                    </div>
                    <p style="color: #1f2937; line-height: 1.8; margin-bottom: 15px; margin-left: 50px;">${plan.content}</p>
                    <div style="display: flex; gap: 20px; margin-left: 50px; font-size: 0.9rem;">
                        <div style="background: #ecfdf5; padding: 8px 15px; border-radius: 6px;">
                            <span style="color: #047857; font-weight: 600;">소요 기간:</span>
                            <span style="color: #1f2937; margin-left: 5px;">${plan.duration}</span>
                        </div>
                        <div style="background: #dbeafe; padding: 8px 15px; border-radius: 6px; flex: 1;">
                            <span style="color: #1e40af; font-weight: 600;">기대 결과:</span>
                            <span style="color: #1f2937; margin-left: 5px;">${plan.expectedResult}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
    }

    document.getElementById('customFeedbackContent').innerHTML = html;
    document.getElementById('customFeedbackSection').style.display = 'block';
}

// 주관식 답변 표시
function displayEssayAnswers() {
    const essayAnswersJSON = sessionStorage.getItem('essayAnswers');

    if (!essayAnswersJSON) {
        document.getElementById('essayAnswersSection').style.display = 'none';
        return;
    }

    const essayAnswers = JSON.parse(essayAnswersJSON);

    // 최소 1개 이상 답변이 있는지 확인
    const hasAnswers = essayAnswers.some(answer => answer && answer.trim().length > 0);

    if (!hasAnswers) {
        document.getElementById('essayAnswersSection').style.display = 'none';
        return;
    }

    // 주관식 질문 정의
    const essayQuestions = [
        '현재 병원 운영에서 가장 고민되거나 해결하고 싶은 문제는 무엇인가요?',
        '3년 후 우리 병원이 어떤 모습이 되기를 원하시나요?',
        '시간과 예산이 충분하다면, 병원의 어떤 부분에 가장 투자하고 싶으신가요?'
    ];

    let html = '';
    essayAnswers.forEach((answer, index) => {
        if (answer && answer.trim().length > 0) {
            html += `
                <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-left: 5px solid #f59e0b; padding: 20px 25px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);">
                    <h3 style="color: #92400e; margin-bottom: 12px; font-weight: bold; font-size: 1.05rem;">
                        📝 Q${26 + index}. ${essayQuestions[index]}
                    </h3>
                    <p style="color: #1f2937; line-height: 1.8; font-size: 1.05rem; white-space: pre-wrap; background: rgba(255, 255, 255, 0.5); padding: 15px; border-radius: 8px;">
                        ${answer}
                    </p>
                </div>
            `;
        }
    });

    if (html) {
        document.getElementById('essayAnswersContent').innerHTML = html;
        document.getElementById('essayAnswersSection').style.display = 'block';
    } else {
        document.getElementById('essayAnswersSection').style.display = 'none';
    }
}

// 인쇄 스타일 추가
const style = document.createElement('style');
style.textContent = `
    @media print {
        .btn-primary, .btn-secondary {
            display: none !important;
        }
        footer {
            page-break-before: avoid;
        }
        .report-section {
            page-break-inside: avoid;
        }
    }
`;
document.head.appendChild(style);
