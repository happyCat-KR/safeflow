export type Grade = 'caution' | 'danger';

type Stage = { text: string; shelter?: boolean};
type StagedContent = { type: 'staged'; watch: Stage; warning: Stage };
type CommonContent = { type: 'common'; text: string; shelter?: boolean };
type ActionGuideContent = StagedContent | CommonContent;

export const actionGuideData: Record<string, ActionGuideContent> = {
  building_basement: {
    type: 'staged',
    watch: {
      text: '침수위험 지하공간은 예비특보 단계부터 사전 통제 대상입니다. 모래주머니·물막이판을 설치하고 배수구를 미리 점검하세요.',
    },
    warning: {
      text: '바닥에 물이 조금이라도 차오르거나 하수구에서 역류하면 즉시 대피하세요. 출입문부터 여세요. 외부 수심이 무릎(약 50cm) 이상이면 전기를 차단한 뒤 여러 명이 함께 문을 열고 신속히 대피하세요. 빗물이 유입되면 5~10분 만에 침수될 수 있으니 지체하지 마세요.',
      shelter: true,
    },
  },
  building_lowfloor: {
    type: 'staged',
    watch: {
      text: '저지대, 상습 침수지역, 고립지역, 산사태 위험지역에 있다면 대피를 준비하세요.',
    },
    warning: {
      text: '호우경보가 발표되면 안전지대로 대피하세요. 건물 안에 물이 조금이라도 차오르면 즉시 높은 곳이나 주변 대피장소로 이동하세요.',
      shelter: true,
    },
  },
  driving_normal: {
    type: 'staged',
    watch: { text: '지하차도, 저지대 도로는 예비특보 단계부터 사전 통제 대상입니다. 해당 구간 진입을 피하세요.' },
    warning: { text: '침수된 도로, 지하차도, 교량 등은 절대 진입하지 마세요.' },
  },
  driving_underpass: {
    type: 'common',
    text: '침수가 시작된 지하차도는 절대 진입하지 마세요. 이미 진입했다면 차량을 두고 신속히 밖으로 대피하세요. 진입·탈출 시에는 비상점멸등을 켜서 뒤 차량에 위험을 알리세요.',
    shelter: true,
  },
  driving_submerged: {
    type: 'common',
    text:
      '1) 타이어가 2/3 이상 잠기기 전에 안전한 곳으로 이동하세요. 이동이 불가능하면 시동이 꺼지기 전에 창문·썬루프를 미리 열어두세요.\n2) 문이 안 열리면 헤드레스트 하단 철재봉으로 유리창을 깨서 탈출하세요.\n3) 유리를 못 깼다면 내·외부 수위차가 30cm 이하가 될 때까지 기다렸다가 문이 열리는 순간 탈출하세요.\n4) 탈출 후 물보다 높은 곳으로, 마땅치 않으면 차량 지붕 위로 올라가 119에 연락하고 대기하세요.',
    shelter: true,
  },
  walking: {
    type: 'common',
    text: '침수도로를 걸을 때는 신호등, 가로등, 입간판 등 전기시설물에서 2~3m 이상 떨어져서 걸으세요. 이미 침수된 지역에는 접근하지 마세요.',
  },
  parked_vehicle: {
    type: 'staged',
    watch: { text: '침수가 예상되면 차량을 미리 안전한 곳으로 이동하세요.' },
    warning: { text: '호우가 발생한 뒤에는 차량 이동을 자제하세요. 사람의 대피가 우선입니다.' },
  },
};

function getStage(situationCode: string, grade: Grade): Stage | null {
  const entry = actionGuideData[situationCode];
  if (!entry) return null;
  if (entry.type === 'common') return { text: entry.text, shelter: entry.shelter };
  return grade === 'danger' ? entry.warning : entry.watch;
}

export function getActionGuideText(situationCode: string, grade: Grade): string {
  return getStage(situationCode, grade)?.text ?? '';
}

export function getActionGuideSteps(situationCode: string, grade: Grade): string[] {
  return getActionGuideText(situationCode, grade).split('\n').filter(Boolean);
}

export function getActionGuideShelter(situationCode: string, grade: Grade): boolean {
  return !!getStage(situationCode, grade)?.shelter;
}