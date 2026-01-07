// 병원 수익 단계별 유형 분석 로직

// 5가지 수익 단계 유형 정의
const revenueTypeDefinitions = {
    '1': {
        type: '1',
        name: '수익 정체·감소',
        fullName: '수익 정체·감소 단계 병원',
        keyword: '환자 이탈, 선택 이유 상실',
        description: '환자가 줄었다는 것을 체감하고 있으며, 광고는 늘렸지만 효과는 미미합니다. "왜 안 오는지 모르겠다"는 답답함을 느끼는 단계입니다.',
        coreMessage: '사라지는 환자를 멈추는 구조',
        characteristics: [
            '환자 수 감소를 명확히 체감하고 있습니다',
            '광고 효과가 예전만큼 나타나지 않습니다',
            '환자 이탈의 원인을 파악하기 어렵습니다',
            '선택받을 이유가 상담에서 사라진 상태입니다'
        ],
        proposalKeywords: ['상담 구조 복원', '신뢰 기반 전환', '이탈 방지'],
        problem: '환자가 없는 것이 아니라 선택받을 이유가 상담에서 사라진 상태입니다.',
        solution: '환자를 더 데려오는 도구가 아니라 이미 온 환자가 "이 병원에서 해야겠다"고 결정하도록 돕는 구조입니다.',
        focusPoints: [
            '광고 이전에 상담 구조 복원',
            '가격 중심 → 신뢰 중심 전환',
            '상담 후 이탈 감소'
        ]
    },
    '2': {
        type: '2',
        name: '수익 유지·불안정',
        fullName: '수익 유지·불안정 단계 병원',
        keyword: '변동성, 상담 편차',
        description: '어떤 달은 괜찮고 어떤 달은 불안합니다. 직원이나 상담사에 따라 결과 차이가 크며, 매출 예측이 어려운 상태입니다.',
        coreMessage: '흔들릴 때를 줄이는 구조',
        characteristics: [
            '달마다 매출 기복이 심합니다',
            '상담 결과가 직원에 따라 크게 달라집니다',
            '매출 예측이 어렵습니다',
            '상담 구조가 사람에게 의존적입니다'
        ],
        proposalKeywords: ['상담 기준 고정', '편차 제거', '예측 가능성'],
        problem: '문제는 매출이 아니라 상담 결과가 사람에 따라 달라지는 구조입니다.',
        solution: '누가 상담하든 비슷한 수준의 결정과 신뢰가 나오도록 상담 기준을 고정합니다.',
        focusPoints: [
            '상담 편차 제거',
            '평균 상담 수준 상향',
            '매출 예측 가능성 확보'
        ]
    },
    '3': {
        type: '3',
        name: '원장 과부하',
        fullName: '수익은 있으나 원장 과부하 병원',
        keyword: '과로, 개인 의존',
        description: '환자는 많지만 상담과 설명에 원장 개입이 잦아 시간과 체력 소모가 심합니다. 바쁘지만 여유가 없는 상태입니다.',
        coreMessage: '원장이 빠져도 굴러가는 구조',
        characteristics: [
            '환자는 많지만 여유가 없습니다',
            '상담과 설명에 원장 개입이 빈번합니다',
            '시간과 체력 소모가 심각합니다',
            '병원이 원장 개인에게 과도하게 의존합니다'
        ],
        proposalKeywords: ['업무 위임', '시간 절약', '진료 집중'],
        problem: '병원이 잘 돌아가는 것처럼 보여도 원장 개인에게 과부하가 집중된 상태입니다.',
        solution: '원장님이 직접 하던 설명과 기준을 AI가 대신 유지해주는 장치입니다.',
        focusPoints: [
            '반복 설명 감소',
            '원장 개입 최소화',
            '진료 집중도 회복'
        ]
    },
    '4': {
        type: '4',
        name: '수익 안정·확장 준비',
        fullName: '수익 안정·확장 준비 병원',
        keyword: '시스템화, 표준화',
        description: '수익은 비교적 안정적이며 병원 확장이나 인력 확대를 고민하고 있습니다. "지금 구조로는 안 된다"는 인식이 있는 단계입니다.',
        coreMessage: '확장 전에 상담부터 시스템으로',
        characteristics: [
            '수익이 비교적 안정적입니다',
            '병원 확장이나 인력 확대를 고민 중입니다',
            '현재 구조의 한계를 인식하고 있습니다',
            '시스템화와 표준화의 필요성을 느낍니다'
        ],
        proposalKeywords: ['시스템 확장', '표준화', '브랜드 일관성'],
        problem: '확장을 가로막는 것은 자본이 아니라 표준화되지 않은 상담 구조입니다.',
        solution: '확장 가능한 상담 기준을 먼저 만들어 병원의 성장 속도를 안정시킵니다.',
        focusPoints: [
            '상담 표준화',
            '신규 인력 빠른 적응',
            '병원 브랜드 일관성'
        ]
    },
    '5': {
        type: '5',
        name: '고수익·브랜드형',
        fullName: '고수익·브랜드형 병원',
        keyword: '신뢰, 이미지, 장기 관계',
        description: '단기 매출보다 이미지를 중시하며, 환자 관계와 신뢰, 평판이 중요합니다. AI 도입에 신중한 편입니다.',
        coreMessage: '사람이 아니라 구조로 신뢰를 지키는 병원',
        characteristics: [
            '단기 매출보다 병원 이미지를 중시합니다',
            '환자 관계와 신뢰, 평판이 가장 중요합니다',
            '장기 환자 비율이 높습니다',
            'AI 도입에 대해 신중한 입장입니다'
        ],
        proposalKeywords: ['신뢰 설계', '브랜드 이미지', '장기 관계'],
        problem: '이 병원은 효율이 아니라 신뢰를 훼손하지 않는 관리 구조가 필요합니다.',
        solution: 'AI로 상담을 바꾸는 것이 아니라 원장님의 진료 철학과 상담 기준을 흔들리지 않게 지켜주는 역할입니다.',
        focusPoints: [
            '감정·관계 중심 상담 유지',
            '신뢰 경험의 일관성',
            '장기 환자 강화'
        ]
    }
};

// 수익 단계별 로드맵 데이터
const revenueRoadmaps = {
    '1': [ // 수익 정체·감소
        {
            step: 1,
            title: '상담 구조 진단 및 복원',
            content: '환자 이탈의 근본 원인을 파악하고 상담에서 신뢰가 사라진 지점을 복원합니다.'
        },
        {
            step: 2,
            title: 'AI 상담 지원 시스템 도입',
            content: '환자가 "이 병원에서 해야겠다"고 결정하도록 돕는 AI 기반 상담 구조를 구축합니다.'
        },
        {
            step: 3,
            title: '신뢰 중심 상담 프로세스 정착',
            content: '가격이 아닌 가치와 신뢰를 전달하는 5단계 상담 프로세스를 내재화합니다.'
        },
        {
            step: 4,
            title: '재방문 및 추천 구조 안정화',
            content: '상담 후 이탈을 방지하고 환자가 다시 찾아오는 병원으로 전환합니다.'
        }
    ],
    '2': [ // 수익 유지·불안정
        {
            step: 1,
            title: '상담 기준 및 프로세스 표준화',
            content: '직원별 상담 편차를 제거하고 일관된 품질의 상담 기준을 수립합니다.'
        },
        {
            step: 2,
            title: 'AI 기반 상담 균질화 시스템 구축',
            content: '누가 상담하든 비슷한 수준의 결과가 나오도록 AI가 지원합니다.'
        },
        {
            step: 3,
            title: '팀 교육 및 상담 수준 평준화',
            content: '전체 팀의 상담 역량을 평균 이상으로 끌어올려 변동성을 줄입니다.'
        },
        {
            step: 4,
            title: '예측 가능한 매출 구조 완성',
            content: '상담 구조가 안정되면서 매출 예측이 가능한 병원으로 전환합니다.'
        }
    ],
    '3': [ // 원장 과부하
        {
            step: 1,
            title: '원장 업무 분석 및 위임 구조 설계',
            content: '원장이 직접 하던 상담·설명 업무를 분석하고 위임 가능한 부분을 파악합니다.'
        },
        {
            step: 2,
            title: 'AI 상담 대리 시스템 도입',
            content: '원장의 설명 기준과 철학을 AI가 대신 전달하여 개입을 최소화합니다.'
        },
        {
            step: 3,
            title: '직원 역량 강화 및 자립 구조 구축',
            content: '직원들이 원장 개입 없이도 상담을 완성할 수 있도록 교육합니다.'
        },
        {
            step: 4,
            title: '원장 진료 집중도 회복',
            content: '반복 설명에서 벗어나 진료와 병원 경영에 집중할 수 있게 됩니다.'
        }
    ],
    '4': [ // 수익 안정·확장 준비
        {
            step: 1,
            title: '확장 가능한 상담 기준 정립',
            content: '현재 구조를 분석하고 확장해도 무너지지 않는 상담 기준을 수립합니다.'
        },
        {
            step: 2,
            title: 'AI 기반 표준화 시스템 구축',
            content: '신규 인력이 빠르게 적응할 수 있는 시스템을 만들어 확장을 준비합니다.'
        },
        {
            step: 3,
            title: '브랜드 일관성 유지 체계 완성',
            content: '병원이 커져도 브랜드와 상담 품질이 일관되게 유지되도록 합니다.'
        },
        {
            step: 4,
            title: '안정적 확장 및 지속 성장',
            content: '시스템 기반으로 병원이 성장하며 품질 저하 없이 확장합니다.'
        }
    ],
    '5': [ // 고수익·브랜드형
        {
            step: 1,
            title: '원장 철학 및 상담 기준 체계화',
            content: '원장님의 진료 철학과 가치관을 명확히 정리하고 체계화합니다.'
        },
        {
            step: 2,
            title: '신뢰 유지형 AI 시스템 도입',
            content: 'AI가 효율만 추구하지 않고 원장 철학을 흔들림 없이 지켜주도록 설계합니다.'
        },
        {
            step: 3,
            title: '공간 브랜딩 및 문화 기여',
            content: 'AI 갤러리와 아트 시네마로 병원의 신뢰 이미지를 더욱 강화합니다.'
        },
        {
            step: 4,
            title: '평생 주치의 관계 구축',
            content: '장기 환자 비율을 높이고 세대를 넘어 신뢰받는 병원으로 자리잡습니다.'
        }
    ]
};

// 답변 분석 함수 (점수 합산 방식)
function analyzeRevenueAnswers(answers) {
    // 점수 집계 (1~5 각 단계별)
    const scores = {
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0
    };

    // 각 답변 분석 (1순위 2점, 2순위 1점)
    answers.forEach(answer => {
        if (answer && answer.length === 2) {
            const primary = answer[0];
            const secondary = answer[1];

            scores[primary] += 2;  // 1순위 2점
            scores[secondary] += 1; // 2순위 1점
        }
    });

    // 점수 순으로 정렬
    const sortedScores = Object.entries(scores)
        .map(([type, score]) => ({ type, score }))
        .sort((a, b) => b.score - a.score);

    // 주 단계와 보조 단계
    const primaryType = sortedScores[0];
    const secondaryType = sortedScores[1];

    // 결과 반환
    return {
        scores: scores,
        sortedScores: sortedScores,
        primaryType: {
            ...revenueTypeDefinitions[primaryType.type],
            score: primaryType.score
        },
        secondaryType: {
            ...revenueTypeDefinitions[secondaryType.type],
            score: secondaryType.score
        },
        analysis: {
            primary: {
                ...revenueTypeDefinitions[primaryType.type],
                score: primaryType.score
            },
            secondary: {
                ...revenueTypeDefinitions[secondaryType.type],
                score: secondaryType.score
            },
            allScores: sortedScores.map(item => ({
                type: item.type,
                name: revenueTypeDefinitions[item.type].name,
                fullName: revenueTypeDefinitions[item.type].fullName,
                score: item.score
            }))
        }
    };
}
