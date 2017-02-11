/*!
  jQuery.yakumono (0.2.0) github.com/hokkey/jquery.yakumono
  (C) 2017 Yuma Hori.
  MIT @license: en.wikipedia.org/wiki/MIT_License
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

      $elems.each(function () {
        methods.init($(this), settings);
      });

      methods.watchResize($elems, settings);

      return $elems;
    },

    // 初期化処理
    init: ($elem, settings) => {

      methods.replaceDash($elem, settings);

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
      methods.detectGyotouGyomatsu($chars, settings);

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
      if(settings.isTsumegumi !== true) {
        return;
      }

      $elem.addClass(settings.className.tsumegumi);
    },

    // 字下げクラスを付与
    makeJisage: ($elem, settings) => {
      if(settings.useJisage !== true) {
        return;
      }

      $elem.addClass(settings.className.jisage);
    },

    // 縦組みクラスを付与
    makeTategumi: ($elem, settings) => {
      if(settings.isTategumi !== true) {
        return;
      }

      $elem.addClass(settings.className.tategumi);
    },

    // タテ組みクラスを付与
    makeTategumi: ($elem, settings) => {
      if(settings.isTategumi !== true) {
        return;
      }

      $elem.addClass(settings.className.tategumi);
    },

    // ベタ組みレイアウトを適用
    makeBetagumi: ($elem, settings) => {
      if (settings.isBetagumi !== true) {
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
          $char.addClass(`${settings.className.yakumono} ${settings.className.yakumono}--${yakumonoType}`);
          return;
        }
      }
    },

    // 約物の前後関係を判定
    detectYakumonoContext($chars, settings) {
      let $previous = null;

      $chars.each(function () {
        $previous = methods.setYakumonoContextClass($previous, $(this), settings);
      });
    },

    // 前後の要素から約物クラスを付与する
    setYakumonoContextClass($previous, $current, settings) {
      if ($previous === null || !$previous.hasClass(`${settings.className.yakumono}`)) {
        return $current;
      }

      for (const type in settings.dict) {
        if ($current.hasClass(`${settings.className.yakumono}--${type}`)) {
          $previous.addClass(`${settings.className.yakumono}--before--${type}`);
        }
        if ($previous.hasClass(`${settings.className.yakumono}--${type}`)) {
          $current.addClass(`${settings.className.yakumono}--after--${type}`);
        }
      }

      return $current;
    },

    // 行頭・行末を判定
    detectGyotouGyomatsu($chars, settings) {
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
        .removeClass(`${settings.className.startOfLine} ${settings.className.endOfLine} ${settings.className.oidashi}`)
        .each(function (index) {
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

            // 1文字手前は行末
            $previous.addClass(settings.className.endOfLine);
            const actualOffset = getOffset($current);

            // クラス付与により前の行に追い込まれなかった場合は次の文字を行頭として判定
            if (actualOffset === currentOffset) {
              $current.addClass(settings.className.startOfLine);
            }

            // 追いこまれてしまった場合はキャンセルし、この文字を行末として再判定
            else {
              $previous.removeClass(settings.className.endOfLine);
              $current.addClass(settings.className.endOfLine);
            }
          }

          previousOffset = currentOffset;
          $previous = $current;
        })
      ;
    },

    // 再描画する
    update:($rootElems, settings) => {
      $rootElems.each(function () {
        const $txt = $(this);
        const $chars = $txt.find(`.${settings.className.char}`);

        methods.makeBetagumi($txt, settings);
        methods.detectGyotouGyomatsu($chars, settings);
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
      betagumi: 'is-betagumi',
      betagumiCenter: 'is-betagumi-center',
      tsumegumi: 'is-tsumegumi',
      tategumi: 'is-tategumi',
      jisage: 'is-jisage',
      char: 'js-char',
      yakumono: 'js-char--yakumono',
      startOfLine: 'is-start-of-line',
      endOfLine: 'is-end-of-line',
    },

    // 全角ハイフンをケイ線文字に置換する
    replaceDash: false,

    // リサイズ時に再計算する
    watchResize: true,

    // リサイズ監視の遅延時間
    watchDelay: 300,

    // ベタ組みにする
    isBetagumi: false,

    // ベタ組みで左右の余りを余白で吸収する
    betagumiCenter: false,

    // ツメ組みにする
    isTsumegumi: false,

    // 段頭の字下げを有効にする
    useJisage: false,

    // 縦書きモード
    isTategumi: false
  };

}));
