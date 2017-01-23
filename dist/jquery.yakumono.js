/*! jquery.yakumono (0.1) github.com/hokkey/jquery.yakumono (C) 2017 Yuma Hori. MIT @license: en.wikipedia.org/wiki/MIT_License */
(function (factory) {
  if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === "object" && _typeof(module.exports) === "object") {
    module.exports = factory(require("jquery"), window, document);
  } else {
    factory(jQuery, window, document);
  }
})(function ($, window, document, undefined) {
  $.fn.yakumono = function (options) {

    if (this.length === 0) {
      return;
    }

    var settings = $.extend({
      // 約物の辞書
      dict: {
        hajimekakko: /（|「|『|［|【|〈|《/,
        owarikakko: /）|」|』|］|】|〉|》/,
        nakaten: /・|：|；/,
        kuten: /。|．/,
        touten: /、|，/,
        kantan: /！|？/
      },
      // クラス名
      className: {
        char: 'js-char',
        yakumono: 'js-char--yakumono',
        startOfLine: 'is-start-of-line',
        endOfLine: 'is-end-of-line',
        oidashi: 'is-oidashi',
        afterOidashi: 'is-after-oidashi'
      },
      // リサイズ時に再計算する
      watchResize: true,
      // リサイズ監視の遅延時間
      watchDelay: 300,
      // em値の横幅を強制する
      forceEmBaseWidth: true
    }, options);

    Object.freeze(settings);

    this.each(function () {
      init($(this), settings);
    });
    watchResize(this, settings);

    // 初期化処理
    function init($elem, settings) {

      // em値の横幅を適用する
      setEmWidth($elem, settings);

      // blastでテキストノードを1文字づつ分割
      $elem.blast({
        delimiter: "character",
        tag: 'span',
        customClass: settings.className.char
      });

      // 1文字づつ約物かどうかを判定
      var $chars = $elem.find("." + settings.className.char);
      var dict = settings.dict;

      $chars.each(function () {
        var $c = $(this);
        var c = $c.text();

        for (var yakumonoType in dict) {
          if (c.match(dict[yakumonoType]) !== null) {
            $c.addClass(settings.className.yakumono + " " + settings.className.yakumono + "--" + yakumonoType);
            return;
          }
        }
      });

      // 約物の前後関係を判定
      detectYakumonoContext($chars, settings);

      // 行頭・行末を判定
      detectGyotouGyomatsu($chars);

      return $chars;
    }

    // em値の横幅を適用する
    function setEmWidth($elem, settings) {
      if (!settings.forceEmBaseWidth) {
        return;
      }

      $elem.width('');

      var fontSize = parseInt($elem.css('font-size'), 10);
      var spaceSize = parseInt($elem.css('letter-spacing'), 10);
      var spaceEm = spaceSize / fontSize;
      var actualWidth = $elem.width();

      var calc = actualWidth / (fontSize + spaceEm);

      var result = Math.floor(calc) - spaceEm;
      var amariEm = Math.floor((actualWidth - result * fontSize) / fontSize);
      $elem.width(result + amariEm + "em");
    }

    // 約物の前後関係を判定
    function detectYakumonoContext($chars, settings) {
      var $previous = void 0;
      $chars.each(function (index) {
        var $current = $(this);

        if (index === 0) {
          $previous = $current;
          return;
        }

        if (!$previous.hasClass("" + settings.className.yakumono)) {
          $previous = $current;
          return;
        }

        for (var type in settings.dict) {
          if ($current.hasClass(settings.className.yakumono + "--" + type)) {
            $previous.addClass(settings.className.yakumono + "--before--" + type);
            $previous = $current;
            return;
          }
        }

        $previous = $current;
      });
    }

    // 行頭・行末を判定
    function detectGyotouGyomatsu($chars) {
      var previousOffset = null;
      var currentOffset = null;
      var $previous = void 0;

      $chars.removeClass(settings.className.startOfLine + " " + settings.className.endOfLine + " " + settings.className.oidashi).each(function (index) {
        var $current = $(this);

        currentOffset = $current[0].offsetTop;

        // 初回
        if (previousOffset === null) {
          $current.addClass(settings.className.startOfLine);
          previousOffset = currentOffset;
          $previous = $current;
          return;
        }

        // 前回からY座標が変化した時に改行を検知
        if (currentOffset > previousOffset) {
          $current.addClass(settings.className.startOfLine);
          $previous.addClass(settings.className.endOfLine);

          var actualOffset = $current[0].offsetTop;

          // クラス付与により前の行に食い込んでしまった場合、
          // 追い出し処理を加える
          if (actualOffset !== currentOffset) {
            $previous.addClass(settings.className.oidashi);

            if (index !== $chars.length) {
              $chars.eq(index + 1).addClass(settings.className.afterOidashi);
            }
          }
        }

        previousOffset = currentOffset;
        $previous = $current;
      });
    }

    // ウィンドウリサイズを監視する
    function watchResize($rootElems, settings) {
      if (!settings.watchResize) {
        return;
      }

      var timer = null;
      $(window).on('resize', function () {
        timer = checkTimer(timer, settings.watchDelay, function () {

          $rootElems.each(function () {
            var $txt = $(this);
            var $chars = $txt.find("." + settings.className.char);

            setEmWidth($txt, settings);
            detectGyotouGyomatsu($chars, settings);
          });
        });
      });
    }

    function checkTimer(timer, delay, callback) {
      if (timer !== null) {
        clearTimeout(timer);
      }

      return setTimeout(function () {
        callback();
      }, delay);
    }
  };
});
