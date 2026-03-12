(function () {
  if (!window.AREA50_COMPANY_ID) {
    console.warn('Zentativ: AREA50_COMPANY_ID not set');
    return;
  }
  var existing = document.getElementById('area50-widget');
  if (existing) return; // prevent double init

  var iframe = document.createElement('iframe');
  iframe.id = 'area50-widget';
  iframe.src =
    (window.AREA50_APP_URL || 'https://zentativ.com') +
    '/widget?company_id=' +
    encodeURIComponent(window.AREA50_COMPANY_ID);
  iframe.style.cssText =
    'position:fixed;bottom:0;right:0;width:420px;height:660px;border:none;' +
    'z-index:2147483647;background:transparent;';
  iframe.setAttribute('allow', 'microphone');
  iframe.setAttribute('title', 'Zentativ Support Widget');
  document.body.appendChild(iframe);
})();
