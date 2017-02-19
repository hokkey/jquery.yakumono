# jQuery.yakumono

![jQuery.yakumono](https://cloud.githubusercontent.com/assets/6197292/23058600/1dff15ac-f539-11e6-8c71-eaabfe263b9a.png)

[![Build Status](https://travis-ci.org/hokkey/jquery.yakumono.svg?branch=master)](https://travis-ci.org/hokkey/jquery.yakumono)

`font-feature-settings`の機能を使い、現在のWebブラウザに不足している日本語組版関係の機能を補完するjQueryプラグインです。

`「□□」・「□・□、」「（□□）」（「□□」）`などの約物が連続するパターンで不要な約物のアキを調整し、より美しい組版を実現します。
 
## スクリーンショット

### PC(Chrome)

![pc](https://cloud.githubusercontent.com/assets/6197292/22856674/a591e436-f0d9-11e6-8bc3-0e314d1904bf.png)

### Mobile Safari(iOS10)

![sp](https://cloud.githubusercontent.com/assets/6197292/22856675/a6457fc8-f0d9-11e6-9429-31f8c1d9c957.PNG)

## ライブデモ

http://codepen.io/hokkey/pen/zNzwQL

## 主な機能

* 約物アキ量調整（`font-feature-settings: "halt" 1;`による実装）
* プロポーショナルメトリクス（`font-feature-settings: "palt" 1;`による実装）
* 行末と行頭の判定
* 行末約物半角
* 行末のアキを字間の調整で吸収
* リキッドレイアウト対応
* 実験的な縦組みへの対応
  * `font-feature-settings: "vhal" 1`による実装
* その他
  * 常にemベースの横幅へテキストエリアの横幅を調整する機能
  * 二連続する全角ダーシをケイ線文字に置換し、ダーシの隙間をなくす機能
  * Safariの不完全な実装へのポリフィル

## 対応ブラウザ

ブラウザ側のOpenType機能の(`font-feature-setttings`)の実装に大きく依存します。

* Chrome
* Firefox
* Safari
  * 実装に一部バグが有りますが、ポリフィルで対応しています
  
※縦書きモードは動作未検証。

## 対応フォント

* Noto Sans JP
* 遊ゴシック
* ヒラギノ角ゴシック
* ヒラギノ明朝

## 注意点と既知の問題

* 対象となるセレクタの内部に入れ子になった要素内の文字列も処理の対象になります
* 対象となるセレタクの内部に文字以外のコンテンツがある場合、予期しないレイアウトの崩れが発生する可能性あります
* フォントサイズが小数点を含むpx値の場合、ベタ組み時の横幅の計算がうまくいかないバグがあります
* 縦組みモードは実験的なオプションです

## 依存ライブラリ
  
* jQuery
* [Blast.js](http://velocityjs.org/blast/)
  
## インストール

jQueryとblast.jsが必須です。jQuery.yakumonoはrequireに対応していますが、依存するblast.jsはrequireに対応していません。

```
npm install --save-dev jquery.yakumono jquery blast-text
```

## 使い方とオプション

デフォルトのオプションではベタ組みが適用されます。


```html
...
<link rel="stylesheet" href="css/jquery.yakumono.min.css"/>
</head>
<body>

<div class="js-yakumono"><p>ここに本文を入力</p></div>

<script src="https://code.jquery.com/jquery-3.1.1.min.js"></script>
<script src="js/jquery.blast.min.js"></script>
<script src="js/jquery.yakumono.min.js"></script>

<script>
$('.js-yakumono').yakumono({
   // ブラウザがSafariの場合にポリフィルを有効にする
   polyfillSafari: true,

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
  
   // ツメ組みにする (ベタ組みは無効化されます)
   isTsumegumi: false,
  
   // 段頭の字下げを有効にする
   useJisage: false,
  
   // 縦書きモード(実験的)
   isTategumi: false
});
</script>

</body>
```

## 約物アキ量設定

プラグインが文字を1文字づつspan要素で分解し、前後の約物との関係性も含めてHTMLクラス名として付与します。
クラス名のデフォルトのルールは次の通りです。

1. 文字一般：`.js-char`
2. 約物：`.js-char-yakumono`
3. 前の文字が〜な約物：`.js-char-yakumono--after--〜`
4. 次の文字が〜な約物：`.js-char-yakumono--before--〜`
5. 行頭文字：`.is-start-of-line`
6. 行末文字：`.is-end-of-line`

これらのクラス名を手がかりに、アキ量を変更したいパターンをCSSで定義します。

### 約物の分類

デフォルトで一般的な約物の分類が設定済みです。

```js
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
````

初期化時に独自の設定を追加できます。

```js
$('.js-yakumono').yakumono({
 dict: {
   kome: /※/,
   kansuji: /一|二|三|四|五|六|七|八|九|十|〇/
 },
});
````

### デフォルトのアキ量設定

* 次のときに約物が二分幅(アキなし)になります
  * 行末の終わり括弧類・句点類・読点類・中点類
  * 行頭の始め括弧類
  * 連続する始め括弧類・終わり括弧類
  * 直後に終わり括弧類が来る始め括弧類
  * 直後に始め／終わり括弧類が来る句点／読点類
  * 終わり括弧類と始め括弧類に挟まれた中点類  
* これらのパターン以外はブラウザデフォルトの全角幅(二分アキ)になります

```scss
// 行末約物半角
.js-yakumono.is-gyomatsu-yakumono-hankaku {
  .js-char-yakumono--owarikakko,
  .js-char-yakumono--kuten,
  .js-char-yakumono--touten,
  .js-char-yakumono--nakaten {
    &.is-end-of-line {
      @include yakumono-aki-nashi();
    }
  }
}

// 始め括弧系
.js-char-yakumono--hajimekakko {
  // 始め括弧系・行頭
  &.is-start-of-line,
  // 始め括弧系の後に始め括弧系
  // 「「 , 「（ , （「
  &.js-char-yakumono--after--hajimekakko {
    @include yakumono-aki-nashi();

    // Safari用ポリフィル
    .is-safari & {
      // 半角ずらす
      position: relative;
      left: -.5em;
    }
  }
}

// 終わり括弧系
.js-char-yakumono--owarikakko {
  // 終わり括弧系の後に終わり括弧系
  // 」」, ）」 ,  」）
  &.js-char-yakumono--before--owarikakko,
  // 終わり括弧系の後に始め括弧系
  // 」「 ,  ）「  ,  」（
  &.js-char-yakumono--before--hajimekakko {
    @include yakumono-aki-nashi();
  }
}

// 句点
.js-char-yakumono--kuten {
  // 句点の後に始め括弧
  // 。「
  &.js-char-yakumono--before--hajimekakko,
  // 句点の後に終わり括弧
  // 。」
  &.js-char-yakumono--before--owarikakko {
    @include yakumono-aki-nashi();
  }
}

// 読点
.js-char-yakumono--touten {
  // 読点の後に始め括弧
  // 、「
  &.js-char-yakumono--before--hajimekakko,
  // 読点の後に終わり括弧
  // 、」
  &.js-char-yakumono--before--owarikakko {
    @include yakumono-aki-nashi();
  }
}

// 中点
.js-char-yakumono--nakaten {
  // 終わり括弧類 + 中点 + 始め括弧類
  // 」・「 , ）・（
  &.js-char-yakumono--after--owarikakko.js-char-yakumono--before--hajimekakko {
    @include yakumono-aki-nashi();

    // Safari用ポリフィル
    .is-safari & {
      position: relative;
      left: -.25em;
    }
  }
}
```

## 開発方法

ビルド処理の一部に[frontplate-cli](https://www.npmjs.com/package/frontplate-cli)への依存があります。

```
npm i -g frontplate-cli
git clone https://github.com/hokkey/jquery.yakumono.git
npm i

# 開発用ビルド
npm run build

# リリース用ビルド
npm run production
```

## 作者について

http://media-massage.net/profile/
  
## ライセンス

MIT License
