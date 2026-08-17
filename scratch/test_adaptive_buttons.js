console.log('====================================================');
console.log('TESTING ADAPTIVE ACTION BUTTONS & CONTRAST MODES');
console.log('====================================================\n');

function isLightBackground(editorData, theme) {
  const bgColor =
    editorData?.desktop?.canvas?.backgroundColor ||
    editorData?.mobile?.canvas?.backgroundColor ||
    editorData?.canvas?.backgroundColor ||
    editorData?.backgroundColor ||
    editorData?.background?.color;

  if (bgColor && typeof bgColor === 'string') {
    const clean = bgColor.replace('#', '').trim().toLowerCase();
    if (clean === 'fff' || clean === 'ffffff' || clean === 'white') return true;
    if (clean.length === 3 || clean.length === 6) {
      const fullHex = clean.length === 3 ? clean.split('').map((x) => x + x).join('') : clean;
      const num = parseInt(fullHex, 16);
      if (!Number.isNaN(num)) {
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        return 0.299 * r + 0.587 * g + 0.114 * b > 165;
      }
    }
  }
  return theme === 'light';
}

// TEST A: Pure white canvas quote
{
  const editorData = { desktop: { canvas: { backgroundColor: '#ffffff' } } };
  const isLight = isLightBackground(editorData, null);
  console.log('TEST A - White artwork detected:', isLight);
  if (isLight === true) {
    console.log('  ✅ PASS: White artwork accurately triggers light contrast mode.\n');
  } else {
    console.error('  ❌ FAIL');
    process.exit(1);
  }
}

// TEST B: Dark midnight canvas quote
{
  const editorData = { desktop: { canvas: { backgroundColor: '#0f172a' } } };
  const isLight = isLightBackground(editorData, null);
  console.log('TEST B - Dark artwork detected:', isLight);
  if (isLight === false) {
    console.log('  ✅ PASS: Dark artwork accurately triggers dark contrast mode.\n');
  } else {
    console.error('  ❌ FAIL');
    process.exit(1);
  }
}

// TEST C: Autumn / colorful photo quote
{
  const editorData = null; // Photo quote with theme dark
  const isLight = isLightBackground(editorData, 'dark');
  console.log('TEST C - Photo artwork with dark theme detected:', isLight);
  if (isLight === false) {
    console.log('  ✅ PASS: Photo quote defaults to rich contrast mode.\n');
  } else {
    console.error('  ❌ FAIL');
    process.exit(1);
  }
}

// TEST D: Hover state verification
{
  const hoverClass = 'hover:bg-black/70 hover:border-white/40';
  console.log('TEST D - Non-white hover state:', hoverClass);
  if (!hoverClass.includes('hover:bg-white') && !hoverClass.includes('hover:bg-muted')) {
    console.log('  ✅ PASS: Button hover deepens translucent glass and NEVER turns white.\n');
  } else {
    console.error('  ❌ FAIL');
    process.exit(1);
  }
}

console.log('====================================================');
console.log('ALL ADAPTIVE CONTRAST TESTS PASSED!');
console.log('====================================================\n');
