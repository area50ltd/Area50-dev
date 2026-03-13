(function () {
  // Support both new and legacy variable names
  var companyId = window.ZENTATIV_COMPANY_ID || window.AREA50_COMPANY_ID;
  if (!companyId) {
    console.warn('Zentativ: ZENTATIV_COMPANY_ID not set');
    return;
  }
  var existing = document.getElementById('zentativ-widget');
  if (existing) return; // prevent double-init

  // Start at launcher size only — expands to full widget on open (via postMessage)
  var iframe = document.createElement('iframe');
  iframe.id = 'zentativ-widget';
  iframe.src =
    (window.ZENTATIV_APP_URL || window.AREA50_APP_URL || 'https://zentativ.com') +
    '/widget?company_id=' +
    encodeURIComponent(companyId);

  iframe.style.cssText = [
    'position:fixed',
    'bottom:0',
    'right:0',
    'width:90px',
    'height:90px',
    'border:none',
    'z-index:2147483647',
    'background:transparent',
    'transition:width 0.25s ease,height 0.25s ease',
  ].join(';');

  iframe.setAttribute('allow', 'microphone');
  iframe.setAttribute('title', 'Zentativ Support Widget');

  document.body.appendChild(iframe);

  // Resize the iframe when the widget opens/closes
  window.addEventListener('message', function (e) {
    if (!e.data || e.data.type !== 'zentativ:resize') return;
    var w = Number(e.data.width);
    var h = Number(e.data.height);
    if (w > 0 && h > 0) {
      iframe.style.width = w + 'px';
      iframe.style.height = h + 'px';
    }
  });
})();
