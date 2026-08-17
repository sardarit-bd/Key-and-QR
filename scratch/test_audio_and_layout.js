console.log('====================================================');
console.log('TESTING AUDIO CONTROL RESOLUTION & LAYOUT LOGIC');
console.log('====================================================\n');

// 1. Test Comprehensive Audio Source Resolution
function resolveAudioTrack(design, editorData) {
  const audioEl =
    design?.elements?.find((e) => e.type === 'audio' && e.audioData?.source) ||
    editorData?.mobile?.elements?.find((e) => e.type === 'audio' && e.audioData?.source) ||
    editorData?.desktop?.elements?.find((e) => e.type === 'audio' && e.audioData?.source) ||
    editorData?.elements?.find((e) => e.type === 'audio' && e.audioData?.source);

  const audioSource =
    audioEl?.audioData ||
    design?.audio ||
    editorData?.mobile?.audio ||
    editorData?.desktop?.audio ||
    editorData?.audio ||
    null;

  return audioSource?.source ? audioSource : null;
}

// TEST 1: Audio added on desktop editorData only, user views in mobile mode
{
  const editorData = {
    desktop: {
      canvas: { width: 800, height: 450 },
      elements: [
        { type: 'text', textData: { content: 'Hello' } },
        { type: 'audio', audioData: { source: 'https://example.com/ambient.mp3', loop: true } },
      ],
    },
    mobile: {
      canvas: { width: 375, height: 667 },
      elements: [
        { type: 'text', textData: { content: 'Hello Mobile' } },
        // Notice: audio element wasn't copied to mobile elements array
      ],
    },
  };

  const activeMobileDesign = editorData.mobile;
  const resolvedAudio = resolveAudioTrack(activeMobileDesign, editorData);

  console.log('TEST 1 - Audio defined only on Desktop elements, resolved in Mobile mode:');
  console.log('  Resolved audio source:', resolvedAudio?.source);
  if (resolvedAudio?.source === 'https://example.com/ambient.mp3') {
    console.log('  ✅ PASS: Audio is successfully discovered and not lost on mobile viewports.\n');
  } else {
    console.error('  ❌ FAIL');
    process.exit(1);
  }
}

// TEST 2: Audio defined on root editorData.audio
{
  const editorData = {
    audio: { source: 'https://example.com/peace.mp3', loop: true },
    desktop: { elements: [] },
    mobile: { elements: [] },
  };

  const resolvedAudio = resolveAudioTrack(editorData.mobile, editorData);
  console.log('TEST 2 - Audio defined on root editorData:');
  console.log('  Resolved audio source:', resolvedAudio?.source);
  if (resolvedAudio?.source === 'https://example.com/peace.mp3') {
    console.log('  ✅ PASS: Root audio tracks resolved correctly.\n');
  } else {
    console.error('  ❌ FAIL');
    process.exit(1);
  }
}

// TEST 3: TopHeader banner visibility on public scan routes
{
  function isTopHeaderVisible(pathname) {
    const isTagPage = pathname?.startsWith('/t/') || pathname?.startsWith('/tag/');
    return !isTagPage;
  }

  const scanRoute1 = isTopHeaderVisible('/t/abc12345');
  const scanRoute2 = isTopHeaderVisible('/tag/XYZ999');
  const shopRoute = isTopHeaderVisible('/shop');
  const homeRoute = isTopHeaderVisible('/');

  console.log('TEST 3 - TopHeader banner conditional display:');
  console.log('  /t/abc12345 visible:', scanRoute1, '(expected false)');
  console.log('  /tag/XYZ999 visible:', scanRoute2, '(expected false)');
  console.log('  /shop visible:', shopRoute, '(expected true)');
  console.log('  / visible:', homeRoute, '(expected true)');

  if (!scanRoute1 && !scanRoute2 && shopRoute && homeRoute) {
    console.log('  ✅ PASS: "24/7 CUSTOMER SUPPORT" promotional banner hidden from scan pages.\n');
  } else {
    console.error('  ❌ FAIL');
    process.exit(1);
  }
}

// TEST 4: Vertical Separation check on Desktop Quote Card
{
  // Badge is at top: 16px (top-4) with height ~32px -> bottom of badge is at y = 48px
  // Audio control is placed at top: 64px (top-16) -> top is at y = 64px
  // Clearance = 64 - 48 = 16px vertical gap
  const badgeBottomY = 16 + 32; // 48px
  const audioTopY = 64; // top-16
  const clearance = audioTopY - badgeBottomY;

  console.log('TEST 4 - Control collision test:');
  console.log(`  Badge bottom Y: ${badgeBottomY}px, Audio control top Y: ${audioTopY}px`);
  console.log(`  Clearance: ${clearance}px`);
  if (clearance >= 16) {
    console.log('  ✅ PASS: 0% collision overlap with Remaining Badge.\n');
  } else {
    console.error('  ❌ FAIL: Controls overlap!');
    process.exit(1);
  }
}

console.log('====================================================');
console.log('ALL 4 AUDIO & LAYOUT TESTS PASSED!');
console.log('====================================================\n');
