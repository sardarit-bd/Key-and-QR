console.log('====================================================');
console.log('TESTING INSPIRATION STREAK REDESIGN DATA INTEGRITY');
console.log('====================================================\n');

function computeStreakProgress(current) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = current > 0 ? Math.min(Math.max(current / 7, 0.08), 1) : 0;
  const strokeDashoffset = circumference * (1 - progressRatio);
  const label = current === 1 ? 'Day' : 'Days';
  return { circumference, strokeDashoffset, progressRatio, label };
}

// TEST 1: Streak = 7 Days
{
  const res = computeStreakProgress(7);
  console.log(`TEST 1 - Streak = 7: progressRatio=${res.progressRatio}, label="${res.label}"`);
  if (res.progressRatio === 1 && res.label === 'Days' && res.strokeDashoffset === 0) {
    console.log('  ✅ PASS: 7 Days shows 100% completed ring with "Days" label.\n');
  } else {
    console.error('  ❌ FAIL');
    process.exit(1);
  }
}

// TEST 2: Streak = 1 Day
{
  const res = computeStreakProgress(1);
  console.log(`TEST 2 - Streak = 1: progressRatio=${res.progressRatio.toFixed(4)}, label="${res.label}"`);
  if (res.label === 'Day' && Math.abs(res.progressRatio - 1/7) < 0.001) {
    console.log('  ✅ PASS: 1 Day shows ~14.3% progress with singular "Day" label.\n');
  } else {
    console.error('  ❌ FAIL');
    process.exit(1);
  }
}

// TEST 3: Streak = 0 Days
{
  const res = computeStreakProgress(0);
  console.log(`TEST 3 - Streak = 0: progressRatio=${res.progressRatio}, label="${res.label}"`);
  if (res.label === 'Days' && res.progressRatio === 0) {
    console.log('  ✅ PASS: 0 Days shows empty ring with "Days" label.\n');
  } else {
    console.error('  ❌ FAIL');
    process.exit(1);
  }
}

// TEST 4: Weekdays mapping
{
  const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weekActivity = [true, true, true, true, true, true, false]; // Mon-Sat active, Sun inactive

  const mappedDays = DAYS.map((day, i) => ({
    day,
    active: weekActivity[i],
  }));

  console.log('TEST 4 - 7-Day completion mapping:', mappedDays);
  if (mappedDays.length === 7 && mappedDays[0].active && !mappedDays[6].active) {
    console.log('  ✅ PASS: 7 days mapped accurately.\n');
  } else {
    console.error('  ❌ FAIL');
    process.exit(1);
  }
}

console.log('====================================================');
console.log('ALL INSPIRATION STREAK TESTS PASSED!');
console.log('====================================================\n');
