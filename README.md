# jquery.yakumono

任意のパターンにマッチする約物のアキを`font-feature-settings: "halt" 1`を使って調整します。

## デモ

http://codepen.io/hokkey/pen/zNzwQL

## 対応ブラウザ

* Chrome/Firefox
* Safariでは崩れます

##  デフォルトアキ量設定

以下のパターンの約物がアキ量なしになります。

* 始め括弧系
  * 始め括弧系・行頭時
  * 始め括弧系の後に始め括弧系
    * 「「
* 終わり括弧系
  * 終わり括弧系・行末時
  * 終わり括弧系の後に終わり括弧系
    * 」」
  * 終わり括弧系の後に始め括弧系
    * 」「
* 句点
  * 句点の後に始め括弧
    * 。「
  * 句点の後に終わり括弧
    * 。」
* 読点
  * 読点の後に終わり括弧
    * 。」
  * 読点・行末
  
## 実装

1. 要素幅を最も近い、em値の整数倍の幅へ補正(オプション) 
2. Blast.jsで1文字ごとに`<span>`要素へ分解
3. 約物辞書とマッチする要素へクラスを付与
4. 連続する約物にも特別なクラスを付与
5. 行頭・行末を検知して特別なクラスを付与
6. リサイズを監視し、必要に応じて再計算(オプション)
7. 付与したクラスに対して、CSSから`font-feature-settings: "halt" 1`を設定
  
## 依存ライブラリ
  
  * jQuery
  * [Blast.js](http://velocityjs.org/blast/)
  
## 使い方

```html
<p class="js-yakumono">「生きろ。」「生きねば。」と。</p>

<script src="https://code.jquery.com/jquery-3.1.1.min.js" integrity="sha256-hVVnYaiADRTO2PzUGmuLJr8BLUSjGIZsDYGmIJLv2b8=" crossorigin="anonymous"></script>
<script src="js/jquery.blast.min.js"></script>
<script src="js/jquery.yakumono.min.js"></script>
```

```js
$('.js-yakumono').yakumono({
 // リサイズ時に再計算する
 watchResize: true,
 // リサイズ監視の遅延時間
 watchDelay: 300,
 // em値の横幅を強制する
 forceEmBaseWidth: true
});
```

## 注意点

* テキスト以外の要素が含まれる構造では動作検証していません。仕組み上おそらく動作しません
* 縦組みには対応していません

## ライセンス

MIT
