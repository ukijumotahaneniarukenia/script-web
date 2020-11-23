初回

```
$ mkdir -p wrksp

$ cd wrksp

$ mkdir -p app

$ npm init -y

$ echo '/node_modules/* /.vscode/* /.git/*' | xargs -n1 >.gitignore

$ npm install express @types/express --save #ルーティングなどのWEB基盤

$ npm install ejs @types/ejs --save #VIEWレンダラテンプレートエンジン

$ npm install --save lodash @types/lodash #関数群

$ npm install multer @types/multer --save #ファイルアップロードに必要

$ npm install node-fetch @types/node-fetch --save #外部APIコール用

$ npm install --save uuid @types/uuid #ファイル保存時のファイル名に使用


デバッグに必要
ワークスペースフォルダはマウント時のルートフォルダ名
$ cat <<EOS >$HOME/.vscode/launch.json
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Launch Program",
            "skipFiles": [
                "<node_internals>/**"
            ],
            "program": "${workspaceFolder}/controller.js"
        }
    ]
}

EOS
```


コマンドライン上でサーブする

デフォルトポートでサーブ

```
$ node controller.js
```

コマンドライン引数で指定してサーブ

```
$ PORT=3333 node controller.js
```

コマンドエイリアス

```
npm start
```


２回目以降

```

$ mkdir -p wrksp

$ cd wrksp/

$ git clone https://github.com/ukijumotahaneniarukenia/node-debug-method.git

$ cd node-debug-method

$ npm ci
added 107 packages in 0.508s

$ npm start
```

