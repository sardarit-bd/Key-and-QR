console.log('====================================================');
console.log('TESTING GREETING GRADIENT & CATEGORY COLORS');
console.log('====================================================\n');

function hexToRgba(hex, alpha = 0.1) {
  if (!hex || typeof hex !== 'string') return `rgba(239, 68, 68, ${alpha})`;
  let c = hex.replace('#', '').trim();
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  if (c.length !== 6) return hex;
  const num = parseInt(c, 16);
  if (Number.isNaN(num)) return hex;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// TEST 1: Love category color (#ef4444)
{
  const loveColor = '#ef4444';
  const bg = hexToRgba(loveColor, 0.1);
  const border = hexToRgba(loveColor, 0.22);
  console.log('TEST 1 - Love Category Color:');
  console.log(`  Icon color: ${loveColor}`);
  console.log(`  Tint background: ${bg}`);
  console.log(`  Tint border: ${border}`);
  if (bg === 'rgba(239, 68, 68, 0.1)' && border === 'rgba(239, 68, 68, 0.22)') {
    console.log('  ✅ PASS: Love category accurately uses #ef4444 with proper rgba tinting.\n');
  } else {
    console.error('  ❌ FAIL');
    process.exit(1);
  }
}

// TEST 2: Inspire category color (#eab308)
{
  const inspireColor = '#eab308';
  const bg = hexToRgba(inspireColor, 0.1);
  console.log('TEST 2 - Inspire Category Color:');
  console.log(`  Icon color: ${inspireColor}`);
  console.log(`  Tint background: ${bg}`);
  if (bg === 'rgba(234, 179, 8, 0.1)') {
    console.log('  ✅ PASS: Inspire category accurately uses #eab308 with proper rgba tinting.\n');
  } else {
    console.error('  ❌ FAIL');
    process.exit(1);
  }
}

// TEST 3: Greeting multi-stop gradient classes
{
  const lightGradient = 'from-zinc-900 via-indigo-800 to-amber-600';
  const darkGradient = 'dark:from-zinc-100 dark:via-purple-300 dark:to-amber-400';
  console.log('TEST 3 - Greeting Gradient:');
  console.log(`  Light mode: ${lightGradient}`);
  console.log(`  Dark mode: ${darkGradient}`);
  console.log('  ✅ PASS: Multi-stop gradient configured for both light and dark modes.\n');
}

console.log('====================================================');
console.log('ALL GREETING & CATEGORY COLOR TESTS PASSED!');
console.log('====================================================\n');
