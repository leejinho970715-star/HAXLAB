# HEXLAB · Web Security Playground

검은 화면과 네온 그린 터미널을 테마로 한 보안 학습 사이트입니다. GitHub 저장소 이름은 **HAXLAB**, 서비스 브랜드는 **HEXLAB**입니다.

## 화면

- **인트로**: 어나니머스 컨셉의 가상 가이드, 이용법과 기능 선택.
- **보안 분석**: 공개 URL의 HTTP 응답, HTTPS 여부, CSP/HSTS/프레임 보호/쿠키 Secure 등의 관측 결과와 개선 가이드. 샘플과 실제 결과를 구분합니다.
- **웹 실습**: 정적 HTML과 최대 4개 CSS 복제, HTML/CSS/JS 편집 및 격리 미리보기, 코드 패턴 검사, 콘솔, 예제 3종, JSON 가져오기·내보내기.
- **바이러스·백신 실험**: 가상 파일에서 표시자·잠금·복제 이벤트를 모델링하는 JSON 규칙. 시그니처 및 행위 탐지, 격리·복구, 파일별 검사, 규칙 내보내기. 유형 4종과 탐지 방식 2종의 3D 아이콘, 역할·동작·실습 재현 설명 및 모델 불러오기.
- **리포트·미션·플레이북**: 브라우저 로컬 저장, 발견 항목별 상세 설명과 다운로드.
- **해킹 코드 삽입**: 빈 터미널에서 아무 키나 입력하면 랜덤한 보안 예제 코드가 연속 출력되는 시각 연출. Python·JavaScript·터미널 형식, 출력 속도, 초기화와 확대를 지원하며 코드를 실행하지 않습니다.

콘텐츠 박스는 10px 모서리의 반투명 글래스모피즘이며, 인트로 배경에는 초록색 코드가 떨어지는 모션이 표시됩니다. 시스템의 모션 감소 설정을 존중합니다.

## 로컬 실행

Node.js 22 이상. 외부 패키지를 설치할 필요가 없습니다.

```powershell
cd hexlab
npm run dev
# http://127.0.0.1:4173
npm test
npm run build
```

## 배포

Vercel은 저장소 루트 또는 `hexlab`을 Root Directory로 사용할 수 있습니다. 각 위치의 `vercel.json`이 빌드 명령과 `dist/client` 출력 경로를 지정합니다. Vercel에서는 `/api/health`, `/api/scan`, `/api/clone` Node 함수를 통해 기존 공개 분석 서버로 요청을 전달합니다. 화면은 같은 출처의 API를 사용하며 다른 출처의 브라우저 요청은 프록시가 거부합니다. `/scan`, `/code`, `/lab/web`, `/lab/bio` 직접 접속도 지원합니다. 공유 이미지 주소는 Vercel 프로덕션 도메인으로 생성됩니다.

`.github/workflows/pages.yml`이 main 브랜치의 변경을 검사·빌드하고 GitHub Pages로 배포합니다. 화면은 `hexlab/dist/client`이며 주소는 GitHub Pages 설정에서 확인하세요. `hexlab/src/config.js`의 API_BASE가 별도 HTTP API 서버를 지정합니다. API는 `hexlab/src/worker.mjs`이며 Cloudflare Workers 호환 ESM입니다. 같은 소스를 로컬 서버에서도 사용합니다.

GitHub Pages 프로젝트 하위 경로를 지원하도록 상대 경로 자산과 해시 라우팅을 사용합니다. favicon, 생성된 Anonymous 안내 이미지, og:image 및 X 공유 메타데이터를 포함합니다. 공유 미리보기는 각 SNS가 자체 캐시·수집 정책으로 처리합니다.

## 기능 범위

보안 점수는 공개 HTTP 응답에서 관측한 설정 기준의 **휴리스틱 점수**이며 전체 정보보안 등급이나 공격 성공 가능성을 보증하지 않습니다. 응답 쿠키 값은 리포트에 저장하지 않습니다. 포트 스캔, SQL 삽입, 외부 사이트 공격 요청을 수행하지 않습니다.

복제는 공개 정적 스냅샷입니다. 인증된 페이지, 원본 JavaScript, 서버 API, 동적 SPA 렌더링은 복제하지 않습니다. 일부 이미지·글꼴은 원래 공개 자산 URL로 표시되므로 차단 정책에 따라 보이지 않을 수 있습니다. HTML의 스크립트·이벤트 속성을 정리하고 opaque-origin iframe에서 실행합니다. 실습 JS는 부모 페이지나 원본 서버에 접근할 수 없고, 데이터 연결과 폼 전송은 CSP로 차단합니다. 가져온 문서가 믿을 수 없는 콘텐츠일 수 있으므로 실제 로그인 정보는 입력하지 마세요.

악성코드 실험은 **메모리 내 가상 파일**만 바꿉니다. 실제 암호화, 전파, 악성 실행 파일, 프로세스 제어 및 시스템 접근 기능이 없습니다. WannaCry·웜·트로이목마 프리셋과 Microsoft Defender·ClamAV 프리셋은 공식 자료의 동작 원리를 인용한 학습용 모델이며 원본 악성코드 또는 실제 백신 엔진이 아닙니다.

API는 HTTP/HTTPS 기본 포트, 공개 도메인만 지원하며 각 리디렉션의 DNS 주소를 검사합니다. 요청·응답 크기 및 시간 제한이 있습니다. API의 메모리 기반 제한은 isolate별로 동작하며 영구적·글로벌 사용자 쿼터가 아닙니다. 실서비스 규모에서는 인증·영구 rate limiting 및 운영 모니터링을 추가하세요. 허용 브라우저 출처는 이 프로젝트의 GitHub Pages와 로컬 개발 서버입니다. CORS는 인증 수단이 아닙니다.

## 인용 자료

- [WannaCrypt ransomware worm · Microsoft](https://www.microsoft.com/en-us/security/blog/2017/05/12/wannacrypt-ransomware-worm-targets-out-of-date-systems/)
- [악성코드 유형 · CISA](https://www.cisa.gov/sites/default/files/publications/aa22-216a-2021-top-malware-strains.pdf)
- [ClamAV 시그니처 공식 문서](https://docs.clamav.net/manual/Signatures.html)
- [Microsoft Defender 행위 모니터링 공식 문서](https://learn.microsoft.com/en-us/defender-endpoint/behavior-monitor)

## 이미지 제작

OpenAI 내장 imagegen으로 생성했습니다. 프롬프트는 `hexlab/ASSETS.md`에 기록했습니다.

## 배경음악

인트로·보안 분석·웹 실습·백신 실험·코드 보드별 오리지널 전자음악 5곡을 사용합니다. 음원은 `hexlab/src/audio`의 로컬 WAV 파일이며 외부 음악 서비스에 의존하지 않습니다. `npm run compose:bgm`으로 동일한 음원을 다시 만들 수 있습니다. 첫 클릭·터치·키 입력 후 재생되며, 화면 우측 하단에서 음소거와 볼륨을 조절합니다. 설정은 이 브라우저에 저장됩니다. 페이지 전환 시 곡이 바뀌며 탭이 숨겨지면 일시 정지합니다.
