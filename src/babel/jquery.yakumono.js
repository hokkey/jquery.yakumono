/**!
  @license
  jQuery.yakumono (0.3.0) github.com/hokkey/jquery.yakumono
  (C) 2017 Yuma Hori.
  MIT license: en.wikipedia.org/wiki/MIT_License
*/
(function (factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = factory(require("jquery"), window, document);
  }
  else {
    factory(jQuery, window, document);
  }
}(function ($, window, document, undefined) {

  const methods = {

    // yakumono
    yakumono: ($elems, options) => {
      if ($elems.length === 0) return $elems;

      if ($.type($().blast) !== 'function') {
        console.error('jQuery.yakumono: Blast.jsが見つかりません。');
        return $elems;
      }

      const settings = $.extend({}, $.fn.yakumono.defaults, options);
      settings.safariMode = methods.checkSafari(settings);

      $elems.each(function () {
        methods.init($(this), settings);
      });

      methods.watchResize($elems, settings);

      return $elems;
    },

    // Safariであるかを判定
    checkSafari: (settings) => {
      if (settings.polyfillSafari !== true) {
        return false;
      }
      return navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1 && navigator.userAgent.indexOf('Edge') === -1;
    },

    // 初期化処理
    init: ($elem, settings) => {
      if (settings.safariMode) {
        $elem.addClass(settings.className.safari);
      }

      methods.replaceDash($elem, settings);

      methods.makeGyomatsuYakumonoHankaku($elem, settings);
      methods.makeJisage($elem, settings);
      methods.makeTategumi($elem, settings);
      methods.makeBetagumi($elem, settings);
      methods.makeTsumegumi($elem, settings);

      // blastでテキストノードを1文字づつ分割
      methods.blast($elem, settings);

      // 1文字づつ約物かどうかを判定
      const $chars = methods.detectYakumono($elem, settings);

      // 約物の前後関係を判定
      methods.detectYakumonoContext($chars, settings);

      // 行頭・行末を判定
      methods.detectGyotouGyoumatsu($chars, settings);

      return $chars;
    },

    // 全角ダッシュを罫線に置換する
    replaceDash: ($elem, settings) => {
      if (settings.replaceDash) {
        $elem.html($elem.html().replace('――', '──'));
      }
    },

    // ツメ組みクラスを付与
    makeTsumegumi: ($elem, settings) => {
      if (settings.isTsumegumi !== true) {
        return;
      }

      $elem.addClass(settings.className.tsumegumi);
    },

    // 字下げクラスを付与
    makeJisage: ($elem, settings) => {
      if (settings.useJisage !== true) {
        return;
      }

      $elem.addClass(settings.className.jisage);
    },

    // 縦組みクラスを付与
    makeTategumi: ($elem, settings) => {
      if (settings.isTategumi !== true) {
        return;
      }

      $elem.addClass(settings.className.tategumi);
    },

    // 行末約物半角クラスを付与
    makeGyomatsuYakumonoHankaku: ($elem, settings) => {
      if (settings.isGyomatsuYakumonoHankaku !== true) {
        return;
      }

      $elem.addClass(settings.className.gyomatsuYakumonoHankaku);
    },

    // ベタ組みレイアウトを適用
    makeBetagumi: ($elem, settings) => {

      // ツメ組みがtrueのときは無視する
      if (settings.isBetagumi !== true || settings.isTsumegumi) {
        return;
      }

      if (settings.betagumiCenter) {
        $elem.addClass(settings.className.betagumiCenter);
      }

      // 横書き用処理
      if (!settings.isTategumi) {
        $elem.addClass(settings.className.betagumi).width('');

        const fontSizePx = parseInt($elem.css('font-size'), 10);
        const actualWidthPx = $elem.width();
        const characters = Math.floor(actualWidthPx / fontSizePx);
        $elem.width(`${characters}em`);
        return;
      }

      // 縦書き用処理
      if (settings.isTategumi) {
        $elem.addClass(settings.className.betagumi).height('');

        const fontSizePx = parseInt($elem.css('font-size'), 10);
        const actualWidthPx = $elem.height();
        const characters = Math.floor(actualWidthPx / fontSizePx);
        $elem.height(`${characters}em`);
      }
    },

    // blast
    blast: ($elem, settings) => {
      return $elem.blast({
        delimiter: "character",
        tag: 'span',
        customClass: settings.className.char,
      });
    },

    // 1文字づつ約物かどうかを判定
    detectYakumono: ($elem, settings) => {
      const $chars = $elem.find(`.${settings.className.char}`);

      $chars.each(function () {
        methods.addYakumonoClass($(this), settings);
      });

      return $chars;
    },

    // 文字の種類を判定してクラスを付与する
    addYakumonoClass: ($char, settings) => {
      const c = $char.text();

      for (const yakumonoType in settings.dict) {
        if (c.match(settings.dict[yakumonoType]) !== null) {
          $char.addClass(`${settings.className.yakumono} ${settings.className.yakumono}${settings.className.separator}${yakumonoType}`);
          return;
        }
      }
    },

    // 約物の前後関係を判定
    detectYakumonoContext: ($chars, settings) => {
      let $previous = null;

      $chars.each(function () {
        $previous = methods.setYakumonoContextClass($previous, $(this), settings);
      });
    },

    // 前後の要素から約物クラスを付与する
    setYakumonoContextClass: ($previous, $current, settings) => {
      if ($previous === null || !$previous.hasClass(`${settings.className.yakumono}`)) {
        return $current;
      }

      for (const type in settings.dict) {
        if ($current.hasClass(`${settings.className.yakumono}${settings.className.separator}${type}`)) {
          $previous.addClass(`${settings.className.yakumono}${settings.className.separator}before${settings.className.separator}${type}`);
        }
        if ($previous.hasClass(`${settings.className.yakumono}${settings.className.separator}${type}`)) {
          $current.addClass(`${settings.className.yakumono}${settings.className.separator}after${settings.className.separator}${type}`);
        }
      }

      return $current;
    },

    // 行頭・行末を判定
    detectGyotouGyoumatsu: ($chars, settings) => {
      let previousOffset = null;
      let currentOffset = null;
      let $previous;

      const getOffset = ($current) => {
        if (!settings.isTategumi) {
          return $current[0].offsetTop;
        }
        return $current[0].offsetLeft;
      };

      $chars
        .css('letter-spacing', '')
        .removeClass(`${settings.className.startOfLine} ${settings.className.endOfLine} ${settings.className.oidashi} ${settings.className.oidashiSmall}`)
        .each(function () {
          const $current = $(this);

          currentOffset = getOffset($current);

          // 初回
          if (previousOffset === null) {
            $current.addClass(settings.className.startOfLine);
            previousOffset = currentOffset;
            $previous = $current;
            return;
          }

          // 前回からY座標が変化した時に改行を検知
          if (currentOffset > previousOffset) {

            // 1文字手前は行末として判定
            $previous.addClass(settings.className.endOfLine);
            const actualOffset = getOffset($current);

            // クラス付与により行頭文字が前の行に追い込まれなかった場合は、現在の文字を行頭として判定
            if (actualOffset === currentOffset) {
              $current.addClass(settings.className.startOfLine);

              // この文字が始め括弧だった場合、やはり、その影響で前の行に追い込まれる場合がある
              // その場合は、1文字前に特別な追い出しクラスを付与する
              // このクラス(A.)は後述の(B.)とは異なる設定となる
              // この追い出し量は僅かで良い
              if (getOffset($current) !== currentOffset) {
                $previous.addClass(settings.className.oidashiSmall);
              }
            }

            // 行頭だった現在の文字が行末に追いこまれてしまった場合
            if (actualOffset !== currentOffset) {

              // 字間調整機能がオフのとき
              if (!settings.useLetterSpacingAdjustment || settings.isTategumi) {
                // このままでは前の文字と現在の文字の間が詰まりすぎてしまうので、
                // 前の文字に半角分の追い出しクラスを付与する(B.)
                $previous
                  .addClass(settings.className.oidashi);
              }

              // 字間調整機能がオンのときはさらに詳細な計算を開始
              if (settings.useLetterSpacingAdjustment) {
                methods.adjustLetterSpacing($previous, settings);
              }
            }
          }

          previousOffset = currentOffset;
          $previous = $current;
        })
      ;
    },

    floatFormat: (number, n) => {
      const _pow = Math.pow(10, n);
      return Math.floor(number * _pow) / _pow;
    },

    // 文字間隔を調整して行末のアキをなくす
    adjustLetterSpacing: ($char, settings) => {

      // 縦組みモードでは無視
      if (settings.isTategumi) {
        return;
      }

      const chars = methods.getCharsOfLine($char, settings);
      const lsValue = methods.floatFormat((0.965 / (chars.length)), 5);

      chars.forEach(($elem) => {
        $elem.css('letter-spacing', `${lsValue}em`);
      });
    },

    // 行頭から行末の範囲の文字列を取得する
    getCharsOfLine: ($char, settings) => {
      const startOfLine = settings.className.startOfLine;
      let end = false;
      const chars = [];

      let $current = $char;
      let $next;

      while (end === false) {
        $next = $current.prev();

        if ($next.length === 0) {
          end = true;
        }

        chars.push($next);

        // ループ終了
        if ($next.hasClass(startOfLine)) {
          end = true;
        }

        $current = $next;
      }

      return chars;
    },

    // 再描画する
    update: ($rootElems, settings) => {
      $rootElems.each(function () {
        const $txt = $(this);
        const $chars = $txt.find(`.${settings.className.char}`);

        methods.makeBetagumi($txt, settings);
        methods.detectGyotouGyoumatsu($chars, settings);
      });
    },

    // ウィンドウリサイズを監視する
    watchResize: ($rootElems, settings) => {
      if (!settings.watchResize) return;
      let timer = null;
      $(window).on('resize', () => {
        timer = methods.checkTimer(timer, settings.watchDelay, () => {
          methods.update($rootElems, settings);
        });
      });
    },

    // 遅延タイマーをチェック
    checkTimer: (timer, delay, callback) => {
      if (timer !== null) {
        clearTimeout(timer);
      }

      return setTimeout(() => {
        callback();
      }, delay);
    }

  };

  Object.freeze(methods);

  // メソッドを公開
  $.fn.yakumono = function (options) {
    return methods.yakumono(this, options);
  };

  // デフォルトオプション
  $.fn.yakumono.defaults = {
    // 約物の分類辞書
    dict: {
      hajimekakko: /（|〔|「|『|［|【|〈|《|‘|“/,
      owarikakko:  /）|〕|」|』|］|】|〉|》|’|”/,
      nakaten: /・|：|；/,
      kuten:  /。|．/,
      touten: /、|，/,
      kugiri: /！|？/,
      hyphen: /‐|〜/,
      bunrikinshi: /…|‥|—/
    },

    // クラス名
    className: {
      separator: '--',
      betagumi: 'is-betagumi',
      betagumiCenter: 'is-betagumi-center',
      tsumegumi: 'is-tsumegumi',
      tategumi: 'is-tategumi',
      jisage: 'is-jisage',
      gyomatsuYakumonoHankaku: 'is-gyomatsu-yakumono-hankaku',
      char: 'js-char',
      yakumono: 'js-char-yakumono',
      startOfLine: 'is-start-of-line',
      endOfLine: 'is-end-of-line',
      oidashi: 'is-oidashi',
      oidashiSmall: 'is-oidashi-small',
      safari: 'is-safari'
    },

    // ブラウザがSafariの場合にポリフィルを有効にする
    polyfillSafari: true,

    // Safari用のポリフィルを強制的に有効にする
    safariMode: false,

    // 全角ハイフンをケイ線文字に置換する
    replaceDash: false,

    // リサイズ時に再計算する
    watchResize: true,

    // リサイズ監視の遅延時間
    watchDelay: 300,

    // 詳細な字間調整機能を利用する
    useLetterSpacingAdjustment: true,

    // 行末約物半角にする
    isGyomatsuYakumonoHankaku: true,

    // ベタ組みにする
    isBetagumi: true,

    // ベタ組みで左右の余りを余白で吸収する
    betagumiCenter: false,

    // ツメ組みにする
    isTsumegumi: false,

    // 段頭の字下げを有効にする
    useJisage: false,

    // 縦書きモード(実験的)
    isTategumi: false
  };

}));
