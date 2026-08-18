# 비켜줄래?

내 위치 주변의 침수 위험을 예측해주는 Expo(React Native) 앱입니다.

## 로컬에서 실행하는 법

1. 저장소 클론 후 이 폴더(`app`)로 이동

   ```bash
   git clone https://github.com/happyCat-KR/safeflow.git
   cd safeflow/app
   ```

2. 패키지 설치

   ```bash
   npm install
   ```

3. 개발 서버 실행

   ```bash
   npx expo start
   ```

4. 폰에 **Expo Go** 앱 설치 후, 터미널에 뜨는 QR코드 스캔

   - 이 프로젝트는 **Expo SDK 57** 기준입니다. Expo Go는 프로젝트 SDK 버전과 **정확히 일치**해야 정상 연결되므로, 스토어(Play 스토어/App Store)에서 받으면 버전이 안 맞아 튕길 수 있습니다.
   - **안드로이드**는 아래 링크에서 SDK 57 버전 Expo Go APK를 직접 받아 설치하세요 (출처를 알 수 없는 앱 설치 허용 필요):
     https://github.com/expo/expo-go-releases/releases/download/Expo-Go-57.0.3/Expo-Go-57.0.3.apk
   - 노트북과 폰이 **같은 wifi**에 있어야 합니다.
   - 다른 네트워크(예: 폰은 데이터, 노트북은 다른 wifi)라면 `npx expo start --tunnel`로 실행하세요.

## 프로젝트 구조 (핵심만)

```
src/
  app/
    index.tsx                 # 홈 화면 (GPS 위치, 강수량/수위 요약, "분석하기" 버튼)
    result.tsx                 # 분석 결과 화면 (위험도 점수, 강수/수위 상세, 행동요령 진입점)
    action-guide/
      index.tsx                # 행동요령 1단계: 상황 선택 (건물 안 / 차량 이동 중 / 도보 / 주차)
      situation.tsx             # 행동요령 2단계: 건물·차량 이동 중일 때 세부 상황 선택
      result.tsx                 # 행동요령 결과: 상황+위험등급에 맞는 행동요령 카드
  constants/
    actionGuideData.ts          # ★ 행동요령 문구 원본 데이터 (아래 참고)
    colors.ts                   # 디자인 컬러 토큰
docs/
  ai-team-api-spec.md           # AI팀에 요청한 API 3종 스펙 문서
  flood-action-manual-research.md   # 행동요령 문구의 공식 출처 원본 조사
  flood-action-tree-manual.md   # 행동요령 트리 구조 × 공식 문구 매핑 (actionGuideData.ts 원본)
```

## 행동요령(행동강령) 데이터는 어디 있나요

`src/constants/actionGuideData.ts`에 상황(`situationCode`)별, 위험등급(`grade`: `caution`=주의 / `danger`=위험)별 문구가 다 들어있습니다. 모든 문구는 국민재난안전포털·행정안전부 등 공식 자료 기반이며, 출처는 `docs/flood-action-tree-manual.md`에 정리되어 있습니다.

## AI팀 연동이 필요한 부분 (지금은 랜덤 목데이터)

아직 AI팀 API가 없어서 아래 두 곳은 랜덤 값으로 임시 대체되어 있습니다. `docs/ai-team-api-spec.md`에 정의된 API로 교체하면 됩니다.

- **홈 화면 현재 상태 (API 1: 현재 상태 조회)**
  `src/app/index.tsx` 약 58~64번째 줄 — `"22mm/h"`, `"2.4m"`이 하드코딩된 강수량/수위 텍스트입니다.

- **분석 결과 (API 2: 침수 위험 분석)**
  `src/app/result.tsx` 약 51~57번째 줄 — `Math.random()`으로 `score`(위험도), `rain1h`, `rain3h`, `waterLevelChange`, `etaHours`를 만들어내고 있습니다.

  ```tsx
  const [result] = useState(() => ({
      score: Math.floor(Math.random() * 100),
      rain1h: Math.floor(Math.random() * 40),
      rain3h: Math.floor(Math.random() * 80),
      waterLevelChange: (Math.random() * 1.2).toFixed(1),
      etaHours: Math.floor(Math.random() * 4) + 1,
  }));
  ```
