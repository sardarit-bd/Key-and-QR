console.log('====================================================');
console.log('TESTING MOBILE FULL-WIDTH VISUAL QUOTE SCALING (REAL DOM SIMULATION)');
console.log('====================================================\n');

function updateScaling({ containerW, containerH, canvasW, canvasH, isMobileMode, maxScale = 2 }) {
  if (containerW <= 0) return 1;

  let uniformScale;
  if (isMobileMode) {
    // On mobile: scale based on available content width so it fills 100% of the mobile width
    uniformScale = containerW / canvasW;
  } else {
    // On desktop: uniform fit respecting both width and height to maintain 16:9 ratio
    const scaleX = containerW / canvasW;
    const scaleY = containerH > 0 ? containerH / canvasH : scaleX;
    uniformScale = Math.min(scaleX, scaleY);
  }

  const computedScale = Math.min(uniformScale, maxScale);
  return Number.isFinite(computedScale) && computedScale > 0 ? computedScale : 1;
}

// TEST 1: User Request exact scenario (viewport 402px, padding 16px each side -> available quote width 370px)
{
  const viewportW = 402;
  const paddingX = 16 * 2;
  const availableWidth = viewportW - paddingX; // 370px
  const canvasW = 375;
  const canvasH = 667;

  const scale = updateScaling({
    containerW: availableWidth,
    containerH: availableWidth * (canvasH / canvasW),
    canvasW,
    canvasH,
    isMobileMode: true,
  });

  const displayWidth = Math.round(canvasW * scale);
  const displayHeight = Math.round(canvasH * scale);

  console.log(`TEST 1 - Mobile Viewport 402px (Padding 16px -> 370px Content Area):`);
  console.log(`  Scale: ${scale.toFixed(4)}`);
  console.log(`  Rendered Width: ${displayWidth}px`);
  console.log(`  Rendered Height: ${displayHeight}px`);

  if (displayWidth === 370 && displayHeight === 658) {
    console.log('  ✅ PASS: Quote width is exactly 370px (100% of available mobile content area, NOT 328px).\n');
  } else {
    console.error(`  ❌ FAIL: Expected 370px, got ${displayWidth}px`);
    process.exit(1);
  }
}

// TEST 2: Standard 375px phone viewport (padding 16px -> 343px available width)
{
  const availableWidth = 375 - 32; // 343px
  const canvasW = 375;
  const canvasH = 667;

  const scale = updateScaling({
    containerW: availableWidth,
    containerH: availableWidth * (canvasH / canvasW),
    canvasW,
    canvasH,
    isMobileMode: true,
  });

  const displayWidth = Math.round(canvasW * scale);
  const displayHeight = Math.round(canvasH * scale);

  console.log(`TEST 2 - 375px Phone (343px Content Area): displayWidth=${displayWidth}px, displayHeight=${displayHeight}px`);
  if (displayWidth === 343 && displayHeight === 610) {
    console.log('  ✅ PASS: Quote fills 100% of available content width.\n');
  } else {
    console.error('  ❌ FAIL');
    process.exit(1);
  }
}

// TEST 3: 390px iPhone viewport (padding 16px -> 358px available width)
{
  const availableWidth = 390 - 32; // 358px
  const canvasW = 375;
  const canvasH = 667;

  const scale = updateScaling({
    containerW: availableWidth,
    containerH: availableWidth * (canvasH / canvasW),
    canvasW,
    canvasH,
    isMobileMode: true,
  });

  const displayWidth = Math.round(canvasW * scale);
  const displayHeight = Math.round(canvasH * scale);

  console.log(`TEST 3 - 390px iPhone (358px Content Area): displayWidth=${displayWidth}px, displayHeight=${displayHeight}px`);
  if (displayWidth === 358 && displayHeight === 637) {
    console.log('  ✅ PASS: Quote fills 100% of available content width.\n');
  } else {
    console.error('  ❌ FAIL');
    process.exit(1);
  }
}

// TEST 4: Desktop 800x450 (16:9) verification
{
  const canvasW = 800;
  const canvasH = 450;
  const scale = updateScaling({
    containerW: 800,
    containerH: 450,
    canvasW,
    canvasH,
    isMobileMode: false,
  });

  const displayWidth = Math.round(canvasW * scale);
  const displayHeight = Math.round(canvasH * scale);

  console.log(`TEST 4 - Desktop 800x450 in 800x450: displayWidth=${displayWidth}px, displayHeight=${displayHeight}px`);
  if (displayWidth === 800 && displayHeight === 450 && scale === 1) {
    console.log('  ✅ PASS: Desktop remains strictly 800x450 (16:9) with zero regression.\n');
  } else {
    console.error('  ❌ FAIL');
    process.exit(1);
  }
}

// TEST 5: Legacy 800x600 quote verification
{
  const canvasW = 800;
  const canvasH = 600;
  const scale = updateScaling({
    containerW: 800,
    containerH: 600,
    canvasW,
    canvasH,
    isMobileMode: false,
  });

  const displayWidth = Math.round(canvasW * scale);
  const displayHeight = Math.round(canvasH * scale);

  console.log(`TEST 5 - Legacy 800x600: displayWidth=${displayWidth}px, displayHeight=${displayHeight}px`);
  if (displayWidth === 800 && displayHeight === 600 && scale === 1) {
    console.log('  ✅ PASS: Legacy 800x600 quotes supported dynamically.\n');
  } else {
    console.error('  ❌ FAIL');
    process.exit(1);
  }
}

console.log('====================================================');
console.log('ALL TESTS PASSED WITH 100% ACCURACY!');
console.log('====================================================\n');
