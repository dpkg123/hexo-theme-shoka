var statics = CONFIG.statics.indexOf('//') > 0 ? CONFIG.statics : CONFIG.root
var scrollAction = { x: 'undefined', y: 'undefined' };
var diffY = 0;
var originTitle, titleTime;

const BODY = document.getElementsByTagName('body')[0];
const HTML = document.documentElement;
const Container = $('#container');
const loadCat = $('#loading');
const siteNav = $('#nav');
const siteHeader = $('#header');
const menuToggle = siteNav.child('.toggle');
const quickBtn = $('#quick');
const sideBar = $('#sidebar');
const siteBrand = $('#brand');
var toolBtn = $('#tool'), toolPlayer, backToTop, goToComment, showContents;
var siteSearch = $('#search');
var siteNavHeight, headerHightInner, headerHight;
var oWinHeight = window.innerHeight;
var oWinWidth = window.innerWidth;
var LOCAL_HASH = 0, LOCAL_URL = window.location.href;
var pjax;
const lazyload = lozad('img, [data-background-image]', {
    loaded: function(el) {
        el.addClass('lozaded');
    }
})

const Loader = {
  timer: null,
  lock: false,
  show: function() {
    clearTimeout(this.timer);
    document.body.removeClass('loaded');
    loadCat.attr('style', 'display:block');
    Loader.lock = false;
  },
  hide: function(sec) {
    if(!CONFIG.loader.start)
      sec = -1
    this.timer = setTimeout(this.vanish, sec||3000);
  },
  vanish: function() {
    if(Loader.lock)
      return;
    if(CONFIG.loader.start)
      transition(loadCat, 0)
    document.body.addClass('loaded');
    Loader.lock = true;
  }
}

const changeTheme = function(type) {
  var btn = $('.theme .ic')
  if(type == 'dark') {
    HTML.attr('data-theme', type);
    btn.removeClass('i-sun')
    btn.addClass('i-moon')
  } else {
    HTML.attr('data-theme', null);
    btn.removeClass('i-moon');
    btn.addClass('i-sun');
  }
}

const changeMetaTheme = function(color) {
  if(HTML.attr('data-theme') == 'dark')
    color = '#222'

  $('meta[name="theme-color"]').attr('content', color);
}

const themeColorListener = function () {
  window.matchMedia('(prefers-color-scheme: dark)').addListener(function(mediaQueryList) {
    if(mediaQueryList.matches){
      changeTheme('dark');
    } else {
      changeTheme();
    }
  });

  var t = store.get('theme');
  if(t) {
    changeTheme(t);
  } else {
    if(CONFIG.darkmode) {
      changeTheme('dark');
    }
  }

  $('.theme').addEventListener('click', function(event) {
    var btn = event.currentTarget.child('.ic')

    var neko = BODY.createChild('div', {
      id: 'neko',
      innerHTML: '<div class="planet"><div class="sun"></div><div class="moon"></div></div><div class="body"><div class="face"><section class="eyes left"><span class="pupil"></span></section><section class="eyes right"><span class="pupil"></span></section><span class="nose"></span></div></div>'
    });

    var hideNeko = function() {
        transition(neko, {
          delay: 2500,
          opacity: 0
        }, function() {
          BODY.removeChild(neko)
        });
    }

    if(btn.hasClass('i-sun')) {
      var c = function() {
          neko.addClass('dark');
          changeTheme('dark');
          store.set('theme', 'dark');
          hideNeko();
        }
    } else {
      neko.addClass('dark');
      var c = function() {
          neko.removeClass('dark');
          changeTheme();
          store.set('theme', 'light');
          hideNeko();
        }
    }
    transition(neko, 1, function() {
      setTimeout(c, 210)
    })
  });
}

const visibilityListener = function () {
  document.addEventListener('visibilitychange', function() {
    switch(document.visibilityState) {
      case 'hidden':
        $('[rel="icon"]').attr('href', statics + CONFIG.favicon.hidden);
        document.title = LOCAL.favicon.hide;
        if(CONFIG.loader.switch)
          Loader.show()
        clearTimeout(titleTime);
      break;
      case 'visible':
        $('[rel="icon"]').attr('href', statics + CONFIG.favicon.normal);
        document.title = LOCAL.favicon.show;
        if(CONFIG.loader.switch)
          Loader.hide(1000)
        titleTime = setTimeout(function () {
          document.title = originTitle;
        }, 2000);
      break;
    }
  });
}

const showtip = function(msg) {
  if(!msg)
    return

  var tipbox = BODY.createChild('div', {
    innerHTML: msg,
    className: 'tip'
  });

  setTimeout(function() {
    tipbox.addClass('hide')
    setTimeout(function() {
      BODY.removeChild(tipbox);
    }, 300);
  }, 3000);
}

const resizeHandle = function (event) {
  siteNavHeight = siteNav.height();
  headerHightInner = siteHeader.height();
  headerHight = headerHightInner + $('#waves').height();

  if(oWinWidth != window.innerWidth)
    sideBarToggleHandle(null, 1);

  oWinHeight = window.innerHeight;
  oWinWidth = window.innerWidth;
  sideBar.child('.panels').height(oWinHeight + 'px')
}

const scrollHandle = function (event) {
  var winHeight = window.innerHeight;
  var docHeight = getDocHeight();
  var contentVisibilityHeight = docHeight > winHeight ? docHeight - winHeight : document.body.scrollHeight - winHeight;
  var SHOW = window.pageYOffset > headerHightInner;
  var startScroll = window.pageYOffset > 0;

  if (SHOW) {
    changeMetaTheme('#FFF');
  } else {
    changeMetaTheme('#222');
  }

  siteNav.toggleClass('show', SHOW);
  toolBtn.toggleClass('affix', startScroll);
  siteBrand.toggleClass('affix', startScroll);
  sideBar.toggleClass('affix', window.pageYOffset > headerHight && document.body.offsetWidth > 991);

  if (typeof scrollAction.y == 'undefined') {
    scrollAction.y = window.pageYOffset;
    //scrollAction.x = Container.scrollLeft;
    //scrollAction.y = Container.scrollTop;
  }
  //var diffX = scrollAction.x - Container.scrollLeft;
  diffY = scrollAction.y - window.pageYOffset;

  //if (diffX < 0) {
  // Scroll right
  //} else if (diffX > 0) {
  // Scroll left
  //} else
  if (diffY < 0) {
    // Scroll down
    siteNav.removeClass('up')
    siteNav.toggleClass('down', SHOW);
  } else if (diffY > 0) {
    // Scroll up
    siteNav.removeClass('down')
    siteNav.toggleClass('up', SHOW);
  } else {
    // First scroll event
  }
  //scrollAction.x = Container.scrollLeft;
  scrollAction.y = window.pageYOffset;

  var scrollPercent = Math.round(Math.min(100 * window.pageYOffset / contentVisibilityHeight, 100)) + '%';
  backToTop.child('span').innerText = scrollPercent;
  $('.percent').width(scrollPercent);
}

const pagePosition = function() {
  if(CONFIG.auto_scroll)
    store.set(LOCAL_URL, scrollAction.y)
}

const positionInit = function(comment) {
  var anchor = window.location.hash
  var target = null;
  if(LOCAL_HASH) {
    store.del(LOCAL_URL);
    return
  }

  if(anchor)
    target = $(decodeURI(anchor))
  else {
    target = CONFIG.auto_scroll ? parseInt(store.get(LOCAL_URL)) : 0
  }

  if(target) {
    pageScroll(target);
    LOCAL_HASH = 1;
  }

  if(comment && anchor && !LOCAL_HASH) {
    pageScroll(target);
    LOCAL_HASH = 1;
  }

}

const clipBoard = function(str, callback) {
  var ta = BODY.createChild('textarea', {
    style: {
      top: window.scrollY + 'px', // Prevent page scrolling
      position: 'absolute',
      opacity: '0'
    },
    readOnly: true,
    value: str
  });

  const selection = document.getSelection();
  const selected = selection.rangeCount > 0 ? selection.getRangeAt(0) : false;
  ta.select();
  ta.setSelectionRange(0, str.length);
  ta.readOnly = false;
  var result = document.execCommand('copy');
  callback && callback(result);
  ta.blur(); // For iOS
  if (selected) {
    selection.removeAllRanges();
    selection.addRange(selected);
  }
  BODY.removeChild(ta);
}

const isOutdated = function() {
    if (CONFIG.isOutdated.enable && LOCAL.isOutdated) {
        var times = document.getElementsByTagName("time");
        if (times.length === 0) {
            return;
        }
        var posts = document.getElementsByClassName("body md");
        if (posts.length === 0) {
            return;
        }

        var now = Date.now(); // 当前时间戳
        var pubTime = new Date(times[0].dateTime); // 文章发布时间戳
        if (times.length === 1) {
            var updateTime = pubTime; // 文章发布时间亦是最后更新时间
        } else {
            var updateTime = new Date(times[1].dateTime); // 文章最后更新时间戳
        }
        var interval = parseInt(now - updateTime); // 时间差
        var days = parseInt(CONFIG.isOutdated.days) || 30; // 设置时效，默认硬编码 30 天
        // 最后一次更新时间超过 days 天（毫秒）
        var dayLevelValue = 24 * 60 * 60 * 1000;
        if (interval > days * dayLevelValue) {
            var monthLevelValue = 30 * 24 * 60 * 60 * 1000;
            var yearLevelValue = 365 * 24 * 60 * 60 * 1000;

            function getDifference(period) {
                /******* 计算出时间差中的年、月、日 *******/
                function getYear(period) {
                    return parseInt(period) / yearLevelValue;
                }
                function getMonth(period) {
                    return parseInt(period) / monthLevelValue;
                }
                function getDay(period) {
                    return parseInt(period) / dayLevelValue;
                }
                function isEmpty(obj){
                    if(typeof obj == "undefined" || obj == null || obj == ""){
                        return true;
                    }else{
                        return false;
                    }
                }
                var year = parseInt(getYear(period));
                var month = parseInt(getMonth(period - year * yearLevelValue));
                var day = parseInt(getDay(period - year * yearLevelValue - month * monthLevelValue));

                var result = "";
                if (year != 0) {
                    result += LOCAL.format_year_as_prefix.replace("{{year}}", year)
                }
                if (month != 0) {
                    if (isEmpty(result)) {
                        result += LOCAL.format_month_as_prefix.replace("{{month}}", month)
                    } else {
                        result += LOCAL.format_month_as_suffix.replace("{{month}}", month)
                    }
                }
                if (day != 0) {
                    if (isEmpty(result)) {
                        result += LOCAL.format_day_as_prefix.replace("{{day}}", day)
                    } else {
                        result += LOCAL.format_day_as_suffix.replace("{{day}}", day)
                    }
                }
                return result;
            }
            var publish = getDifference(now - pubTime);
            var updated = getDifference(interval);
            var template = LOCAL.template.replace("{{publish}}", publish).replace("{{updated}}", updated);
            posts[0].insertAdjacentHTML("afterbegin", template);
        }
    }
};
