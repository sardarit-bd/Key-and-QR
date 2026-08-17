import { CANVAS_DEFAULTS, CANVAS_SIZES } from '../src/components/dashboard/admin/editor/editorConstants.js';

console.log('Testing Visual Quote Constants & Scaling:');
console.log('CANVAS_DEFAULTS:', CANVAS_DEFAULTS);
console.log('CANVAS_SIZES:', CANVAS_SIZES);

if (CANVAS_SIZES.desktop.width === 800 && CANVAS_SIZES.desktop.height === 450) {
  console.log('✅ PASS: Desktop canvas size is 800x450');
} else {
  console.error('❌ FAIL: Desktop canvas size is not 800x450');
  process.exit(1);
}

if (CANVAS_SIZES.mobile.width === 375 && CANVAS_SIZES.mobile.height === 667) {
  console.log('✅ PASS: Mobile canvas size is 375x667');
} else {
  console.error('❌ FAIL: Mobile canvas size is not 375x667');
  process.exit(1);
}

// Test aspect ratio
const desktopAspect = CANVAS_SIZES.desktop.width / CANVAS_SIZES.desktop.height;
if (Math.abs(desktopAspect - 16 / 9) < 0.001) {
  console.log('✅ PASS: Desktop canvas aspect ratio is 16:9 (1.777...)');
} else {
  console.error('❌ FAIL: Desktop canvas aspect ratio is not 16:9');
  process.exit(1);
}

console.log('All constant checks passed successfully!');
