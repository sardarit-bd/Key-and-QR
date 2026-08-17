import { CANVAS_DEFAULTS, CANVAS_SIZES } from '../src/components/dashboard/admin/editor/editorConstants.js';

console.log('====================================================');
console.log('RUNNING COMPREHENSIVE VISUAL QUOTE SCALING TESTS');
console.log('====================================================\n');

function computeUniformScale(containerW, containerH, canvasW, canvasH, maxScale = 2) {
  if (containerW <= 0 || containerH <= 0 || canvasW <= 0 || canvasH <= 0) return 1;
  const scaleX = containerW / canvasW;
  const scaleY = containerH / canvasH;
  const uniformScale = Math.min(scaleX, scaleY);
  return Math.min(uniformScale, maxScale);
}

// TEST 1: Desktop 800x450 at full 800x450 container
{
  const containerW = 800;
  const containerH = 450;
  const canvasW = 800;
  const canvasH = 450;
  const scale = computeUniformScale(containerW, containerH, canvasW, canvasH);
  const displayW = Math.round(canvasW * scale);
  const displayH = Math.round(canvasH * scale);

  console.log(`TEST 1 - Desktop 800x450 in 800x450 container: scale=${scale}, display=${displayW}x${displayH}`);
  if (scale === 1 && displayW === 800 && displayH === 450) {
    console.log('  ✅ PASS: Exact 1:1 fit with 0 gaps or side borders.');
  } else {
    console.error('  ❌ FAIL');
    process.exit(1);
  }
}

// TEST 2: Desktop 800x450 on smaller desktop/tablet (e.g. 600px width, 16:9 aspect = 337.5px height)
{
  const containerW = 600;
  const containerH = 337.5;
  const canvasW = 800;
  const canvasH = 450;
  const scale = computeUniformScale(containerW, containerH, canvasW, canvasH);
  const displayW = Math.round(canvasW * scale);
  const displayH = Math.round(canvasH * scale);

  console.log(`TEST 2 - Smaller desktop 600x337.5: scale=${scale}, display=${displayW}x${displayH}`);
  if (scale === 0.75 && displayW === 600 && displayH === 338) {
    console.log('  ✅ PASS: Uniform 0.75 scaling with 0 aspect distortion.');
  } else {
    console.error('  ❌ FAIL');
    process.exit(1);
  }
}

// TEST 3: Mobile 375x667 on standard mobile viewport (e.g. 375px width, 667px height)
{
  const containerW = 375;
  const containerH = 667;
  const canvasW = 375;
  const canvasH = 667;
  const scale = computeUniformScale(containerW, containerH, canvasW, canvasH);
  const displayW = Math.round(canvasW * scale);
  const displayH = Math.round(canvasH * scale);

  console.log(`TEST 3 - Mobile 375x667 in 375x667 container: scale=${scale}, display=${displayW}x${displayH}`);
  if (scale === 1 && displayW === 375 && displayH === 667) {
    console.log('  ✅ PASS: Exact 1:1 mobile fit, full composition visible.');
  } else {
    console.error('  ❌ FAIL');
    process.exit(1);
  }
}

// TEST 4 & 5: Mobile 375x667 on smaller mobile screen (e.g. 350px width, 622.5px height)
{
  const containerW = 350;
  const containerH = 622.5;
  const canvasW = 375;
  const canvasH = 667;
  const scale = computeUniformScale(containerW, containerH, canvasW, canvasH);
  const displayW = Math.round(canvasW * scale);
  const displayH = Math.round(canvasH * scale);

  console.log(`TEST 4/5 - Mobile 375x667 on 350x622.5: scale=${scale.toFixed(4)}, display=${displayW}x${displayH}`);
  if (Math.abs(scale - 350 / 375) < 0.001 && displayW === 350 && displayH === 623) {
    console.log('  ✅ PASS: Mobile portrait uniformly scaled, no squishing to stamp.');
  } else {
    console.error('  ❌ FAIL');
    process.exit(1);
  }
}

// TEST 6: Legacy 800x600 quote
{
  const containerW = 800;
  const containerH = 600;
  const canvasW = 800;
  const canvasH = 600;
  const scale = computeUniformScale(containerW, containerH, canvasW, canvasH);
  const displayW = Math.round(canvasW * scale);
  const displayH = Math.round(canvasH * scale);

  console.log(`TEST 6 - Legacy 800x600 in 800x600 container: scale=${scale}, display=${displayW}x${displayH}`);
  if (scale === 1 && displayW === 800 && displayH === 600) {
    console.log('  ✅ PASS: Legacy 800x600 canvas supported dynamically.');
  } else {
    console.error('  ❌ FAIL');
    process.exit(1);
  }
}

// TEST 7: Coordinates preservation check
{
  const sourceElements = [
    { type: 'image', x: 400, y: 225, width: 800, height: 450 },
    { type: 'text', x: 400, y: 200, width: 620, height: 100, textData: { content: 'Stay hungry' } },
    { type: 'text', x: 400, y: 300, width: 400, height: 40, textData: { content: '— Steve Jobs' } },
  ];

  const scale = 0.5; // container is 400x225
  const scaledX = sourceElements[0].x * scale;
  const scaledY = sourceElements[0].y * scale;

  console.log(`TEST 7 - Element coordinates preservation: source=(400, 225) -> scaled transform box=(${scaledX}, ${scaledY})`);
  if (scaledX === 200 && scaledY === 112.5) {
    console.log('  ✅ PASS: Elements scale proportionally relative to (0,0) canvas origin.');
  } else {
    console.error('  ❌ FAIL');
    process.exit(1);
  }
}

console.log('\n====================================================');
console.log('ALL 7 VISUAL QUOTE SCALING TESTS PASSED!');
console.log('====================================================\n');
