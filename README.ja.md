# Voice Cleaner / 音声ノイズ軽減

[![GitHub Pages](https://github.com/ttomohisa/htmlapps-voice-cleaner/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/ttomohisa/htmlapps-voice-cleaner/actions/workflows/deploy-pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Single HTML](https://img.shields.io/badge/distribution-single%20HTML-0ea5e9)](https://ttomohisa.github.io/htmlapps-voice-cleaner/)

[English README](README.md)

Voice Cleanerは、**録音された声の背景ノイズをブラウザ内で軽減**するツールです。音声・動画から取り出した音声やマイク録音を処理し、元の音声と聞き比べてWAVで保存できます。ファイルをサーバーへアップロードする必要はありません。

## デモ

### [GitHub PagesでVoice Cleanerを開く](https://ttomohisa.github.io/htmlapps-voice-cleaner/)

GitHub Pagesで公開されたHTMLを開けば、登録・インストールなしで利用できます。音声・動画ファイル、マイク録音、処理結果は端末内だけで扱われ、サーバーへアップロードしません。

**公開状況:** GitHub Pagesが未設定、または `main` へのデプロイが完了していない場合、上のURLはまだ開けません。公開状況は[GitHub PagesのActions](https://github.com/ttomohisa/htmlapps-voice-cleaner/actions/workflows/deploy-pages.yml)で確認できます。

[![音声を読み込んだVoice Cleanerの画面](assets/screenshot.png)](https://ttomohisa.github.io/htmlapps-voice-cleaner/)

[スマートフォン画面のスクリーンショット](assets/screenshot-mobile.png)

## 主な機能

- **背景ノイズを軽減** — GTCRNをWebAssemblyで実行し、エアコン・ファン・サー音などが混じった会話・録音の聞き取りやすさを改善します。効果は録音内容によって異なります。
- **音声・動画を読み込む** — WAV、MP3、M4A、AAC、OGG、WebM、MP4などを選択またはドラッグ＆ドロップできます。実際の読み込み可否はブラウザのデコーダーに依存します。
- **マイクから録音** — ブラウザの権限を許可すると、その場で録音してノイズを軽減できます。リアルタイム通話の音声を加工する機能ではありません。
- **10秒だけ試せる** — 波形上で開始位置を選び、全体を処理する前に短い範囲で効果を確認できます。
- **Before / Afterを比較** — 元の音声と処理後を同じ再生位置で切り替えられます。波形上のシークバーはクリック・タップ・ドラッグに対応し、処理前後の再生位置が連動します。
- **WAVで保存** — 全体処理後に保存名を変更して、16 kHz・モノラル・16-bit PCM WAVとして書き出します。
- **端末内で完結** — AIモデルと実行コードを単一HTMLに内包。日本語／英語UI、PC／スマートフォンに対応します。

## すぐに使う

### Webで使う

[GitHub Pages版Voice Cleaner](https://ttomohisa.github.io/htmlapps-voice-cleaner/)が公開されていれば、そのまま開いて音声・動画を選択できます。インストールやユーザー登録は不要です。まだ公開されていない場合は、以下の単一HTML版を利用できます。

### 単一HTMLを使う

ビルド済みファイルを入手した場合は、`voice-cleaner.html` または `dist/index.html` をブラウザで開きます。単一HTMLには処理に必要なJavaScript・WebAssembly・モデルが内包されています。オフラインでもファイルの読み込みと処理ができます。

このリポジトリの[Actions](https://github.com/ttomohisa/htmlapps-voice-cleaner/actions/workflows/build-standalone.yml)で成功したビルドの成果物にも配布用HTMLが含まれます（ダウンロードにはGitHubへのサインインが必要な場合があります）。ソースの `src/index.template.html` をそのまま開くのではなく、生成済みHTMLを使用してください。

### 自分でビルドする（Windows）

1. このリポジトリをクローンまたはZIPでダウンロードします。
2. `build-standalone.bat` を実行します。
3. 初回は、`dependencies.json` でバージョン固定された依存パッケージを取得します。
4. 生成された `voice-cleaner.html` または `dist/index.html` を任意の場所へコピーします。
5. その後は、配布用HTMLをインターネット接続なしで開けます。

通常のHTML生成にPythonやNode.jsは必要ありません。Windows PowerShellと `tar.exe` を利用します。マイク録音だけは、ブラウザによって `file://` で利用できない場合があります。

## 使い方

1. **音声を選ぶ** — 音声・動画ファイルをドラッグ＆ドロップするか、「ファイルを選択」から読み込みます。対応ブラウザならマイクでの録音も選べます。
2. **位置を決める** — 波形をクリック・タップ・ドラッグして再生位置を移動します。通常の音声プレイヤーからも移動できます。
3. **10秒試す** — 「現在位置から10秒試す」を押し、処理前後を聞き比べます。
4. **全体を処理する** — 効果を確認できたら「ファイル全体をきれいにする」を押します。処理中は進捗が表示され、キャンセルできます。
5. **聞き比べて保存** — 「元の音声」「処理後」を切り替えます。2本の結果波形は同じ再生位置へ連動します。ファイル名を編集し、「WAVで保存」を押します。

10秒プレビューは試聴用です。**WAV保存はファイル全体の処理後**に利用できます。ノイズ低減の強度調整はなく、GTCRNによる一定の処理を行います。

音声・録音・処理結果は現在のタブだけに保持され、自動保存されません。閉じる前に必要な全体処理結果をWAVで保存してください。再処理では既存結果に「前回の結果」を表示し、中止・失敗でも保持します。全体処理後にプレビューを作っても、前回の全体WAVは保存でき、保存対象をプレビューと区別して表示します。「保存を開始しました」は端末への書き込み完了を保証しません。

音声の置き換えは新しいファイルの読み込み確認後に確認画面を表示します。キャンセル・読み込み失敗では現在の音声・結果・ファイル名を保持します。確定するとタブ内の音声と結果を置き換え、元に戻せません。元ファイル・ダウンロード済みWAVは削除しません。

スマートフォン下部の「音声」は入力へ移動し、「全体を処理」「WAVを保存」は処理を実行します。ページタブではありません。保存ボタンはPC・スマートフォンとも同じ全体結果と編集したファイル名を使います。

言語はURLの `?lang=ja/en`、同じサイトの共通設定、従来のツール設定、ブラウザーの対応言語、英語の順で選びます。明示的な切替だけを共通設定に保存し、音声や処理は保持します。別サイト間・単体 `file://` 間の共有は保証しません。

### 波形の操作

| 操作 | 動作 |
| --- | --- |
| 波形をクリック／タップ | その位置へシーク |
| 波形上をドラッグ | 再生位置を移動 |
| フォーカス中に `←` / `→` | シーク位置を微調整 |
| フォーカス中に `Home` / `End` | 先頭／末尾へ移動 |
| Before / Afterの波形を操作 | 両方の再生位置を同期 |

スマートフォンでは下部の「音声」「全体を処理」「WAVを保存」から主要操作へアクセスできます。保存ボタンは、全体の処理結果ができるまで無効です。

## 単一HTMLとオフライン利用

ビルド時に、固定された `@sapphi-red/gtcrn-wasm` のJavaScript・WASM（GTCRNのモデルを内包）をHTMLへ埋め込みます。ブラウザ内でのGTCRN推論はWeb Workerで実行します。

生成される主なファイルは次のとおりです。

| ファイル | 用途 |
| --- | --- |
| `voice-cleaner.html` | リポジトリ直下に生成される読みやすい単一HTML |
| `dist/index.html` | 配布用の単一HTML（直下のHTMLと同一内容） |
| `dist/index.self-extract.html` | gzip圧縮したHTMLを開くときに展開する小型の単一HTML |
| `dist/dependency-manifest.json` | ビルドで内包した依存資産の情報 |
| `dist/build-size-report.json` | 生成物サイズのレポート |

自己展開版には `DecompressionStream` に対応するブラウザが必要です。マイク権限などのブラウザ制約は、単一HTMLでも適用されます。

## GitHub Pagesで公開する

リポジトリには、`main` へのプッシュ時にビルド・検証し、GitHub Pagesが有効ならデプロイするワークフローがあります。

1. リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** に設定します。
2. `main` に変更を反映するか、[Deploy standalone app to GitHub Pages](https://github.com/ttomohisa/htmlapps-voice-cleaner/actions/workflows/deploy-pages.yml) を手動実行します。
3. GitHub Actionsのデプロイ結果で公開URLを確認します。

公開先は[https://ttomohisa.github.io/htmlapps-voice-cleaner/](https://ttomohisa.github.io/htmlapps-voice-cleaner/)を想定しています。PR内の変更は `main` へマージされるまでGitHub Pagesには反映されません。公開設定とデプロイが完了するまでは、上記URLが利用できない場合があります。

## 開発とビルド

```text
.
├─ assets/favicon.svg              # ヘッダー／favicon共通の正規SVG
├─ src/index.template.html         # 編集するアプリ本体
├─ app.config.json                 # アプリ名・バージョン・出力設定
├─ dependencies.json               # 依存ライブラリと内包対象
├─ dependencies.lock.json          # npm tarballのSHA-256ロック
├─ build-standalone.bat            # Windows用のビルド入口
├─ build-standalone.ps1            # 単一HTML生成
├─ scripts/check-repository.ps1    # リポジトリ／生成物の検査
├─ scripts/smoke-browser.cjs       # 実ブラウザでのGTCRN・WAV保存テスト
├─ .github/workflows/             # ビルド・公開・PR Preview
└─ dist/                           # 生成物（ビルド後）
```

リポジトリ全体の確認では、PowerShell構文検査を先に実行してから、リポジトリ検査を行います。

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-powershell-syntax.ps1
pwsh -NoProfile -File .\scripts\check-repository.ps1
```

依存パッケージの更新は `scripts/update-dependency.ps1` で管理します。新しい依存はバージョンを固定し、`dependencies.lock.json` のSHA-256を更新・照合してからビルドします。自動更新の検出だけでは実際の依存バージョンを書き換えません。

CIでは、単一HTMLおよび自己展開HTMLの生成、アイコンの一致、CSP、依存ロック、未置換プレースホルダーに加え、ブラウザでのGTCRN推論とWAV保存を検証します。

## プライバシーと外部通信

- **録音データはアップロードしません。** 読み込んだファイル・マイクの入力・処理後音声はブラウザ内で取り扱います。
- **処理時に外部AI APIを呼び出しません。** 推論に必要なコード・モデルはHTML内にあります。
- **`connect-src 'none'`** を含むContent Security Policyを設定し、アプリからの通常の外部ネットワーク接続を禁止しています。
- Web版では最初のHTMLを配信するための通信が発生します。オフラインで使いたい場合は、生成済みHTMLをローカルで開いてください。

## 制限事項

- 主に**声の背景ノイズ低減**を対象とし、他人の声・音楽・強い反響・突発音を完全に消すものではありません。
- **16 kHz・モノラル・16-bit PCM WAV**へ変換します。元のステレオ音場・サンプリングレート・圧縮形式は保持しません。
- 動画を入力できても、**映像付きファイルの書き戻しには非対応**です。保存は音声のみのWAVです。
- MP3・M4A・MP4などの対応状況はブラウザのデコード機能によって異なります。
- 1ファイルあたりの上限は**250 MB**、音声の長さは**60分まで**です。上限内でも端末の処理速度・空きメモリにより処理できない場合があります。
- マイク録音には権限が必要です。`file://` では使用できないブラウザがあるため、必要ならHTTPSまたはlocalhostで利用してください。
- リアルタイムのマイク音声処理、複数話者の分離、MP3/M4A形式での書き出しには対応していません。

## 使用ライブラリ

| ライブラリ・モデル | バージョン | ライセンス | 用途 |
| --- | --- | --- | --- |
| [@sapphi-red/gtcrn-wasm](https://github.com/sapphi-red/gtcrn-wasm) | 0.0.3 | MIT | GTCRNをWebAssemblyで実行 |
| [GTCRN](https://github.com/Xiaobin-Rong/gtcrn) | 上記WASMに内包 | MIT | 声の背景ノイズ低減 |
| [PFFFT](https://github.com/marton78/pffft) | 上記WASMに含まれる実装 | 個別の再配布条件 | 音声信号のFFT処理 |

GTCRNの実行時にONNX Runtimeの追加ダウンロードは必要ありません。ライセンスの詳細は [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) を参照してください。

## コントリビューション

バグ報告・機能提案は [GitHub Issues](https://github.com/ttomohisa/htmlapps-voice-cleaner/issues) からお願いします。開発上の注意事項は [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

## ライセンス

Copyright © 2026 ttomohisa

このアプリは [MIT License](LICENSE) で公開しています。内包する外部ライブラリにはそれぞれのライセンス条件が適用されます。

### 共通UIの開発検証

BrowserKittyUI 1.0.0を `components/` に同梱し、`scripts/embed-ui-conventions.ps1` がハッシュを確認してHTMLに埋め込みます。`scripts/check-repository.ps1` はNode.jsで `node --test tests/*.test.cjs` を実行してからビルドします。単体HTMLのビルダー自体にはNode.jsは不要です。音声の実再生・キーボード・スマートフォンなどの人手検証項目は `APP_SPEC.md` を参照してください。
