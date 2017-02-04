# jQuery.yakumono

![jQuery.yakumono](https://cloud.githubusercontent.com/assets/6197292/22620263/6a64512a-eb4b-11e6-9209-a1935ef4db14.png)

現在のWebブラウザに不足している日本語組版関係の機能を補完するjQueryプラグインです。

`「□□」・「□・□、」「（□□）」（「□□」）`などの約物が連続するパターンで、不要な約物のアキを調整できます。

* 約物・約物同士の前後関係を、HTMLクラスとして1文字単位で付与
* 文字組みアキ量の調整（`font-feature-settings: "halt" 1;`による実装）
* より美しいベタ組みの実現（常にemベースの横幅へ調整）
* より美しいツメ組みの実現（`font-feature-settings: "palt" 1;`による実装）

## サンプル画像

![](https://cloud.githubusercontent.com/assets/6197292/22620703/f9a5821a-eb54-11e6-9673-b7742f8af76d.png)

### ブラウザデフォルトの挙動(比較用)

![](https://cloud.githubusercontent.com/assets/6197292/22620712/237093dc-eb55-11e6-8aa7-cab89ab3eec6.png)

## ライブデモ

http://codepen.io/hokkey/pen/zNzwQL



## 対応ブラウザ

* 最新バージョンのChrome/Firefoxでのみ動作します

## 対応フォント

* Noto Sans JP
* 遊ゴシック
* ヒラギノ角ゴシックProN
* ヒラギノ明朝ProN

## 依存ライブラリ
  
  * jQuery
  * [Blast.js](http://velocityjs.org/blast/)
  
## 使い方

jQueryとblast.jsが必須です。

```
npm install --save-dev jquery blast-text
```

このプラグイン自体はまだnpmに登録されていません。GitHubから手動でダウンロードしてください。

```html
...
<link rel="stylesheet" href="css/jquery.yakumono.min.css"/>
</head>

<body>

<p class="js-yakumono">…</p>

</body>

<script src="https://code.jquery.com/jquery-3.1.1.min.js"></script>
<script src="js/jquery.blast.min.js"></script>
<script src="js/jquery.yakumono.min.js"></script>

<script>
$('.js-yakumono').yakumono({
 // 全角ハイフンをケイ線文字に置換する
 replaceDash: false,

 // リサイズ時に行末・行頭を再計算する
 watchResize: true,

 // ベタ組みにする
 isBetagumi: true,

 // ベタ組み時の左右の余りを、margin: auto;で吸収する
 betagumiCenter: false,

 // ツメ組みにする
 isTsumegumi: false
});
</script>

</body>
```

## 注意点

* 対象となるセレクタの内部に入れ子になった要素内の文字列も、処理の対象になります
* フォントサイズがブラウザの内部的に小数点を含むpx値の場合、ベタ組み時の横幅の計算がうまくいかないバグがあります

## 約物の分類

デフォルトで、一般的な約物の分類が設定済みです。

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

初期化時に独自の設定を渡すこともできます。

```js
$('.js-yakumono').yakumono({
 dict: {
   kome: /※/
 },
});

```

## 約物アキ量設定

プラグインが文字を1文字づつspan要素で分解し、前後の約物との関係性も含めてHTMLクラス名として付与します。
クラス名のデフォルトのルールは次の通りです。

1. 文字一般：`.js-char`
2. 約物：`.js-char--yakumono`
3. 前の文字が〜な約物：`.js-char--yakumono--after--〜`
4. 次の文字が〜な約物：`.js-char--yakumono--before--〜`
5. 行頭文字：`.is-start-of-line`
6. 行末文字：`.is-end-of-line`

このクラス名を手がかりに、アキ量を変更したいパターンをCSSで定義します。

### デフォルトのアキ量設定：

```scss
// 行末約物半角
.js-char--yakumono.is-end-of-line {
  @include yakumono-aki-nashi();
}

// 始め括弧系
.js-char--yakumono--hajimekakko {
  // 始め括弧系・行頭
  &.is-start-of-line,
  // 始め括弧系の後に始め括弧系
  // 「「 , 「（ , （「
  &.js-char--yakumono--after--hajimekakko {
    @include yakumono-aki-nashi();
  }
}

// 終わり括弧系
.js-char--yakumono--owarikakko {
  // 終わり括弧系の後に終わり括弧系
  // 」」, ）」 ,  」）
  &.js-char--yakumono--before--owarikakko,
  // 終わり括弧系の後に始め括弧系
  // 」「 ,  ）「  ,  」（
  &.js-char--yakumono--before--hajimekakko {
    @include yakumono-aki-nashi();
  }
}

// 句点
.js-char--yakumono--kuten {
  // 句点の後に始め括弧
  // 。「
  &.js-char--yakumono--before--hajimekakko,
  // 句点の後に終わり括弧
  // 。」
  &.js-char--yakumono--before--owarikakko {
    @include yakumono-aki-nashi();
  }
}

// 読点
.js-char--yakumono--touten {
  // 読点の後に始め括弧
  // 、「
  &.js-char--yakumono--before--hajimekakko,
  // 読点の後に終わり括弧
  // 、」
  &.js-char--yakumono--before--owarikakko {
    @include yakumono-aki-nashi();
  }
}

// 中点
.js-char--yakumono--nakaten {
  // 終わり括弧類 + 中点 + 始め括弧類
  // 」・「 , ）・（
  &.js-char--yakumono--after--owarikakko.js-char--yakumono--before--hajimekakko {
    @include yakumono-aki-nashi();
  }
}
```
  
## ライセンス

MIT
