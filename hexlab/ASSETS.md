# Assets

- `src/favicon.svg`: 직접 작성한 네온 그린 터미널 SVG 심볼.
- `src/og.png`: 내장 imagegen 생성. 1733 × 907, 약 1.91:1. Prompt: Original raster HEXLAB social sharing card; nearly black #030806, sparse subtle mint technical grid, thin framing corners, glowing wireframe globe on right, terminal cursor above crisp HEXLAB typography on left, WEB SECURITY PLAYGROUND subtitle, SCAN. SIMULATE. SECURE. slogan. High contrast neon mint #32ff9b, generous negative space. No people, unrelated text, watermark or UI screenshot.
- `src/anonymous.png`: 내장 imagegen 생성. Prompt: Photorealistic cinematic upper-body portrait of an anonymous adult facing the viewer, black hood and ivory Guy Fawkes style mask. Pitch-black #050a08 background fading to black edges, blurred unreadable terminal fragments, neon green #38f899 rim lighting, reflected mask illumination, realistic cloth and mask, square composition for cropping. No text, logos, watermark, UI screenshot, weapons or extra characters. 가상의 안내 캐릭터이며 특정 단체와의 연계를 나타내지 않습니다.

## 3D 개념 아이콘

`src/icons/`의 6개 아이콘도 내장 imagegen으로 각각 생성했습니다. 모두 1254 × 1254 PNG이며 실제 alpha 투명도를 확인했습니다. 공식 제품 로고가 아닌 역할별 상징 아이콘입니다.

공통 프롬프트: One premium chunky 3D cyber security icon, centered square composition, three-quarter front view, metallic charcoal and graphite materials, beveled edges, soft reflections, colored neon rim lighting, complete clean silhouette, actual transparent alpha background. No ground plane, environment, text, labels, logos, watermark, UI, border, or additional icons.

- `virus.png`: Red glowing spiky metallic sphere with red illuminated seams.
- `wannacry.png`: Orange illuminated padlock enclosing a folded-corner document cube.
- `worm.png`: Acid-lime illuminated segmented technological capsule cable curled into a loop; no organic anatomy.
- `trojan.png`: Amber metallic horse chess knight bust with a subtle open circuit chamber.
- `defender.png`: Mint-green beveled security shield with a thick raised checkmark; original generic design.
- `clamav.png`: Cyan open sculptural clamshell containing a small security shield crossed by a scanning beam.

사용자 시안은 디자인 참고 자료이며 해당 이미지 자체를 사이트에 삽입하지 않았습니다.

## 콘텐츠 소개 3D 장면

내장 `image_gen`으로 각각 생성한 1536 × 1024 PNG 4개를 `src/sections/`에 저장했습니다. 공식 제품 이미지가 아닌 교육용 상징 장면입니다. 각 소개 카드의 상단에서 표시하며 GSAP 스크롤 모션을 적용했습니다.

- `scan-core.png`: Create one premium 3D rendered hero illustration for a hacker education website, wide landscape 1536x1024 composition. An isometric polished dark titanium globe enclosed in concentric luminous emerald scanning rings, small glass shield emblem, thin laser scan plane, futuristic security sensor pedestal. Cohesive black and neon mint green art direction, cinematic soft green rim lighting, detailed glass reflections, brushed metal, premium restrained product rendering. Object centered with generous negative space, almost pure black background seamlessly fading at all edges, no floor horizon, no humans, no branding, no readable words, no watermark. Real depth and rich material texture, elegant uncluttered composition. This is a symbolic educational visualization.

- `web-workspace.png`: Create one premium 3D rendered hero illustration for a hacker education website, wide landscape 1536x1024 composition. Three floating smoked-glass browser windows surrounding a mint-lit transparent cube; abstract colored code lines on one pane, miniature geometric web layout on another, modular layer editor on third. Cohesive black and neon mint green art direction, cinematic soft green rim lighting, detailed glass reflections, brushed metal, premium restrained product rendering. Object centered with generous negative space, almost pure black background seamlessly fading at all edges, no floor horizon, no humans, no branding, no readable words, no watermark. Real depth and rich material texture, elegant uncluttered composition. This is a symbolic educational visualization.

- `defense-core.png`: Create one premium 3D rendered hero illustration for a hacker education website, wide landscape 1536x1024 composition. A red faceted metallic computer-malware spore on the left confronting a radiant emerald translucent shield on the right, small floating document cubes behind a glass quarantine barrier. Cohesive black and neon mint green art direction, cinematic soft green rim lighting, detailed glass reflections, brushed metal, premium restrained product rendering. Object centered with generous negative space, almost pure black background seamlessly fading at all edges, no floor horizon, no humans, no branding, no readable words, no watermark. Real depth and rich material texture, elegant uncluttered composition. This is a symbolic educational visualization.

- `code-terminal.png`: Create one premium 3D rendered hero illustration for a hacker education website, wide landscape 1536x1024 composition. A holographic smoked-glass terminal hovering above a compact dark mechanical keyboard, dense luminous green abstract code lines cascading around the screen, floating emerald glyphs. Cohesive black and neon mint green art direction, cinematic soft green rim lighting, detailed glass reflections, brushed metal, premium restrained product rendering. Object centered with generous negative space, almost pure black background seamlessly fading at all edges, no floor horizon, no humans, no branding, no readable words, no watermark. Real depth and rich material texture, elegant uncluttered composition. This is a symbolic educational visualization.

## 폰트와 모션

- Pretendard Variable v1.3.9: 한국어 본문/UI, SIL Open Font License. 공식 저장소: https://github.com/orioncactus/pretendard
- Orbitron: 디지털 로고/영문 헤드라인, SIL Open Font License. 공식 소스: https://github.com/google/fonts/tree/main/ofl/orbitron
- Share Tech Mono: 코드/터미널, SIL Open Font License. 공식 소스: https://github.com/google/fonts/tree/main/ofl/sharetechmono
- 위 폰트는 로컬 호스팅하며 라이선스를 `src/fonts/`에 함께 보관합니다.
- GSAP 3.15.0 및 ScrollTrigger: 공식 npm 패키지 dist 파일, 저작권 헤더 유지. https://gsap.com/standard-license 및 https://gsap.com/docs/v3/Plugins/ScrollTrigger/
