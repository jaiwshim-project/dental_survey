// 답변 분석 및 유형 도출 로직

// 유형 정보
const typeInfo = {
    1: {
        code: 'A',
        name: '결단·속도형',
        fullName: '결단·속도형 원장',
        keyword: '빠른 실행과 즉각적 효과',
        description: '빠른 결정과 즉각적 효과를 중시하는 유형입니다.',
        characteristics: [
            '빠른 의사결정과 실행 선호',
            '즉각적인 효과와 결과 중시',
            '시간 절약에 대한 높은 관심',
            '복잡한 이론보다 실용적 접근 선호'
        ],
        proposalKeywords: ['바로 써먹는 구조', '시간 절약', '즉시 적용 가능']
    },
    2: {
        code: 'B',
        name: '구조·안정형',
        fullName: '구조·안정형 원장',
        keyword: '기준과 시스템화',
        description: '방향성과 기준, 시스템적 접근을 중시하는 유형입니다.',
        characteristics: [
            '명확한 기준과 구조 중시',
            '장기적 안정성 추구',
            '시스템화된 운영 선호',
            '방향성에 대한 지속적 점검'
        ],
        proposalKeywords: ['상담 기준 고정', '시스템화', '구조적 안정']
    },
    3: {
        code: 'C',
        name: '팀·교육형',
        fullName: '팀·교육형 원장',
        keyword: '직원 성장과 조직 안정',
        description: '팀워크와 직원 교육, 조직의 안정성을 중시하는 유형입니다.',
        characteristics: [
            '직원 성장과 역량 개발 중시',
            '팀 안정성과 조직 문화 중요시',
            '지속적인 교육과 훈련 강조',
            '사람 중심의 병원 운영'
        ],
        proposalKeywords: ['교육 내재화', '역량 편차 해소', '팀 안정성']
    },
    4: {
        code: 'D',
        name: '수익·경영형',
        fullName: '수익·경영형 원장',
        keyword: 'ROI와 KPI 중심',
        description: '수익성과 경영 지표를 중심으로 판단하는 유형입니다.',
        characteristics: [
            '명확한 ROI와 수치 중시',
            '데이터 기반 의사결정',
            '수익 구조 최적화 추구',
            'KPI와 성과 지표 관리'
        ],
        proposalKeywords: ['결정률 개선', 'KPI 관리', '수익 예측 가능성']
    },
    5: {
        code: 'E',
        name: '환자·신뢰형',
        fullName: '환자·신뢰형 원장',
        keyword: '환자 경험과 브랜드 이미지',
        description: '환자 경험과 병원의 신뢰 이미지를 최우선으로 하는 유형입니다.',
        characteristics: [
            '환자 경험과 만족도 최우선',
            '병원 신뢰와 이미지 중시',
            '장기적 환자 관계 구축',
            '환자 중심의 상담과 진료'
        ],
        proposalKeywords: ['신뢰 설계', '환자 경험 개선', '브랜드 이미지']
    }
};

// 답변 분석 함수
function analyzeAnswers(answers) {
    // 점수 집계 (1~5 각 유형별)
    const scores = {
        1: 0,  // A형
        2: 0,  // B형
        3: 0,  // C형
        4: 0,  // D형
        5: 0   // E형
    };

    // 각 답변 분석 (1순위 2점, 2순위 1점)
    answers.forEach(answer => {
        if (answer && answer.length === 2) {
            const primary = parseInt(answer[0]);
            const secondary = parseInt(answer[1]);

            scores[primary] += 2;  // 1순위 2점
            scores[secondary] += 1; // 2순위 1점
        }
    });

    // 점수 순으로 정렬
    const sortedScores = Object.entries(scores)
        .map(([type, score]) => ({ type: parseInt(type), score }))
        .sort((a, b) => b.score - a.score);

    // 주 유형과 보조 유형
    const primaryType = sortedScores[0];
    const secondaryType = sortedScores[1];

    return {
        scores,
        sortedScores,
        primaryType,
        secondaryType,
        analysis: generateAnalysis(primaryType, secondaryType, scores)
    };
}

// 분석 결과 생성
function generateAnalysis(primaryType, secondaryType, scores) {
    const primary = typeInfo[primaryType.type];
    const secondary = typeInfo[secondaryType.type];

    return {
        primary: {
            type: primaryType.type,
            code: primary.code,
            name: primary.name,
            fullName: primary.fullName,
            keyword: primary.keyword,
            description: primary.description,
            characteristics: primary.characteristics,
            proposalKeywords: primary.proposalKeywords,
            score: primaryType.score
        },
        secondary: {
            type: secondaryType.type,
            code: secondary.code,
            name: secondary.name,
            fullName: secondary.fullName,
            keyword: secondary.keyword,
            description: secondary.description,
            characteristics: secondary.characteristics,
            proposalKeywords: secondary.proposalKeywords,
            score: secondaryType.score
        },
        allScores: Object.entries(scores).map(([type, score]) => ({
            type: parseInt(type),
            name: typeInfo[type].name,
            score
        })).sort((a, b) => b.score - a.score)
    };
}

// 맞춤 제안 메시지 생성
function generateProposalMessage(analysis) {
    const primary = analysis.primary;
    const secondary = analysis.secondary;

    return `원장님은 기본적으로 <strong>${primary.keyword}</strong>을 중시하시면서도,
    <strong>${secondary.keyword}</strong>에 대한 관심도 높으신 타입입니다.<br><br>
    그래서 ${primary.name.includes('·') ? primary.name.split('·')[0] : primary.name}의 장점을 살리면서도
    ${secondary.name.includes('·') ? secondary.name.split('·')[0] : secondary.name}의 요소를 함께 고려하는 방식이 가장 효과적입니다.`;
}

// 전략 로드맵 생성
function generateRoadmap(analysis) {
    const primary = analysis.primary;

    const roadmaps = {
        1: [ // 결단·속도형
            {
                step: 1,
                title: '즉시 적용 가능한 상담 구조 정리',
                content: '복잡한 이론이 아닌, 바로 현장에서 사용할 수 있는 상담 스크립트와 프로세스를 정리합니다.'
            },
            {
                step: 2,
                title: 'AI 상담 보조 시스템 도입',
                content: '반복 설명을 AI가 대신하여 원장님의 시간을 절약하고 진료에 집중할 수 있게 합니다.'
            },
            {
                step: 3,
                title: '빠른 피드백 루프 구축',
                content: '실시간 모니터링으로 즉각적인 개선이 가능한 시스템을 만듭니다.'
            },
            {
                step: 4,
                title: '효과 측정 및 최적화',
                content: '단기간 내 가시적 성과를 확인하고 지속적으로 개선합니다.'
            }
        ],
        2: [ // 구조·안정형
            {
                step: 1,
                title: '상담 기준과 프로세스 정립',
                content: '병원의 철학과 방향성을 반영한 명확한 상담 기준을 수립합니다.'
            },
            {
                step: 2,
                title: 'AI 기반 상담 표준화 시스템 구축',
                content: '사람이 바뀌어도 일관된 품질을 유지할 수 있는 시스템을 만듭니다.'
            },
            {
                step: 3,
                title: '단계별 정착 및 모니터링',
                content: '구조가 안정적으로 작동하는지 지속적으로 점검하고 개선합니다.'
            },
            {
                step: 4,
                title: '장기적 성장 구조 완성',
                content: '광고가 아닌 시스템으로 지속 성장하는 병원을 만듭니다.'
            }
        ],
        3: [ // 팀·교육형
            {
                step: 1,
                title: '팀 교육 및 상담 기준 공유',
                content: '전체 팀이 같은 기준과 목표를 공유할 수 있도록 교육합니다.'
            },
            {
                step: 2,
                title: 'AI 상담 훈련 시스템 도입',
                content: '개인별 맞춤 피드백으로 지속적인 학습과 성장을 지원합니다.'
            },
            {
                step: 3,
                title: '역량 평준화 및 안정화',
                content: '팀 전체의 상담 수준을 평균 이상으로 끌어올립니다.'
            },
            {
                step: 4,
                title: '자립적 성장 문화 구축',
                content: '원장 개입 없이도 팀이 스스로 성장하는 구조를 만듭니다.'
            }
        ],
        4: [ // 수익·경영형
            {
                step: 1,
                title: '현재 상담 KPI 분석',
                content: '결정률, 재방문율 등 핵심 지표를 측정하고 병목 지점을 파악합니다.'
            },
            {
                step: 2,
                title: 'AI 기반 상담 최적화 시스템 도입',
                content: '데이터 기반으로 상담 품질을 관리하고 결정률을 높입니다.'
            },
            {
                step: 3,
                title: '수익 구조 안정화',
                content: '예측 가능한 매출 구조를 만들고 광고 의존도를 낮춥니다.'
            },
            {
                step: 4,
                title: 'ROI 극대화 및 지속 성장',
                content: '투자 대비 명확한 성과를 창출하고 지속 가능한 성장을 실현합니다.'
            }
        ],
        5: [ // 환자·신뢰형
            {
                step: 1,
                title: '환자 경험 설계 및 상담 프로세스 개선',
                content: '환자가 신뢰를 느낄 수 있는 상담 구조를 설계합니다.'
            },
            {
                step: 2,
                title: 'AI 상담 지원 시스템 도입 (환자 중심)',
                content: 'AI가 뒤에서 지원하되 환자에게는 따뜻한 상담을 유지합니다.'
            },
            {
                step: 3,
                title: '공간 브랜딩 및 경험 최적화',
                content: 'AI 갤러리와 아트 시네마로 병원의 신뢰 이미지를 강화합니다.'
            },
            {
                step: 4,
                title: '장기 환자 관계 구축',
                content: '일회성 방문이 아닌 평생 주치의 관계를 만듭니다.'
            }
        ]
    };

    return roadmaps[primary.type] || roadmaps[2]; // 기본값은 구조·안정형
}
