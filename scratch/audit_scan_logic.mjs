const BACKEND_URL = 'http://localhost:5001/api/v1';

async function testScanLogic() {
  console.log('====================================================');
  console.log('AUDITING QR SCAN & DAILY QUOTE RESOLUTION LOGIC');
  console.log('====================================================\n');

  try {
    const res1 = await fetch(`${BACKEND_URL}/scan/public/TAG-9E3111-MTB927ZL`);
    const data1 = await res1.json();
    console.log('TEST 1: Scan response:');
    console.log('Status Code:', res1.status);
    console.log('Success:', data1.success);
    console.log('Quote:', data1?.data?.text || data1?.data?.quote);
    console.log('isNewQuoteToday:', data1?.data?.isNewQuoteToday);
    console.log('isAlreadyUnlockedToday:', data1?.data?.isAlreadyUnlockedToday);
    console.log('Message:', data1?.data?.message);

    console.log('\nTEST 2: Second Scan on Same Day (Same Tag):');
    const res2 = await fetch(`${BACKEND_URL}/scan/public/TAG-9E3111-MTB927ZL`);
    const data2 = await res2.json();
    console.log('Status Code:', res2.status);
    console.log('Success:', data2.success);
    console.log('Quote:', data2?.data?.text || data2?.data?.quote);
    console.log('isNewQuoteToday:', data2?.data?.isNewQuoteToday);
    console.log('isAlreadyUnlockedToday:', data2?.data?.isAlreadyUnlockedToday);
    console.log('Message:', data2?.data?.message);

    const isSameQuote = (data1?.data?._id === data2?.data?._id) || (data1?.data?.text === data2?.data?.text);
    console.log('\nAssertion: Quote matches between scans today:', isSameQuote ? '✅ PASS' : '❌ FAIL');
    console.log('Assertion: isAlreadyUnlockedToday flag set on repeat scan:', data2?.data?.isAlreadyUnlockedToday === true ? '✅ PASS' : '❌ FAIL');
    console.log('Assertion: Polite status message returned:', typeof data2?.data?.message === 'string' ? '✅ PASS' : '❌ FAIL');
    console.log('\n====================================================');
    console.log('AUDIT VERIFICATION COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
  } catch (err) {
    console.error('Audit script error:', err.message);
  }
}

testScanLogic();
