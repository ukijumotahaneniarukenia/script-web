const fetch = require('node-fetch'); //外部APIコール時に使用
const express = require('express'); //webルーティングに必要
const app = express();
const _ = require('lodash'); //便利関数群
const path = require('path');
const fs = require('fs');
const uuid = require('uuid'); //ファイル保存時のファイルに使用

const bodyParser = require('body-parser'); //ポストデータ処理時はこのライブラリが必要
app.use(
    bodyParser.urlencoded({
        extended: true, //ポストデータをエンコーディング
    })
);
app.use(bodyParser.json()); //ポストデータをJSON形式で受け取る


const multer = require('multer'); //ファイルアップロード時に必要
const uploadDirectoryRootName = 'upload-files';
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDirectoryRootName); //アップロードディレクトリ
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); //アップロードファイル名をポストデータの内容から取得して設定
    },
});
const uploadDirectory = multer({ storage: storage }); //ストレージ情報を引数に渡して初期化


const saveDirectoryRootName = 'save-files';

const downloadDirectoryRootName = uploadDirectoryRootName; //アップロードしたファイルをダウンロードできるように設定

const defaultServePort = 8080;
app.set('port', process.env.PORT || defaultServePort); //コマンドライン引数で指定しない限り、デフォルトポートでサーブ

//ダウンロードできるように公開ディレクトリを設定
//https://stackoverflow.com/questions/49743559/linking-a-file-for-download-in-node-javascript-ejs
//https://expressjs.com/en/starter/static-files.html
app.use('/' + uploadDirectoryRootName, express.static(uploadDirectoryRootName));
app.use('/' + saveDirectoryRootName, express.static(saveDirectoryRootName));

function writeFile(path, data) {
    fs.writeFile(path, data, function (err) {
        if (err) {
            throw err;
        }
    });
}

function traverseDir(dir, fileList) {
    fs.readdirSync(dir).forEach((file) => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            traverseDir(fullPath, fileList);
        } else {
            fileList.push(fullPath);
        }
    });
    return fileList;
}

function str2num(s) {
    return parseInt(s, 10);
}

let userDataList = [
    { id: 1, name: 'ぽるこ', role: 'ぶた' },
    { id: 2, name: 'まるこ', role: 'ぶた' },
    { id: 3, name: 'ジーナ', role: '恋人' },
];

const apiEntryListFileName = 'api-entry-list.json';

let apiDataList = JSON.parse(fs.readFileSync(apiEntryListFileName,  {encoding: 'utf-8'}));

// ejsをビューに使う為の設定
// テンプレートエンジン一覧
// https://colorlib.com/wp/top-templating-engines-for-javascript/
app.set('view engine', 'ejs');

app.get('/home', function (req, res) {
    // 第一引数にviewsフォルダを起点とした、ejsファイルの拡張子を覗いたファイル名を指定する
    // 第二引数にejsファイルで使用しているプレースホルダの値をkey-value形式で設定する

    // renderは一つのエントリURLに対して一回のみ使えるので、複数件バインドしたい場合はオブジェクトにくるんでVIEWに渡す
    res.render('home');
});

app.get('/userListUp', function (req, res) {
    // 第一引数にviewsフォルダを起点とした、ejsファイルの拡張子を覗いたファイル名を指定する
    // 第二引数にejsファイルで使用しているプレースホルダの値をkey-value形式で設定する

    // renderは一つのエントリURLに対して一回のみ使えるので、複数件バインドしたい場合はオブジェクトにくるんでVIEWに渡す
    res.render('userListUp', {
        items: userDataList,
        message: 'registered user list',
    });
});

app.get('/userCreate', function (req, res) {
    // 第一引数にviewsフォルダを起点とした、ejsファイルの拡張子を覗いたファイル名を指定する
    // 第二引数にejsファイルで使用しているプレースホルダの値をkey-value形式で設定する

    // renderは一つのエントリURLに対して一回のみ使えるので、複数件バインドしたい場合はオブジェクトにくるんでVIEWに渡す
    res.render('userCreate');
});

app.post('/execUserCreate', function (req, res) {
    // 第一引数にviewsフォルダを起点とした、ejsファイルの拡張子を覗いたファイル名を指定する
    // 第二引数にejsファイルで使用しているプレースホルダの値をkey-value形式で設定する

    let postData = req.body;

    let entryHaveMaxId;

    if (userDataList.length == 0) {
        entryHaveMaxId = 0;
    } else {
        entryHaveMaxId = _.maxBy(userDataList, function (entry) {
            return entry.id;
        }).id;
    }

    postData['id'] = entryHaveMaxId + 1;

    userDataList.push(postData);

    // renderは一つのエントリURLに対して一回のみ使えるので、複数件バインドしたい場合はオブジェクトにくるんでVIEWに渡す
    res.render('notifySuccess', {
        pageName: 'ユーザー登録完了',
        message: 'success create user',
    });
});

app.get('/userDelete', function (req, res) {
    // 第一引数にviewsフォルダを起点とした、ejsファイルの拡張子を覗いたファイル名を指定する
    // 第二引数にejsファイルで使用しているプレースホルダの値をkey-value形式で設定する

    // renderは一つのエントリURLに対して一回のみ使えるので、複数件バインドしたい場合はオブジェクトにくるんでVIEWに渡す
    res.render('userDelete', {
        items: userDataList,
        message: 'enable delete user list',
    });
});

app.post('/execUserDelete', function (req, res) {
    // 第一引数にviewsフォルダを起点とした、ejsファイルの拡張子を覗いたファイル名を指定する
    // 第二引数にejsファイルで使用しているプレースホルダの値をkey-value形式で設定する

    // renderは一つのエントリURLに対して一回のみ使えるので、複数件バインドしたい場合はオブジェクトにくるんでVIEWに渡す

    console.log(req.body); //{id: Array(2)}

    let postData = req.body;

    if (Object.keys(postData).length == 0) {
        return res.render('notifyWarning', {
            pageName: 'not exists target to remove',
            message: '削除対象がありません',
        });
    }

    if (postData.id.length == 1) {
        // 単一削除

        //https://lodash.com/docs/4.17.15#remove
        let restData = _.remove(userDataList, function (entry) {
            return entry.id != parseInt(postData.id, 10);
        });

        userDataList = restData;

        console.log(userDataList);
    } else {
        // 複数削除

        //https://lodash.com/docs/4.17.15#map
        postData.id = _.map(postData.id, str2num);

        let restData = userDataList;

        //https://lodash.com/docs/4.17.15#forEach
        _.forEach(postData.id, function (targetId) {
            restData = _.remove(restData, function (entry) {
                return entry.id != targetId;
            });
        });

        userDataList = restData;

        console.log(userDataList);
    }

    res.render('notifySuccess', {
        pageName: 'ユーザー削除完了',
        message: 'success remove user',
    });
});

app.get('/fileUpload', function (req, res) {
    // 第一引数にviewsフォルダを起点とした、ejsファイルの拡張子を覗いたファイル名を指定する
    // 第二引数にejsファイルで使用しているプレースホルダの値をkey-value形式で設定する

    // renderは一つのエントリURLに対して一回のみ使えるので、複数件バインドしたい場合はオブジェクトにくるんでVIEWに渡す
    res.render('fileUpload');
});

app.post('/execFileUpload', uploadDirectory.single('file'), function (
    req,
    res
) {
    // 第一引数にviewsフォルダを起点とした、ejsファイルの拡張子を覗いたファイル名を指定する
    // 第二引数にejsファイルで使用しているプレースホルダの値をkey-value形式で設定する

    // renderは一つのエントリURLに対して一回のみ使えるので、複数件バインドしたい場合はオブジェクトにくるんでVIEWに渡す
    res.render('notifySuccess', {
        pageName: 'アップロード完了',
        message: 'success upload',
    });
});

app.get('/fileDownload', function (req, res) {
    // 第一引数にviewsフォルダを起点とした、ejsファイルの拡張子を覗いたファイル名を指定する
    // 第二引数にejsファイルで使用しているプレースホルダの値をkey-value形式で設定する

    //アップロードディレクトリからファイルの一覧を取得する

    let fullPathFileNameList = traverseDir(downloadDirectoryRootName, []);

    let fileInfoList = _.map(fullPathFileNameList, function (fullPathFileName) {
        let fileNameChunkList = fullPathFileName.split('/');

        let dateTime = new Date(fs.statSync(fullPathFileName).mtimeMs);
        return {
            fullPathFileName: fullPathFileName,
            lastUpdateDate: dateTime.toLocaleDateString(),
            lastUpdateTime: dateTime.toLocaleTimeString(),
            fileSize: fs.statSync(fullPathFileName).size,
            fileName: fileNameChunkList[fileNameChunkList.length - 1],
        };
    });

    // renderは一つのエントリURLに対して一回のみ使えるので、複数件バインドしたい場合はオブジェクトにくるんでVIEWに渡す
    res.render('fileDownload', {
        items: fileInfoList,
    });
});

app.get('/movieListUp', function (req, res) {
    // 第一引数にviewsフォルダを起点とした、ejsファイルの拡張子を覗いたファイル名を指定する
    // 第二引数にejsファイルで使用しているプレースホルダの値をkey-value形式で設定する

    // renderは一つのエントリURLに対して一回のみ使えるので、複数件バインドしたい場合はオブジェクトにくるんでVIEWに渡す
    res.render('movieListUp', {
        message: 'fetched movie list'
    });
});

app.get('/apiListUp', function (req, res) {
    // 第一引数にviewsフォルダを起点とした、ejsファイルの拡張子を覗いたファイル名を指定する
    // 第二引数にejsファイルで使用しているプレースホルダの値をkey-value形式で設定する

    // renderは一つのエントリURLに対して一回のみ使えるので、複数件バインドしたい場合はオブジェクトにくるんでVIEWに渡す
    res.render('apiListUp', {
        items: apiDataList,
        message: 'registered api list',
    });
});

app.post('/execApiCall', function (req, res) {
    // 第一引数にviewsフォルダを起点とした、ejsファイルの拡張子を覗いたファイル名を指定する
    // 第二引数にejsファイルで使用しているプレースホルダの値をkey-value形式で設定する

    let postData = req.body;

    console.log(postData);

    //https://stackoverflow.com/questions/45018338/javascript-fetch-api-how-to-save-output-to-variable-as-an-object-not-the-prom/45018619
    let apiCallResult;
    fetch(postData.url, { method: 'GET' })
        .then((res) => res.json())
        .then((json) => apiCallResult = json)
        .then(() => {
            console.log(apiCallResult);

            let saveDirectoryName = saveDirectoryRootName + '/' + postData.url.replace(/.*\/\//, '').replace(/\/.*/, '').split('.').reverse().join('_');

            //保存ディレクトリ作成
            fs.mkdir(saveDirectoryName, { recursive: true }, (err) => {
                if (err) throw err;
            });
            console.log(saveDirectoryName);

            let saveFileName = uuid.v4() + '.json';

            //ファイル保存
            writeFile(saveDirectoryName + '/' + saveFileName,JSON.stringify(apiCallResult, null , "\t"));

            console.log(saveDirectoryName + '/' + saveFileName);

            // renderは一つのエントリURLに対して一回のみ使えるので、複数件バインドしたい場合はオブジェクトにくるんでVIEWに渡す
            return res.render('apiCallResult', {
                name: postData.name,
                url: postData.url,
                description: postData.description,
                apiCallResult: JSON.stringify(apiCallResult, null, "\t"),
                downloadFullPathFileName: saveDirectoryName + '/' + saveFileName,
                downloadFileName : saveFileName
            });
        })
        .catch((err) => console.error(err));

});

//https://stackoverflow.com/questions/18008620/node-js-express-js-app-only-works-on-port-3000
app.listen(app.get('port'));
