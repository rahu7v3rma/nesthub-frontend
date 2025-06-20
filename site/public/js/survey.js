function sparrowLaunch(opts) {
  var e = 'ss-widget',
    t = 'script',
    a = document,
    r = window,
    l = localStorage;
  var s,
    n,
    c,
    rm = a.getElementById('SS_SCRIPT');
  r.SS_WIDGET_TOKEN = opts.SS_WIDGET_TOKEN;
  r.SS_ACCOUNT = opts.SS_ACCOUNT;
  r.SS_SURVEY_NAME = opts.SS_SURVEY_NAME;
  if (!a.getElementById(e) && !l.getItem('removed-ss-widget-tt-alZ3LXo8EsB')) {
    var S = function () {
      S.update(arguments);
    };
    S.args = [];
    S.update = function (e) {
      S.args.push(e);
    };
    r.SparrowLauncher = S;
    s = a.getElementsByTagName(t);
    c = s[s.length - 1];
    n = a.createElement(t);
    n.type = 'text/javascript';
    n.async = !0;
    n.id = e;
    n.src = [
      'https://',
      `${r.SS_ACCOUNT}/widget/`,
      r.SS_WIDGET_TOKEN,
      '?',
      'customParams=',
      JSON.stringify(opts),
    ].join('');
    c.parentNode.insertBefore(n, c);
    r.SS_VARIABLES = opts;
    rm.parentNode.removeChild(rm);
  }
}
